# Supabase移行計画：エンティティ/型管理の改善

## Context

現在FirestoreをデータソースとしているScan Code Webアプリを、Supabaseへ移行する。
`qr_code_groups`テーブルはSupabase上に作成済みで、データ取得まで成功している。
しかし暫定的に作成した`CondeGroupEntry.ts`には以下の問題がある：
- **ファイル名typo**（`Conde` → `Code`）
- **型の誤り**（`created_at: number` → Supabaseは`string`を返す）
- **Supabaseクライアントがリポジトリ内で直接初期化**されている（シングルトン違反）
- スキーマが変わるたびに手動で型を修正しなければならない

**解決策**: `supabase gen types` で型を自動生成し、DB変更に追従できる型安全な構造にする。

---

## 推奨アプローチ：Supabase Type Generation + シングルトンクライアント

### 前提作業：Supabaseの`qr_codes`テーブルを作成

個別コード移行先テーブルをSupabaseに作成（Firestoreの`scanned_code`サブコレクションに相当）：

```sql
create table public.qr_codes (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.qr_code_groups(id) on delete cascade,
  code       text not null,
  done       boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.qr_codes enable row level security;
```

### Step 1: Supabase CLIで型を自動生成

```bash
# インストール
brew install supabase/tap/supabase

# ローカルプロジェクトの初期化（supabase/config.tomlが生成される）
supabase init

# ログインとプロジェクトリンク
supabase login
supabase link --project-ref uzgqbrjjsvjgeyfdrxsb # ダッシュボードのURLから取得

# 型生成
mkdir -p src/types
supabase gen types typescript --linked > src/types/database.types.ts
```

`package.json`にスクリプト追加：
```json
"types:supabase": "supabase gen types typescript --linked > src/types/database.types.ts"
```

### Step 2: `src/supabase.ts`を新規作成（`firebase.ts`対称の構造）

**新規ファイル**: `src/supabase.ts`
```typescript
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types/database.types.ts";

const supabase = createClient<Database>(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export { supabase };
```

### Step 3: エンティティを`database.types.ts`の型エイリアスに置換

**削除**: `src/entity/supabase/CondeGroupEntry.ts`（typoあり暫定ファイル）

**新規作成**: `src/entity/supabase/CodeGroupEntry.ts`
```typescript
import type { Database } from "../../types/database.types.ts";
export type CodeGroupEntry = Database['public']['Tables']['qr_code_groups']['Row'];
export type CodeGroupEntryList = CodeGroupEntry[];
```

**新規作成**: `src/entity/supabase/CodeEntry.ts`
```typescript
import type { Database } from "../../types/database.types.ts";
export type CodeEntry = Database['public']['Tables']['qr_codes']['Row'];
export type CodeList = CodeEntry[];
```

**新規作成**: `src/types/view.types.ts`（コンポーネント向け合成型）
```typescript
import type { CodeGroupEntry } from "../entity/supabase/CodeGroupEntry.ts";
import type { CodeList } from "../entity/supabase/CodeEntry.ts";

// ScanGroupList等が使う合成型（Firebase版CodeGroupEntryと同じ形）
export type SynchronizedGroup = CodeGroupEntry & { codes: CodeList };
export type SynchronizedGroupList = SynchronizedGroup[];
```

### Step 4: リポジトリを完成させる（Realtime対応）

**修正**: `src/repository/scannedCodeRepositorySupabase.ts`

- クライアントを`../supabase.ts`からimport（インライン初期化を削除）
- `subscribeGroups()` / `subscribeAllCodes()`をSupabase Realtimeで実装
- `updateCodeStatus()`を実装
- 戻り値を`() => void`に統一（Firebase互換）

```typescript
import { supabase } from "../supabase.ts";
import type { CodeGroupEntryList } from "../entity/supabase/CodeGroupEntry.ts";
import type { CodeList } from "../entity/supabase/CodeEntry.ts";

type Unsubscribe = () => void;

const scannedCodeRepositorySupabase = {
    subscribeGroups(onUpdate: (groups: CodeGroupEntryList) => void): Unsubscribe {
        // 初回取得 + Realtimeチャンネル
        supabase.from('qr_code_groups').select('*').order('created_at', { ascending: false })
            .then(({ data }) => { if (data) onUpdate(data); });
        const ch = supabase.channel('qr_code_groups_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'qr_code_groups' }, async () => {
                const { data } = await supabase.from('qr_code_groups').select('*').order('created_at', { ascending: false });
                if (data) onUpdate(data);
            }).subscribe();
        return () => { supabase.removeChannel(ch); };
    },
    subscribeAllCodes(onUpdate: (codes: CodeList) => void): Unsubscribe {
        supabase.from('qr_codes').select('*').order('created_at', { ascending: false })
            .then(({ data }) => { if (data) onUpdate(data); });
        const ch = supabase.channel('qr_codes_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'qr_codes' }, async () => {
                const { data } = await supabase.from('qr_codes').select('*').order('created_at', { ascending: false });
                if (data) onUpdate(data);
            }).subscribe();
        return () => { supabase.removeChannel(ch); };
    },
    async updateCodeStatus(groupID: string, codeID: string, done: boolean): Promise<void> {
        const { error } = await supabase.from('qr_codes').update({ done }).eq('id', codeID).eq('group_id', groupID);
        if (error) throw error;
    },
};
export default scannedCodeRepositorySupabase;
```

**Supabase Realtime を有効化するための前提**: ダッシュボードの Database → Replication で`qr_code_groups`と`qr_codes`のレプリケーションを有効化する。

### Step 5: `useScanDataSupabase.ts`フックを作成

**新規作成**: `src/hooks/useScanDataSupabase.ts`

`useScanData.ts`と同じインターフェースで、`scannedCodeRepositorySupabase`を使用。
データの合成は`group_id`でフィルタ（FirebaseのparentIdに相当）。

### Step 6: `Content.tsx`を更新

`useScanData` → `useScanDataSupabase`に切り替え、Supabase側のデータで表示する。

---

## 変更ファイル一覧

| 操作 | ファイル |
|------|---------|
| 新規 | `src/types/database.types.ts`（自動生成） |
| 新規 | `src/types/view.types.ts` |
| 新規 | `src/supabase.ts` |
| 新規 | `src/entity/supabase/CodeGroupEntry.ts` |
| 新規 | `src/entity/supabase/CodeEntry.ts` |
| 新規 | `src/hooks/useScanDataSupabase.ts` |
| 修正 | `src/repository/scannedCodeRepositorySupabase.ts` |
| 修正 | `src/pages/Content.tsx` |
| 修正 | `package.json` |
| 削除 | `src/entity/supabase/CondeGroupEntry.ts` |

---

## 検証方法

1. `npm run types:supabase` を実行してTypeScriptエラーなし確認
2. `npm run dev` でアプリ起動
3. `Content.tsx`のコンソールにエラーなし、グループ一覧が表示される
4. Supabaseダッシュボードでデータを変更し、アプリがリアルタイム更新されるか確認
5. チェックボックス操作で`done`カラムが更新されるか確認

import type { Database } from "../../types/database.types"
/**
 * Supabaseのcode_groupテーブルのエントリーを表すインターフェース
 * 
 * Supabase上では、qr_code_groupテーブルは以下のような構造を持つと仮定しています。
 * - id: string (uuid) primary key
 * - name: string (グループの名前) not null
 * - created_at: number (timestamptz) not null
 * - updated_at: number (timestamptz) not null
 */
export type CodeGroupEntry = Database["public"]["Tables"]["qr_code_groups"]["Row"]
export type CodeGroupEntryList = CodeGroupEntry[]

import {createClient} from "@supabase/supabase-js";
import type {CodeGroupEntryList} from "../entity/supabase/CodeGroupEntry.ts";

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

const scannedCodeRepositorySupabase = {
    getCodeGroupList: async (): Promise<CodeGroupEntryList> => {
        const {data, error} = await supabase.from('qr_code_groups').select('*');
        if (error) {
            throw error;
        }
        return data.map((entry) => ({
            id: entry.id,
            name: entry.name,
            created_at: entry.created_at,
            updated_at: entry.updated_at,
       }));
},
}

export default scannedCodeRepositorySupabase;
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types/database.types.ts";

const spabase = createClient<Database>(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)

export default spabase;
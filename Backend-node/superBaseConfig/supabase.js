
import { createClient } from '@supabase/supabase-js';
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if(!supabaseUrl || !supabaseKey){
    throw error("Supabase Key and URL required")
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase
        
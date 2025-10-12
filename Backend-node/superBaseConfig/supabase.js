// supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // use service key for full backend access

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL and Service Role Key are required");
}

// Only two arguments here: URL and key
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

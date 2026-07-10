import { createClient } from "@supabase/supabase-js";

// Clean up environment variables in case they were pasted with quotes, spaces, or missing https://
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
supabaseUrl = supabaseUrl.replace(/['"]/g, "").trim();
if (supabaseUrl && !supabaseUrl.startsWith("http")) {
  supabaseUrl = "https://" + supabaseUrl;
}

const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "")
  .replace(/['"]/g, "")
  .trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

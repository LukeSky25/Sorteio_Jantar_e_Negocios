import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://syuujuntgrmxgmtcjxnn.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5dXVqdW50Z3JteGdtdGNqeG5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzOTA5NjQsImV4cCI6MjA2Njk2Njk2NH0.CEZUsOmBl24lqC1mr8xJYnw0x73yGedGCVj1cXNB5Ow";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

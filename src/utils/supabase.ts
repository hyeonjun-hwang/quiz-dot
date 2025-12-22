import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

// 환경 변수 검증
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.\n' +
    `VITE_SUPABASE_URL: ${supabaseUrl ? 'OK' : 'MISSING'}\n` +
    `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY: ${supabaseKey ? 'OK' : 'MISSING'}`
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };

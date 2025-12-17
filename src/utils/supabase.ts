
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Extract project ID from URL
const projectId = supabaseUrl?.split('//')[1]?.split('.')[0] || '';
const publicAnonKey = supabaseKey;

export { supabase, projectId, publicAnonKey }

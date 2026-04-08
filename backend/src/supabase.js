const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ CRITICAL: Supabase environment variables are missing!');
  console.error('Check your .env file for SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(
  supabaseUrl || 'http://localhost', 
  supabaseKey || 'dummy',
  {
    auth: {
      persistSession: false
    }
  }
);

console.log('✅ Supabase client initialized' + (supabaseUrl ? ` for ${supabaseUrl}` : ' with fallback URL'));

module.exports = supabase;

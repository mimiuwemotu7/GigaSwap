require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing SUPABASE env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

(async () => {
  console.log('Testing connectivity to', supabaseUrl);
  try {
    // Simple HEAD request to REST endpoint
    const head = await fetch(`${supabaseUrl}/rest/v1/`, { method: 'HEAD', headers: { apikey: supabaseAnonKey } });
    console.log('REST HEAD status:', head.status);
  } catch (err) {
    console.error('REST HEAD failed:', err.message);
  }

  try {
    // list tables via information_schema
    const { data, error } = await supabase.rpc('pg_catalog.pg_tables');
    // fallback to query via SQL
    if (error) {
      const q = `SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog','information_schema') ORDER BY table_schema, table_name;`;
      const res = await supabase.rpc('sql', { q });
      console.log('sql rpc result:', res);
    } else {
      console.log('rpc data length:', (data && data.length) || 0);
    }
  } catch (err) {
    console.error('Schema fetch failed:', err.message);
  }

  // Use safe query to list tables using PostgREST (REST) endpoint
  try {
    const resp = await fetch(`${supabaseUrl}/rest/v1/?select=`, { headers: { apikey: supabaseAnonKey }, method: 'GET' });
    console.log('Public REST list response status:', resp.status);
  } catch (err) {
    console.error('Public REST list failed:', err.message);
  }

  process.exit(0);
})();

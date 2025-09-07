require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing env vars NEXT_PUBLIC_SUPABASE_URL/ANON_KEY');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseAnonKey);

(async () => {
  try {
  const email = process.env.TEST_EMAIL || 'mimiotu@proton.me';
    const password = process.env.TEST_PASSWORD || 'Test1234!';
    console.log('Signup (may be skipped if user exists):', email);
    const { data: signupData, error: signupErr } = await supabase.auth.signUp({ email, password });
    if (signupErr) {
      console.warn('signupErr (continuing):', signupErr.message || signupErr);
    } else {
      console.log('signup success', signupData);
    }

    // Attempt sign in (always try)
    console.log('Signing in...');
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signInErr) {
      console.error('signInErr', signInErr);
      return process.exit(1);
    }
    console.log('signIn success', signInData);

    // Verify profile existence. Prefer SELECT first; if missing, attempt insert.
    const userId = signInData.user.id;
    console.log('userId', userId);

    let profileData = null;
    try {
      const { data: existing, error: existingErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (existing && !existingErr) {
        profileData = existing;
        console.log('profile already exists (found)');
      } else {
        // Try insert (trigger may have already created it; handle duplicate key as success)
        const { data: inserted, error: insertErr } = await supabase
          .from('profiles')
          .insert({ id: userId, email, username: 'smoketest' })
          .select()
          .single();
        if (insertErr) {
          if (insertErr.code === '23505' || (insertErr.details || '').includes('duplicate key')) {
            console.log('profile insert reported duplicate — likely created by DB trigger');
            const { data: fetched } = await supabase.from('profiles').select('*').eq('id', userId).single();
            profileData = fetched;
          } else {
            console.warn('profile insert error', insertErr);
          }
        } else {
          profileData = inserted;
        }
      }
    } catch (err) {
      console.warn('profile check/insert flow error', err);
    }

    console.log('profileData', profileData);

    console.log('E2E smoke done');
    process.exit(0);
  } catch (err) {
    console.error('e2e error', err);
    process.exit(1);
  }
})();

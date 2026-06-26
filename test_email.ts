import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');

async function testEmail() {
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@tuslibrosya.app',
    password: 'tuslibrosya'
  });
  console.log(error ? error.message : "Success!");
}
testEmail();

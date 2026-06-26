import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');

async function testLogin() {
  console.log("Probando admin / tuslibrosya...");
  const { error: err1 } = await supabase.auth.signInWithPassword({
    email: 'tuslibrosya@gmail.com',
    password: 'tuslibrosya'
  });
  console.log(err1 ? "Error 1: " + err1.message : "Exito 1!");

  console.log("Probando admin / tuslibrosya123...");
  const { error: err2 } = await supabase.auth.signInWithPassword({
    email: 'tuslibrosya@gmail.com',
    password: 'tuslibrosya123'
  });
  console.log(err2 ? "Error 2: " + err2.message : "Exito 2!");
}
testLogin();

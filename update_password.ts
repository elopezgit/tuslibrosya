import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');

async function updatePassword() {
  console.log("Iniciando sesión como tuslibrosya@gmail.com...");
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'tuslibrosya@gmail.com',
    password: 'tuslibrosya'
  });

  if (signInError) {
    console.error("❌ Error al iniciar sesión:", signInError.message);
    return;
  }

  console.log("Sesión iniciada. Actualizando contraseña...");
  const { error: updateError } = await supabase.auth.updateUser({
    password: 'tuslibrosya123'
  });

  if (updateError) {
    console.error("❌ Error al actualizar contraseña:", updateError.message);
  } else {
    console.log("✅ Contraseña actualizada exitosamente a tuslibrosya123!");
  }
}
updatePassword();

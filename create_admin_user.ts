import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  // Tomar argumentos de la consola (ej: npx tsx create_admin_user.ts topedebar miclave123)
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error("❌ Uso incorrecto. Debes proporcionar el nombre de la empresa (slug) y la contraseña.");
    console.log("👉 Ejemplo: npx tsx create_admin_user.ts topedebar miclave123");
    process.exit(1);
  }

  const empresaSlug = args[0].toLowerCase();
  const password = args[1];
  const email = `${empresaSlug}@gmail.com`;

  console.log(`Creando usuario ${email} para la empresa '${empresaSlug}'...`);
  
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        role: 'admin',
        empresa_slug: empresaSlug
      }
    }
  });

  if (error) {
    console.error("❌ Error al crear usuario:", error.message);
  } else {
    console.log("✅ Usuario creado exitosamente!");
    if (data.user?.identities?.length === 0) {
      console.log("⚠️ El usuario ya existía previamente.");
    }
    console.log(`\n🎉 Ya puedes iniciar sesión en /${empresaSlug}/admin`);
    console.log(`Usuario en pantalla: admin`);
    console.log(`Contraseña: ${password}\n`);
  }
}

createAdminUser();

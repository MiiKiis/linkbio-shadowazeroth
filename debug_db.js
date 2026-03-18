const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Leer variables de .env.local manualmente para evitar fallos de librerías
const env = fs.readFileSync('.env.local', 'utf8');
const getVar = (name) => env.match(new RegExp(`${name}=(.*)`))?.[1]?.trim();

async function dump() {
  const url = getVar('SUPABASE_URL');
  const key = getVar('SUPABASE_ANON_KEY');
  
  if (!url || !key) {
    console.error("No se encontraron credenciales de Supabase en .env.local");
    return;
  }

  const supabase = createClient(url, key);
  
  console.log("--- SETTINGS ---");
  const { data: settings } = await supabase.from('admin_settings').select('*').eq('id', 1).single();
  console.log(JSON.stringify(settings, null, 2));
  
  console.log("\n--- BUTTONS (ALL) ---");
  const { data: buttons } = await supabase.from('buttons').select('*').order('position');
  console.log(JSON.stringify(buttons, null, 2));
}

dump();

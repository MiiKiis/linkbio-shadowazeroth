-- Actualización de la tabla admin_settings para control total
-- Ejecuta este SQL en el panel de Supabase (SQL Editor)

ALTER TABLE admin_settings 
ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '/assets/avatar.png',
ADD COLUMN IF NOT EXISTS server_status TEXT DEFAULT 'Online',
ADD COLUMN IF NOT EXISTS footer_text TEXT DEFAULT '© 2026 Shadow Azeroth · Todos los derechos reservados',
ADD COLUMN IF NOT EXISTS particle_color_1 TEXT DEFAULT '#bf00ff',
ADD COLUMN IF NOT EXISTS particle_color_2 TEXT DEFAULT '#00ffff',
ADD COLUMN IF NOT EXISTS background_url TEXT DEFAULT '';

-- Asegurar que la fila 1 tiene valores por defecto si no existen
UPDATE admin_settings 
SET 
  avatar_url = COALESCE(avatar_url, '/assets/avatar.png'),
  server_status = COALESCE(server_status, 'Online'),
  footer_text = COALESCE(footer_text, '© 2026 Shadow Azeroth · Todos los derechos reservados'),
  particle_color_1 = COALESCE(particle_color_1, '#bf00ff'),
  particle_color_2 = COALESCE(particle_color_2, '#00ffff')
WHERE id = 1;

-- Opcional: Si quieres habilitar el control de estado más visualmente puedes usar un boolean, 
-- pero TEXT 'Online'/'Offline' es más directo para este caso.

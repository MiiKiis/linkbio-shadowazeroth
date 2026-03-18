-- =============================================
-- Shadow Azeroth - Link in Bio
-- Supabase Database Setup
-- =============================================

-- Tabla de botones
CREATE TABLE IF NOT EXISTS buttons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT DEFAULT '',
    url TEXT NOT NULL,
    icon_name TEXT NOT NULL DEFAULT 'link',
    image_url TEXT DEFAULT '',
    btn_style TEXT DEFAULT 'default',
    color TEXT DEFAULT '#7b2ff7',
    position INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de configuración admin
CREATE TABLE IF NOT EXISTS admin_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    admin_password TEXT NOT NULL DEFAULT 'shadowazeroth2026',
    site_name TEXT DEFAULT 'Shadow Azeroth',
    site_tagline TEXT DEFAULT 'Servidor World of Warcraft 3.3.5a'
);

-- Insertar configuración por defecto
INSERT INTO admin_settings (id, admin_password, site_name, site_tagline)
VALUES (1, 'shadowazeroth2026', 'Shadow Azeroth', 'Servidor World of Warcraft 3.3.5a')
ON CONFLICT (id) DO NOTHING;

-- Botones de ejemplo
-- Si la tabla ya existe, añadir las nuevas columnas (ejecuta solo estas líneas si ya tienes la tabla):
ALTER TABLE buttons ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';
ALTER TABLE buttons ADD COLUMN IF NOT EXISTS btn_style TEXT DEFAULT 'default';

-- Botones de ejemplo
INSERT INTO buttons (title, subtitle, url, icon_name, color, position, is_active, is_primary)
VALUES
    ('Descargar Launcher', 'Windows · v2.0', '#', 'download', '#7b2ff7', 0, true, true),
    ('Página Web', 'shadowazeroth.com', '#', 'globe', '#7b2ff7', 1, true, false),
    ('Grupo de WhatsApp', 'Comunidad activa', '#', 'whatsapp', '#25D366', 2, true, false),
    ('YouTube', 'Videos y guías', '#', 'youtube', '#FF0000', 3, true, false),
    ('Telegram', 'Noticias y actualizaciones', '#', 'telegram', '#0088cc', 4, true, false),
    ('Discord', 'Comunidad y soporte', '#', 'discord', '#5865F2', 5, true, false);

-- Habilitar RLS
ALTER TABLE buttons ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Politicas: lectura pública de botones activos
CREATE POLICY "Botones visibles para todos"
    ON buttons FOR SELECT
    USING (is_active = true);

-- Politica: operaciones completas (para admin via anon key con service role o desactivar RLS en dev)
CREATE POLICY "Admin full access buttons"
    ON buttons FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admin full access settings"
    ON admin_settings FOR ALL
    USING (true)
    WITH CHECK (true);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER buttons_updated_at
    BEFORE UPDATE ON buttons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

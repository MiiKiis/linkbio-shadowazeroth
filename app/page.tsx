import Image from 'next/image';
import ParticlesCanvas from '@/components/ParticlesCanvas';
import { ICONS, PLATFORM_CLASSES } from '@/lib/icons';
import { getSupabase } from '@/lib/supabase';

async function getButtons() {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from('buttons')
      .select('*')
      .eq('is_active', true)
      .order('position', { ascending: true });
    
    if (error) {
      console.error("[DB] Error cargando botones:", error);
      return null;
    }
    return data;
  } catch (err: any) {
    console.error("[DB] Crash cargando botones:", err.message);
    return null;
  }
}

async function getSettings() {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from('admin_settings')
      .select('site_name, site_tagline, avatar_url, server_status, footer_text, background_url, particle_color_1, particle_color_2')
      .eq('id', 1)
      .single();
    if (error) {
      console.error("[DB] Error cargando settings:", error);
      return null;
    }
    return data;
  } catch (err: any) {
    console.error("[DB] Crash cargando settings:", err.message);
    return null;
  }
}

const FALLBACK_BUTTONS = [
  { id: 'f1', title: 'Descargar Launcher', subtitle: 'Windows · v2.0', url: '#', icon_name: 'download', btn_style: 'default', color: '#7b2ff7', is_primary: true, is_active: true, image_url: '' },
  { id: 'f2', title: 'Página Web',          subtitle: 'shadowazeroth.com', url: '#', icon_name: 'globe',    btn_style: 'default', color: '#7b2ff7', is_primary: false, is_active: true, image_url: '' },
  { id: 'f3', title: 'Grupo de WhatsApp',   subtitle: 'Comunidad activa',  url: '#', icon_name: 'whatsapp', btn_style: 'default', color: '#25D366', is_primary: false, is_active: true, image_url: '' },
  { id: 'f4', title: 'YouTube',             subtitle: 'Videos y guías',    url: '#', icon_name: 'youtube',  btn_style: 'default', color: '#FF0000', is_primary: false, is_active: true, image_url: '' },
  { id: 'f5', title: 'Telegram',            subtitle: 'Noticias y actualizaciones', url: '#', icon_name: 'telegram', btn_style: 'default', color: '#0088cc', is_primary: false, is_active: true, image_url: '' },
  { id: 'f6', title: 'Discord',             subtitle: 'Comunidad y soporte', url: '#', icon_name: 'discord',  btn_style: 'default', color: '#5865F2', is_primary: false, is_active: true, image_url: '' },
];

function hexToRgba(hex: string, alpha: number) {
  hex = hex || '#7b2ff7';
  const r = parseInt(hex.slice(1, 3), 16) || 123;
  const g = parseInt(hex.slice(3, 5), 16) || 47;
  const b = parseInt(hex.slice(5, 7), 16) || 247;
  return `rgba(${r},${g},${b},${alpha})`;
}


export default async function Home() {
  const dbButtons = await getButtons();
  const settings = await getSettings();
  const buttons = dbButtons && dbButtons.length > 0 ? dbButtons : FALLBACK_BUTTONS;

  const siteName = settings?.site_name || 'Shadow Azeroth';
  const siteTagline = settings?.site_tagline || 'Servidor World of Warcraft 3.3.5a';
  const avatarUrl = settings?.avatar_url || '/assets/avatar.png';
  const serverStatus = settings?.server_status || 'Online';
  const footerText = settings?.footer_text || '© 2026 Shadow Azeroth · Todos los derechos reservados';
  const bgUrl = settings?.background_url || '';

  // Determinar color de la dot de estado
  let statusClass = 'status-dot';
  if (serverStatus === 'Offline') statusClass += ' status-offline';
  else if (serverStatus === 'Mantenimiento') statusClass += ' status-maint';

  return (
    <>
      <ParticlesCanvas 
        color1={settings?.particle_color_1 || '#bf00ff'} 
        color2={settings?.particle_color_2 || '#00ffff'} 
      />
      <div 
        className="bg-overlay" 
        style={bgUrl ? { backgroundImage: `url(${bgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined} 
      />

      <main className="container">
        {/* Profile Section */}
        <div className="profile-section">
          <div className="avatar-ring">
            <div className="avatar-glow" />
            <Image
              src={avatarUrl}
              alt={siteName}
              width={122}
              height={122}
              className="avatar"
              priority
              unoptimized={avatarUrl.startsWith('http')}
            />
          </div>
          <h1 className="profile-name">{siteName}</h1>
          <p className="profile-tagline">{siteTagline}</p>
          <div className="status-badge">
            <span className={statusClass} />
            <span>Servidor {serverStatus}</span>
          </div>
        </div>

        {/* Links Section */}
        <div className="links-section" id="links-container">
          {buttons.map((btn: any, index: number) => {
            let classes = 'link-btn';
            if (btn.is_primary) classes += ' link-btn-primary';
            const style = btn.btn_style || 'default';
            if (style !== 'default') classes += ' link-btn-' + style;
            else if (PLATFORM_CLASSES[btn.icon_name]) classes += ' ' + PLATFORM_CLASSES[btn.icon_name];

            const iconSvg = ICONS[btn.icon_name] || ICONS.link;
            const iconColor = btn.color || '#7b2ff7';

            return (
              <a
                key={btn.id}
                href={btn.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={classes}
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
              >
                <div
                  className="btn-icon"
                  style={!btn.is_primary ? { '--icon-color': iconColor } as any : undefined}
                >
                  {btn.image_url ? (
                    <img src={btn.image_url} alt="" style={{ width: 24, height: 24, objectFit: 'contain', borderRadius: 4 }} />
                  ) : (
                    <span
                      style={{ display: 'flex', color: btn.is_primary ? '#fff' : iconColor }}
                      dangerouslySetInnerHTML={{ __html: iconSvg }}
                    />
                  )}
                </div>
                <div className="btn-content">
                  <span className="btn-label">{btn.title}</span>
                  <span className="btn-sublabel">{btn.subtitle || ''}</span>
                </div>
                <div className="btn-arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
                <div className="btn-shine" />
              </a>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="footer">
          <p>{footerText}</p>
          <p className="footer-sub">World of Warcraft® es una marca registrada de Blizzard Entertainment®</p>
        </footer>
      </main>
    </>
  );
}


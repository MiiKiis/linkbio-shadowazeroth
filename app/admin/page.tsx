'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ICONS, STYLE_COLORS } from '@/lib/icons';
import '../../styles/admin.css';

// ─── Types ────────────────────────────────────────────────
interface Button {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  icon_name: string;
  image_url: string;
  btn_style: string;
  color: string;
  position: number;
  is_active: boolean;
  is_primary: boolean;
}

interface SiteSettings {
  site_name: string;
  site_tagline: string;
  admin_password?: string;
  avatar_url: string;
  server_status: string;
  footer_text: string;
  particle_color_1: string;
  particle_color_2: string;
  background_url: string;
}

// ─── Helpers ──────────────────────────────────────────────
function hexToRgba(hex: string, alpha: number) {
  hex = hex || '#7b2ff7';
  const r = parseInt(hex.slice(1, 3), 16) || 123;
  const g = parseInt(hex.slice(3, 5), 16) || 47;
  const b = parseInt(hex.slice(5, 7), 16) || 247;
  return `rgba(${r},${g},${b},${alpha})`;
}

const ICON_NAMES = Object.keys(ICONS);
const STYLE_OPTIONS = [
  { style: 'default', color: 'linear-gradient(135deg,#7b2ff7,#9d5cfa)', label: 'Eándar' },
  { style: 'legendary', color: 'linear-gradient(135deg,#f59e0b,#fcd34d)', label: 'Legendario' },
  { style: 'epic', color: 'linear-gradient(135deg,#7c3aed,#c084fc)', label: 'Épico' },
  { style: 'rare', color: 'linear-gradient(135deg,#2563eb,#60a5fa)', label: 'Raro' },
  { style: 'uncommon', color: 'linear-gradient(135deg,#16a34a,#4ade80)', label: 'Poco Común' },
  { style: 'fire', color: 'linear-gradient(135deg,#dc2626,#fb923c)', label: 'Fuego' },
  { style: 'frost', color: 'linear-gradient(135deg,#0891b2,#67e8f9)', label: 'Escarcha' },
  { style: 'shadow', color: 'linear-gradient(135deg,#1e1b4b,#6d28d9)', label: 'Sombras' },
];

const DEFAULT_SETTINGS: SiteSettings = {
  site_name: 'Shadow Azeroth',
  site_tagline: 'Servidor World of Warcraft 3.3.5a',
  avatar_url: '/assets/avatar.png',
  server_status: 'Online',
  footer_text: '© 2026 Shadow Azeroth · Todos los derechos reservados',
  particle_color_1: '#bf00ff',
  particle_color_2: '#00ffff',
  background_url: ''
};

// ─── Main Component ───────────────────────────────────────
export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [loginPwd, setLoginPwd] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [buttons, setButtons] = useState<Button[]>([]);
  const [activeTab, setActiveTab] = useState<'links' | 'identity' | 'visual' | 'security'>('links');
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ id: string; title: string } | null>(null);
  const [form, setForm] = useState<any>({ title: '', subtitle: '', url: '', icon_name: 'link', is_active: true });
  const [editId, setEditId] = useState<string | null>(null);

  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [savingSettings, setSavingSettings] = useState(false);

  const dragSrc = useRef<number | null>(null);
  const toastId = useRef(0);

  // ── Session ──
  useEffect(() => {
    const t = sessionStorage.getItem('sa_admin_token');
    if (t) setToken(t);
  }, []);

  // ── Load Data ──
  const loadData = useCallback(async (t: string) => {
    try {
      const h = { Authorization: 'Bearer ' + t };
      const [resB, resS] = await Promise.all([
        fetch('/api/buttons', { headers: h }),
        fetch('/api/settings', { headers: h })
      ]);
      
      if (resB.status === 401 || resS.status === 401) {
        sessionStorage.removeItem('sa_admin_token');
        setToken(null);
        return;
      }

      const [dataB, dataS] = await Promise.all([resB.json(), resS.json()]);
      if (Array.isArray(dataB)) setButtons(dataB);
      if (dataS && !dataS.error) setSettings({ ...DEFAULT_SETTINGS, ...dataS, admin_password: '' });
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { if (token) loadData(token); }, [token, loadData]);

  const showToast = (msg: string, type = 'success') => {
    const id = toastId.current++;
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  };

  // ── Handlers ──
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: loginPwd }),
      });
      const data = await res.json();
      if (data.ok) {
        sessionStorage.setItem('sa_admin_token', data.token);
        setToken(data.token);
      } else setLoginError('Contraseña incorrecta');
    } catch { setLoginError('Error de servidor'); }
    setLoginLoading(false);
  }

  async function saveButton(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(editId ? `/api/buttons/${editId}` : '/api/buttons', {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        showToast(editId ? 'Botón actualizado' : 'Botón creado');
        setModalOpen(false);
        loadData(token!);
      }
    } catch { showToast('Error al guardar', 'error'); }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const body = { ...settings };
      if (!body.admin_password) delete body.admin_password;
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        showToast('Configuración guardada ✓');
        setSettings(p => ({ ...p, admin_password: '' }));
      } else {
        const err = await res.json();
        // Si el error es falta de columnas, avisamos al usuario
        if (err.error?.includes('column')) {
          showToast('Error: Faltan columnas en la DB. Revisa el SQL.', 'error');
        } else throw new Error();
      }
    } catch { showToast('Error al guardar cambios', 'error'); }
    setSavingSettings(false);
  }

  async function reorder(from: number, to: number) {
    const next = [...buttons];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    next.forEach((b, i) => b.position = i);
    setButtons([...next]);
    try {
      await fetch('/api/buttons-reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(next.map(b => ({ id: b.id, position: b.position }))),
      });
    } catch { showToast('Error al reordenar', 'error'); }
  }

  // ── Render Components ──
  if (!token) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="login-logo">⚔️</div>
          <h1 className="login-title">Shadow Azeroth</h1>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Control de Acceso</label>
              <input type="password" placeholder="Contraseña Maestra" value={loginPwd} onChange={e => setLoginPwd(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loginLoading}>{loginLoading ? 'Verificando...' : 'Entrar al Panel'}</button>
            {loginError && <p className="login-error">{loginError}</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src={settings.avatar_url} className="sidebar-avatar" alt="Avatar" />
          <h2 className="sidebar-title">{settings.site_name}</h2>
          <span className={`sidebar-status ${settings.server_status === 'Online' ? 'active' : ''}`}>{settings.server_status}</span>
        </div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'links' ? 'active' : ''}`} onClick={() => setActiveTab('links')}>🔗 Enlaces</button>
          <button className={`nav-item ${activeTab === 'identity' ? 'active' : ''}`} onClick={() => setActiveTab('identity')}>🛡️ Identidad</button>
          <button className={`nav-item ${activeTab === 'visual' ? 'active' : ''}`} onClick={() => setActiveTab('visual')}>✨ Estética</button>
          <button className={`nav-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>🔑 Seguridad</button>
        </nav>
        <div className="sidebar-footer">
          <a href="/" target="_blank" className="btn btn-ghost btn-full">Ver Sitio Web</a>
          <button onClick={() => { sessionStorage.removeItem('sa_admin_token'); setToken(null); }} className="btn btn-danger btn-full">Cerrar Sesión</button>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-container">
          {activeTab === 'links' && (
            <section className="fade-in">
              <header className="section-header">
                <div>
                  <h1>Gestión de Enlaces</h1>
                  <p>Añade o reordena los botones que ven tus usuarios.</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditId(null); setForm({ title: '', subtitle: '', url: '', icon_name: 'link', is_active: true, position: buttons.length }); setModalOpen(true); }}>
                  + Nuevo Enlace
                </button>
              </header>
              <div className="links-grid">
                {buttons.map((btn, i) => (
                  <div key={btn.id} className="admin-card link-card" draggable onDragStart={() => dragSrc.current = i} onDragOver={e => e.preventDefault()} onDrop={() => { if (dragSrc.current !== null) reorder(dragSrc.current, i); dragSrc.current = null; }}>
                    <div className="card-drag">☰</div>
                    <div className="card-icon" style={{ color: btn.color }}>
                      <span dangerouslySetInnerHTML={{ __html: ICONS[btn.icon_name] || ICONS.link }} />
                    </div>
                    <div className="card-info">
                      <h4>{btn.title}</h4>
                      <p>{btn.url}</p>
                    </div>
                    <div className="card-actions">
                      <button onClick={() => { setEditId(btn.id); setForm(btn); setModalOpen(true); }}>Editar</button>
                      <button className="danger" onClick={() => setDeleteModal({ id: btn.id, title: btn.title })}>Borrar</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'identity' && (
            <section className="fade-in">
              <header className="section-header">
                 <h1>Identidad del Sitio</h1>
                 <p>Configura el nombre, logo y estado oficial del servidor.</p>
              </header>
              <form onSubmit={saveSettings} className="admin-form-card">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nombre del Proyecto</label>
                    <input type="text" value={settings.site_name} onChange={e => setSettings(p => ({ ...p, site_name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Descripción / Tagline</label>
                    <input type="text" value={settings.site_tagline} onChange={e => setSettings(p => ({ ...p, site_tagline: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Avatar / Logo (URL)</label>
                    <div className="input-with-preview">
                      <input type="text" value={settings.avatar_url} onChange={e => setSettings(p => ({ ...p, avatar_url: e.target.value }))} />
                      <img src={settings.avatar_url} alt="preview" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Estado del Servidor</label>
                    <div className="status-toggle-group">
                      <button type="button" className={`status-btn ${settings.server_status === 'Online' ? 'active green' : ''}`} onClick={() => setSettings(p => ({ ...p, server_status: 'Online' }))}>Online</button>
                      <button type="button" className={`status-btn ${settings.server_status === 'Offline' ? 'active red' : ''}`} onClick={() => setSettings(p => ({ ...p, server_status: 'Offline' }))}>Offline</button>
                      <button type="button" className={`status-btn ${settings.server_status === 'Mantenimiento' ? 'active gold' : ''}`} onClick={() => setSettings(p => ({ ...p, server_status: 'Mantenimiento' }))}>Mantenimiento</button>
                    </div>
                  </div>
                  <div className="form-group full">
                    <label>Texto pie de página (Copyright)</label>
                    <textarea value={settings.footer_text} onChange={e => setSettings(p => ({ ...p, footer_text: e.target.value }))} rows={2} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={savingSettings}>{savingSettings ? 'Guardando...' : 'Guardar Identidad'}</button>
              </form>
            </section>
          )}

          {activeTab === 'visual' && (
            <section className="fade-in">
              <header className="section-header">
                 <h1>Estética Visual</h1>
                 <p>Personaliza los colores de las partículas y la imagen de fondo.</p>
              </header>
              <form onSubmit={saveSettings} className="admin-form-card">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Color Partícula 1 (Neón)</label>
                    <div className="color-input-container">
                      <input type="color" value={settings.particle_color_1} onChange={e => setSettings(p => ({ ...p, particle_color_1: e.target.value }))} />
                      <code>{settings.particle_color_1}</code>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Color Partícula 2 (Neón)</label>
                    <div className="color-input-container">
                      <input type="color" value={settings.particle_color_2} onChange={e => setSettings(p => ({ ...p, particle_color_2: e.target.value }))} />
                      <code>{settings.particle_color_2}</code>
                    </div>
                  </div>
                  <div className="form-group full">
                    <label>Fondo del Sitio (URL de imagen)</label>
                    <input type="text" placeholder="Deja vacío para usar el fondo por defecto" value={settings.background_url} onChange={e => setSettings(p => ({ ...p, background_url: e.target.value }))} />
                    {settings.background_url && <div className="bg-preview"><img src={settings.background_url} alt="bg preview" /></div>}
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={savingSettings}>{savingSettings ? 'Guardando...' : 'Aplicar Estética'}</button>
              </form>
            </section>
          )}

          {activeTab === 'security' && (
            <section className="fade-in">
              <header className="section-header">
                 <h1>Seguridad</h1>
                 <p>Cambia la contraseña de acceso al panel de administración.</p>
              </header>
              <form onSubmit={saveSettings} className="admin-form-card">
                <div className="form-group">
                  <label>Nueva Contraseña Maestra</label>
                  <input type="password" placeholder="Ingresa nueva contraseña para cambiarla" value={settings.admin_password} onChange={e => setSettings(p => ({ ...p, admin_password: e.target.value }))} />
                  <p className="form-hint">Deja este campo vacío si no deseas cambiar la contraseña actual.</p>
                </div>
                <button type="submit" className="btn btn-danger" disabled={savingSettings}>{savingSettings ? 'Guardando...' : 'Actualizar Contraseña'}</button>
              </form>
            </section>
          )}
        </div>
      </main>

      {/* MODALS */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <header className="modal-header">
              <h2>{editId ? 'Editar Enlace' : 'Añadir Enlace'}</h2>
              <button onClick={() => setModalOpen(false)}>×</button>
            </header>
            <form onSubmit={saveButton} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Título</label>
                  <input type="text" value={form.title} onChange={e => setForm((p: any) => ({ ...p, title: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Subtítulo</label>
                  <input type="text" value={form.subtitle} onChange={e => setForm((p: any) => ({ ...p, subtitle: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label>URL (Link)</label>
                <input type="url" value={form.url} onChange={e => setForm((p: any) => ({ ...p, url: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Estilo Visual (WoW)</label>
                <div className="styles-grid">
                  {STYLE_OPTIONS.map(s => (
                    <button type="button" key={s.style} className={`style-chip ${form.btn_style === s.style ? 'active' : ''}`} onClick={() => setForm((p: any) => ({ ...p, btn_style: s.style }))}>
                      <span className="dot" style={{ background: s.color }} /> {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Icono</label>
                <div className="icons-selector">
                   {ICON_NAMES.map(name => (
                     <button type="button" key={name} className={`icon-chip ${form.icon_name === name ? 'active' : ''}`} onClick={() => setForm((p: any) => ({ ...p, icon_name: name }))} dangerouslySetInnerHTML={{ __html: ICONS[name] }} />
                   ))}
                </div>
              </div>
              <div className="form-group">
                <label>Color Personalizado</label>
                <input type="color" value={form.color} onChange={e => setForm((p: any) => ({ ...p, color: e.target.value }))} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Enlace</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="modal mini" onClick={e => e.stopPropagation()}>
            <h2>¿Borrar enlace?</h2>
            <p>Se eliminará permanentemente: <b>{deleteModal.title}</b></p>
            <div className="modal-footer">
               <button onClick={() => setDeleteModal(null)} className="btn btn-ghost">No, cancelar</button>
               <button onClick={async () => {
                 await fetch(`/api/buttons/${deleteModal.id}`, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } });
                 showToast('Enlace eliminado');
                 setDeleteModal(null);
                 loadData(token!);
               }} className="btn btn-danger">Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}

      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>
        ))}
      </div>
    </div>
  );
}

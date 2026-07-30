import { useState, useEffect } from 'react';
import { colors, radius, space } from '../../components/communityTokens';
import { CommunityHeader, CommunityAdminFonts, Button, Icon } from '../../components/CommunityAdminUI';
import { API_BASE } from '../../services/api';

// Field styling drawn from the shared community tokens so this page stops
// using its own greys and matches the dashboard, events and messages screens.
const profileLabel = { display: 'block', marginBottom: 7, fontWeight: 600, fontSize: 13.5, color: colors.onSurface };
const profileInput = { width: '100%', padding: '12px 16px', borderRadius: radius.sm, border: `1px solid ${colors.outlineVariant}`, fontSize: 15, fontFamily: 'inherit', color: colors.onSurface, background: colors.surfaceContainerLowest };
const readOnlyInput = { background: colors.surfaceContainerLow, color: colors.inkSoft, cursor: 'not-allowed' };

export default function CommunityProfile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [profileFile, setProfileFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    if (stored) {
      setUser(stored);
      setName(stored.name || '');
      setEmail(stored.email || '');
      setProfileImage(stored.profileImage || '');
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    setProfileFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!name.trim()) { setMessage({ type: 'error', text: 'Name is required.' }); setTimeout(() => setMessage(null), 3000); return; }
    setSaving(true); setMessage(null);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      if (profileFile) formData.append('profileImage', profileFile);
      const res = await fetch(`${API_BASE}/users/${user.id}/profile`, { method: 'PUT', body: formData });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Failed'); }
      const updated = await res.json();
      setUser(updated); setProfileImage(updated.profileImage || '');
      setProfileFile(null); setPreviewUrl('');
      localStorage.setItem('user', JSON.stringify(updated));
      localStorage.setItem('ss_current_user', JSON.stringify(updated));
      setMessage({ type: 'success', text: 'Profile updated!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message }); setTimeout(() => setMessage(null), 3000);
    } finally { setSaving(false); }
  };

  const displayImage = previewUrl || profileImage;
  const initials = name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'CA';

  return (
    <div style={{ minHeight: '100vh', background: colors.surface }}>
      <CommunityAdminFonts />
      <CommunityHeader title="My Profile" subtitle="Manage your account settings" />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
        <Button variant="quiet" size="sm" icon="arrow_back" onClick={() => window.location.href = '/community-admin/dashboard'} style={{ marginBottom: space.lg, background: colors.surfaceContainerLowest }}>
          Back to dashboard
        </Button>
        {message && (
          <div role={message.type === 'error' ? 'alert' : 'status'} style={{ padding: '13px 20px', borderRadius: radius.md, marginBottom: space.lg, fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: space.sm,
            background: message.type === 'success' ? colors.tertiaryFixed : colors.errorContainer, color: message.type === 'success' ? colors.tertiary : colors.onErrorContainer }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Icon name={message.type === 'success' ? 'check_circle' : 'error'} size={19} /> {message.text}</span>
            {message.type === 'success' && (
              <Button size="sm" onClick={() => window.location.href = '/community-admin/dashboard'}>Go to dashboard</Button>
            )}
          </div>
        )}
        <div style={{ background: colors.surfaceContainerLowest, borderRadius: radius.lg, boxShadow: '0 10px 26px rgba(10, 59, 50, 0.05)', border: `1px solid ${colors.outlineVariant}`, overflow: 'hidden' }}>
          <div style={{ height: 120, background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDeep} 100%)` }} />
          <div style={{ padding: '0 40px 40px', marginTop: -48 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginBottom: 32 }}>
              <div style={{
                width: 120, height: 120, borderRadius: '50%', border: `4px solid ${colors.surfaceContainerLowest}`,
                background: colors.primary, overflow: 'hidden', boxShadow: '0 12px 28px -8px rgba(10, 59, 50, 0.16)',
                flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 40, fontWeight: 700, position: 'relative',
              }}>
                {displayImage ? (
                  <img src={displayImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : initials}
                <label htmlFor="profile-image" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(10, 59, 50, 0.72)', color: '#fff', textAlign: 'center', fontSize: 11, fontWeight: 700, padding: '5px 0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <Icon name="photo_camera" size={14} /> Change
                  <input id="profile-image" type="file" accept="image/*" onChange={handleFileChange} className="visually-hidden" />
                </label>
              </div>
              <div style={{ paddingBottom: 8 }}>
                <h2 style={{ margin: 0, fontSize: 23, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: colors.onSurface }}>{name}</h2>
                <p style={{ margin: '4px 0 0', color: colors.inkSoft, fontSize: 14 }}>{email}</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label htmlFor="profile-name" style={profileLabel}>Full name</label>
                <input id="profile-name" type="text" value={name} onChange={(e) => setName(e.target.value)} style={profileInput} />
              </div>
              <div>
                <label htmlFor="profile-email" style={profileLabel}>Email address</label>
                <input id="profile-email" type="email" value={email} readOnly aria-describedby="profile-email-hint" style={{ ...profileInput, ...readOnlyInput }} />
                <p id="profile-email-hint" style={{ margin: '6px 0 0', fontSize: 12, color: colors.inkSoft }}>Email cannot be changed.</p>
              </div>
              <div>
                <label htmlFor="profile-role" style={profileLabel}>Role</label>
                <input id="profile-role" type="text" value="Community Admin" readOnly style={{ ...profileInput, ...readOnlyInput }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32, borderTop: `1px solid ${colors.outlineVariant}`, paddingTop: 24 }}>
              <Button variant="quiet" onClick={() => { setName(user?.name || ''); setProfileFile(null); setPreviewUrl(''); setMessage(null); }} disabled={saving}>Cancel</Button>
              <Button onClick={handleSave} loading={saving} icon="check">{saving ? 'Saving...' : 'Save changes'}</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

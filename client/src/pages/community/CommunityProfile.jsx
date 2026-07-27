import React, { useState, useEffect } from 'react';
import { CommunityHeader } from '../../components/CommunityAdminUI';
import { API_BASE } from '../../services/api';

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
    <div style={{ minHeight: '100vh', background: '#f0f4f3' }}>
      <CommunityHeader title="My Profile" subtitle="Manage your account settings" />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
        <button onClick={() => window.location.href = '/community-admin/dashboard'}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid #DEE2E6', background: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer', marginBottom: 20, color: '#006D5B' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span> Back to Dashboard
        </button>
        {message && (
          <div style={{ padding: '12px 20px', borderRadius: 8, marginBottom: 24, fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: message.type === 'success' ? '#E8F5E9' : '#FFEBEE', color: message.type === 'success' ? '#2E7D32' : '#C62828' }}>
            <span>{message.type === 'success' ? '✓' : '⚠'} {message.text}</span>
            {message.type === 'success' && (
              <button onClick={() => window.location.href = '/community-admin/dashboard'}
                style={{ background: '#2E7D32', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Go to Dashboard
              </button>
            )}
          </div>
        )}
        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ height: 120, background: 'linear-gradient(135deg, #006D5B 0%, #0A3B32 100%)' }} />
          <div style={{ padding: '0 40px 40px', marginTop: -48 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginBottom: 32 }}>
              <div style={{
                width: 120, height: 120, borderRadius: '50%', border: '4px solid white',
                background: '#006D5B', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 40, fontWeight: 700, position: 'relative',
              }}>
                {displayImage ? (
                  <img src={displayImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : initials}
                <label style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: 'white', textAlign: 'center', fontSize: 11, fontWeight: 600, padding: '4px 0', cursor: 'pointer' }}>
                  <i className="fa-solid fa-camera" style={{ marginRight: 4 }}></i> Change
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>
              </div>
              <div style={{ paddingBottom: 8 }}>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{name}</h2>
                <p style={{ margin: '4px 0 0', color: '#6C757D', fontSize: 14 }}>{email}</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #DEE2E6', fontSize: 15, outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Email Address</label>
                <input type="email" value={email} readOnly
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #DEE2E6', fontSize: 15, background: '#F8F9FA', color: '#6C757D', cursor: 'not-allowed' }} />
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ADB5BD' }}>Email cannot be changed.</p>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Role</label>
                <input type="text" value="Community Admin" readOnly
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #DEE2E6', fontSize: 15, background: '#F8F9FA', color: '#6C757D', cursor: 'not-allowed' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32, borderTop: '1px solid #F1F3F5', paddingTop: 24 }}>
              <button onClick={() => { setName(user?.name || ''); setProfileFile(null); setPreviewUrl(''); setMessage(null); }}
                style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid #DEE2E6', background: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving}
                style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#006D5B', color: 'white', fontWeight: 600, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                {saving ? 'Saving...' : <><i className="fa-solid fa-check"></i> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

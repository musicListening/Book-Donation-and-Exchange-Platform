import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { API_BASE } from '../../services/api';

export default function SubmitCraft() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pointsPrice, setPointsPrice] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !pointsPrice) {
      setMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('userId', user.id);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('pointsPrice', pointsPrice);
      if (imageFile) formData.append('image', imageFile);

      const res = await fetch(`${API_BASE}/crafts`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to submit');

      setMessage({ type: 'success', text: 'Craft submitted! Awaiting staff approval.' });
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1px solid #DEE2E6', fontSize: 14, fontFamily: 'Inter, sans-serif',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#F1F3F5', minHeight: '100vh' }}>
      <Navbar variant="user" user={user} />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 32 }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#1E4D4B', marginBottom: 8 }}>Submit a Craft Listing</h2>
        <p style={{ color: '#6C757D', marginBottom: 24 }}>
          Share your handcrafted items with the community.
        </p>

        {message && (
          <div style={{
            padding: 12, borderRadius: 8, marginBottom: 16,
            background: message.type === 'success' ? '#E8F5E9' : '#FFEBEE',
            color: message.type === 'success' ? '#2E7D32' : '#C62828',
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              style={inputStyle} placeholder="e.g. Hand-painted bookmark" />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              rows={4} style={inputStyle} placeholder="Describe your craft..." />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Points Price</label>
            <input type="number" value={pointsPrice} onChange={(e) => setPointsPrice(e.target.value)}
              style={inputStyle} placeholder="e.g. 50" min="1" />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Photo</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {previewUrl && (
              <img src={previewUrl} alt="Preview"
                style={{ marginTop: 8, width: 150, height: 150, objectFit: 'cover', borderRadius: 8 }} />
            )}
          </div>

          <button type="submit" disabled={submitting}
            style={{
              padding: '12px 24px', background: '#1E4D4B', color: 'white',
              border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}>
            {submitting ? 'Submitting...' : 'Submit for Review'}
          </button>
        </form>
      </div>
    </div>
  );
}

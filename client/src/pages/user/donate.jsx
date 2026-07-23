import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';

const Donate = () => {
  const [step, setStep] = useState(1);
  const [user, setUser] = useState({ points: 0, name: '' });
  const [formData, setFormData] = useState({
    bookType: '',
    bookCount: 1,
    notes: '',
    selectedDate: '',
    timeSlot: '10:00 AM'
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('ss_current_user')) || { points: 0, name: 'User' };
    setUser(storedUser);

  }, []);


  const updateCount = (delta) => {
    setFormData(prev => ({ ...prev, bookCount: Math.max(1, Math.min(100, prev.bookCount + delta)) }));
  };

  const nextStep = () => {
    if (step === 1 && !formData.bookType) {
      alert('Please select a category');
      return;
    }
    if (step === 2 && !formData.selectedDate) {
      alert('Please select a drop-off date');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const points = formData.bookCount * 10;

    try {
      const token = localStorage.getItem('token');
      const storedUser = JSON.parse(localStorage.getItem('user') || localStorage.getItem('ss_current_user') || '{}');

      if (!storedUser?.id) {
        alert('Please login to donate');
        return;
      }

      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          userId: storedUser.id,
          type: 'SINGLE_BOOK',
          category: formData.bookType,
          collectionName: formData.bookType,
          requestedCount: formData.bookCount,
          notes: formData.notes,
          dropOffDate: formData.selectedDate || null
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create donation');
      }

      document.getElementById('successModal').style.display = 'flex';
      document.getElementById('finalPoints').innerText = points;
    } catch (error) {
      console.error('Error creating donation:', error);
      alert('Failed to submit donation: ' + error.message);
    }
  };

  const styles = {
    body: { fontFamily: 'Inter, sans-serif', backgroundColor: '#F1F3F5', color: '#343A40', paddingTop: 0 },
    mainContent: { maxWidth: 800, margin: '40px auto', padding: '0 20px' },
    pageHeader: { marginBottom: 40, textAlign: 'center' },
    pageHeaderH1: { fontFamily: 'Playfair Display, serif', fontSize: 32, marginBottom: 10 },
    formCard: { background: 'white', padding: 40, borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
    stepper: { display: 'flex', justifyContent: 'space-between', marginBottom: 40, position: 'relative' },
    stepperBefore: { content: '""', position: 'absolute', top: 15, left: 0, width: '100%', height: 2, background: '#DEE2E6', zIndex: 1 },
    step: { width: 32, height: 32, borderRadius: '50%', background: 'white', border: '2px solid #DEE2E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, zIndex: 2, color: '#6C757D' },
    stepActive: { borderColor: '#1E4D4B', background: '#1E4D4B', color: 'white' },
    formStep: { animation: 'fadeIn 0.5s ease' },
    formGroup: { marginBottom: 24 },
    label: { display: 'block', fontWeight: 600, marginBottom: 10 },
    formControl: { width: '100%', padding: 14, border: '2px solid #DEE2E6', borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 16 },
    numberInput: { display: 'flex', alignItems: 'center', gap: 10 },
    numBtn: { width: 40, height: 40, borderRadius: 8, border: '1px solid #DEE2E6', background: 'white', cursor: 'pointer', fontSize: 20 },
    dateGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12, marginTop: 10 },
    formActions: { display: 'flex', justifyContent: 'space-between', marginTop: 40, borderTop: '1px solid #DEE2E6', paddingTop: 30 },
    btn: { padding: '12px 28px', borderRadius: 12, border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 },
    btnPrev: { background: '#DEE2E6', color: '#343A40' },
    btnNext: { background: '#1E4D4B', color: 'white' },
    btnSubmit: { background: '#E76F51', color: 'white' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'none', alignItems: 'center', justifyContent: 'center' },
    modal: { background: 'white', padding: 40, borderRadius: 16, maxWidth: 500, width: '90%', textAlign: 'center' },
    pointsBox: { background: '#F1F3F5', padding: 20, borderRadius: 12, margin: '24px 0', border: '2px dashed #E9C46A' }
  };

  const points = formData.bookCount * 10;

  return (
    <div style={styles.body}>
      <Navbar variant="user" user={user} />

      <main style={styles.mainContent}>
        <div style={styles.pageHeader}>
          <h1 style={styles.pageHeaderH1}>Donate Your Books</h1>
          <p>Help others discover new stories and earn points for your generosity.</p>
        </div>

        <div style={styles.formCard}>
          <div style={styles.stepper}>
            <div style={{ ...styles.step, ...(step >= 1 ? styles.stepActive : {}) }}>1</div>
            <div style={{ ...styles.step, ...(step >= 2 ? styles.stepActive : {}) }}>2</div>
            <div style={{ ...styles.step, ...(step >= 3 ? styles.stepActive : {}) }}>3</div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div>
                <h3 style={{ marginBottom: 20 }}>Step 1: What are you donating?</h3>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Collection Type</label>
                  <select style={styles.formControl} value={formData.bookType} onChange={(e) => setFormData(prev => ({ ...prev, bookType: e.target.value }))} required>
                    <option value="">Select a category...</option>
                    <option value="Fiction">Fiction (Novels, Fantasy, Mystery)</option>
                    <option value="Non-Fiction">Non-Fiction (Biographies, History)</option>
                    <option value="Academic">Academic (Textbooks, Reference)</option>
                    <option value="Children">Children's Books</option>
                    <option value="Comics">Comics & Manga</option>
                    <option value="Mixed">Mixed Collection</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Approximate Number of Books</label>
                  <div style={styles.numberInput}>
                    <button type="button" style={styles.numBtn} onClick={() => updateCount(-1)}>-</button>
                    <input type="number" style={{ ...styles.formControl, textAlign: 'center', width: 100 }} value={formData.bookCount} onChange={(e) => setFormData(prev => ({ ...prev, bookCount: parseInt(e.target.value) || 1 }))} min="1" max="100" />
                    <button type="button" style={styles.numBtn} onClick={() => updateCount(1)}>+</button>
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Notes (Optional)</label>
                  <textarea style={styles.formControl} rows="3" placeholder="Tell us about the condition or specific titles..." value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}></textarea>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 style={{ marginBottom: 20 }}>Step 2: Pick a drop-off date</h3>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Drop-off Date</label>
                  <input type="date" style={styles.formControl} value={formData.selectedDate} onChange={(e) => setFormData(prev => ({ ...prev, selectedDate: e.target.value }))} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Preferred Time Slot</label>
                  <select style={styles.formControl} value={formData.timeSlot} onChange={(e) => setFormData(prev => ({ ...prev, timeSlot: e.target.value }))} required>
                    <option value="10:00 AM">Morning (10:00 AM - 12:00 PM)</option>
                    <option value="02:00 PM">Afternoon (02:00 PM - 04:00 PM)</option>
                    <option value="05:00 PM">Evening (05:00 PM - 07:00 PM)</option>
                  </select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h3 style={{ marginBottom: 20 }}>Step 3: Review & Confirm</h3>
                <div style={{ background: '#F1F3F5', padding: 20, borderRadius: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}><span style={{ color: '#6C757D' }}>Category:</span><strong>{formData.bookType || '-'}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}><span style={{ color: '#6C757D' }}>Book Count:</span><strong>{formData.bookCount} Books</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}><span style={{ color: '#6C757D' }}>Drop-off Date:</span><strong>{formData.selectedDate || '-'}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6C757D' }}>Estimated Points:</span><strong style={{ color: '#2A9D8F' }}>~{points} pts</strong></div>
                </div>
                <p style={{ fontSize: 13, color: '#6C757D', marginTop: 16 }}><i className="fa-solid fa-circle-info"></i> Points will be credited to your account after our staff verifies the condition and count of books at the collection center.</p>
              </div>
            )}

            <div style={styles.formActions}>
              {step > 1 && <button type="button" style={{ ...styles.btn, ...styles.btnPrev }} onClick={prevStep}>Back</button>}
              {step < 3 && <button type="button" style={{ ...styles.btn, ...styles.btnNext }} onClick={nextStep}>Next <i className="fa-solid fa-arrow-right"></i></button>}
              {step === 3 && <button type="submit" style={{ ...styles.btn, ...styles.btnSubmit }}>Confirm Donation</button>}
            </div>
          </form>
        </div>
      </main>

      <div id="successModal" style={styles.modalOverlay}>
        <div style={styles.modal}>
          <i className="fa-solid fa-circle-check" style={{ fontSize: 64, color: '#2A9D8F', marginBottom: 20 }}></i>
          <h2>Donation Scheduled!</h2>
          <p>Thank you for contributing to the ShareShelf community.</p>
          <div style={styles.pointsBox}>
            Estimated points to earn:<br />
            <span id="finalPoints" style={{ fontSize: 32, fontWeight: 800, color: '#1E4D4B' }}>0</span> pts
          </div>
          <button style={{ ...styles.btn, ...styles.btnNext, margin: '30px auto 0' }} onClick={() => window.location.href = '/user-dashboard'}>Back to Dashboard</button>
        </div>
      </div>
    </div>
  );
};

export default Donate;
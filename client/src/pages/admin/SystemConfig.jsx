import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { systemConfigAPI } from "../../services/api";
import "../../styles/systemconfig.css";

export default function SystemConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Point & Economics
  const [basePointRate, setBasePointRate] = useState("10");
  const [collectionBonus, setCollectionBonus] = useState("10");
  const [conversionRate, setConversionRate] = useState("100:10");

  // Levels
  const [levels, setLevels] = useState([]);

  // Mystery Box
  const [mysteryBoxBooks, setMysteryBoxBooks] = useState("5");
  const [mysteryBoxPointsCost, setMysteryBoxPointsCost] = useState("200");
  const [rareCollectionMinLevel, setRareCollectionMinLevel] = useState("2");
  const [mysteryBoxLocks, setMysteryBoxLocks] = useState([]);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const config = await systemConfigAPI.getAll();

      if (config.BASE_POINTS_PER_BOOK) setBasePointRate(config.BASE_POINTS_PER_BOOK);
      if (config.COLLECTION_BONUS_PERCENTAGE) setCollectionBonus(config.COLLECTION_BONUS_PERCENTAGE);
      if (config.POINT_TO_CASH_CONVERSION_RATE) setConversionRate(config.POINT_TO_CASH_CONVERSION_RATE);
      if (config.MYSTERY_BOX_BOOKS) setMysteryBoxBooks(config.MYSTERY_BOX_BOOKS);
      if (config.MYSTERY_BOX_POINTS_COST) setMysteryBoxPointsCost(config.MYSTERY_BOX_POINTS_COST);
      if (config.RARE_COLLECTION_MIN_LEVEL) setRareCollectionMinLevel(config.RARE_COLLECTION_MIN_LEVEL);

      if (config.LEVEL_THRESHOLDS) {
        try {
          setLevels(JSON.parse(config.LEVEL_THRESHOLDS));
        } catch {}
      }
      if (config.MYSTERY_BOX_LOCKS) {
        try {
          setMysteryBoxLocks(JSON.parse(config.MYSTERY_BOX_LOCKS));
        } catch {}
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load configuration' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTier = () => {
    const newId = levels.length > 0 ? Math.max(...levels.map(l => l.level)) + 1 : 1;
    setLevels([...levels, { level: newId, minPoints: "0", name: "New Level", reward: "TBD" }]);
  };

  const handleLevelChange = (level, field, value) => {
    setLevels(levels.map(l => l.level === level ? { ...l, [field]: value } : l));
  };

  const handleDeleteLevel = (level) => {
    setLevels(levels.filter(l => l.level !== level));
  };

  const handleAddLock = () => {
    setMysteryBoxLocks([...mysteryBoxLocks, { level: "1", unlock: "New Unlock" }]);
  };

  const handleLockChange = (idx, field, value) => {
    const updated = [...mysteryBoxLocks];
    updated[idx] = { ...updated[idx], [field]: value };
    setMysteryBoxLocks(updated);
  };

  const handleDeleteLock = (idx) => {
    setMysteryBoxLocks(mysteryBoxLocks.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const payload = {
        BASE_POINTS_PER_BOOK: basePointRate,
        COLLECTION_BONUS_PERCENTAGE: collectionBonus,
        POINT_TO_CASH_CONVERSION_RATE: conversionRate,
        MYSTERY_BOX_BOOKS: mysteryBoxBooks,
        MYSTERY_BOX_POINTS_COST: mysteryBoxPointsCost,
        RARE_COLLECTION_MIN_LEVEL: rareCollectionMinLevel,
        LEVEL_THRESHOLDS: JSON.stringify(levels),
        MYSTERY_BOX_LOCKS: JSON.stringify(mysteryBoxLocks),
      };

      await systemConfigAPI.update(payload);
      setMessage({ type: 'success', text: 'System configuration saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save configuration' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="System Configuration" hideHeaderLabel={true} hideNotifications={true}>
        <div className="system-config-container" style={{ textAlign: 'center', padding: '80px 0' }}>
          <p>Loading configuration...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="System Configuration" hideHeaderLabel={true} hideNotifications={true}>
      <div className="system-config-container">
        <div style={{ marginBottom: "32px" }}>
          <h2 className="page-header-title">System Configuration & Platform Rules</h2>
          <p className="page-header-subtitle">Configure the core economic models, gamification tiers, and collection logic for the entire platform.</p>
        </div>

        {message && (
          <div style={{
            padding: '12px 20px',
            borderRadius: 8,
            marginBottom: 20,
            background: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            fontWeight: 600,
          }}>
            {message.text}
          </div>
        )}

        {/* Section 1: Point & Economics Settings */}
        <section className="config-section-card">
          <div className="section-header">
            <h3 className="section-title">Point & Economics Settings</h3>
          </div>
          <div className="config-grid-3">
            <div className="config-input-group">
              <label className="config-label">Base Points Per Book</label>
              <input 
                className="config-input" 
                type="number" min="0"
                value={basePointRate}
                onChange={(e) => setBasePointRate(e.target.value)}
              />
              <p className="config-hint">Minimum points awarded for every single verified book donation.</p>
            </div>
            <div className="config-input-group">
              <label className="config-label">Collection Bonus %</label>
              <input 
                className="config-input" 
                type="number" min="0" max="100"
                value={collectionBonus}
                onChange={(e) => setCollectionBonus(e.target.value)}
              />
              <p className="config-hint">Extra percentage awarded when a user donates a verified complete collection.</p>
            </div>
            <div className="config-input-group">
              <label className="config-label">Point-to-Cash Conversion</label>
              <input 
                className="config-input" 
                type="text" 
                value={conversionRate}
                onChange={(e) => setConversionRate(e.target.value)}
              />
              <p className="config-hint">Ratio of points to currency (e.g., 100:10 means 100 points = 10 Rs).</p>
            </div>
          </div>
        </section>

        {/* Section 2: Gamification & Levels */}
        <section className="config-section-card">
          <div className="section-header">
            <h3 className="section-title">Gamification & Levels</h3>
          </div>
          <div className="tier-table-wrapper">
            <table className="tier-table">
              <thead>
                <tr>
                  <th>Level #</th>
                  <th>Level Name</th>
                  <th>Min Points</th>
                  <th>Reward Unlock</th>
                  <th style={{ width: "50px" }}></th>
                </tr>
              </thead>
              <tbody>
                {levels.map((level) => (
                  <tr key={level.level}>
                    <td style={{ fontWeight: 700, color: '#1E4D4B' }}>{level.level}</td>
                    <td>
                      <input 
                        className="tier-input name-input" 
                        type="text" 
                        value={level.name}
                        onChange={(e) => handleLevelChange(level.level, 'name', e.target.value)}
                      />
                    </td>
                    <td>
                      <input 
                        className="tier-input threshold-input" 
                        type="number" min="0"
                        value={level.minPoints}
                        onChange={(e) => handleLevelChange(level.level, 'minPoints', e.target.value)}
                      />
                    </td>
                    <td>
                      <input 
                        className="tier-input" 
                        type="text" 
                        value={level.reward || ''}
                        onChange={(e) => handleLevelChange(level.level, 'reward', e.target.value)}
                        placeholder="Reward description"
                      />
                    </td>
                    <td>
                      <button 
                        onClick={() => handleDeleteLevel(level.level)}
                        style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: 18 }}
                        title="Remove level"
                      >×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={handleAddTier} className="add-tier-btn">
              + Add New Tier
            </button>
          </div>
        </section>

        {/* Section 3: Mystery & Rare Collections Configuration */}
        <section className="config-section-card">
          <div className="section-header">
            <h3 className="section-title">Mystery & Rare Collections</h3>
          </div>
          <div className="config-grid-2">
            {/* Mystery Box Config */}
            <div className="mystery-sub-card">
              <h4 className="mystery-sub-title">Mystery Box Configuration</h4>
              <div className="config-input-group" style={{ marginBottom: "20px" }}>
                <label className="config-label">Books per Mystery Box</label>
                <input 
                  className="config-input" 
                  type="number" min="1"
                  value={mysteryBoxBooks}
                  onChange={(e) => setMysteryBoxBooks(e.target.value)}
                />
                <p className="config-hint">Number of random books included in a standard mystery box.</p>
              </div>
              <div className="config-input-group">
                <label className="config-label">Points Cost to Redeem (0 = Free)</label>
                <input 
                  className="config-input" 
                  type="number" min="0"
                  value={mysteryBoxPointsCost}
                  onChange={(e) => setMysteryBoxPointsCost(e.target.value)}
                />
                <p className="config-hint">Points required for a user to unlock/redeem a mystery box. Set 0 for free.</p>
              </div>
            </div>

            {/* Mystery Box Level Locks */}
            <div className="mystery-sub-card">
              <h4 className="mystery-sub-title">Level Unlocks for Mystery Boxes</h4>
              {mysteryBoxLocks.map((lock, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, minWidth: 40 }}>Level:</span>
                  <input
                    className="config-input"
                    style={{ width: 60 }}
                    type="number" min="1"
                    value={lock.level}
                    onChange={(e) => handleLockChange(idx, 'level', e.target.value)}
                  />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Unlocks:</span>
                  <input
                    className="config-input"
                    style={{ flex: 1 }}
                    type="text"
                    value={lock.unlock}
                    onChange={(e) => handleLockChange(idx, 'unlock', e.target.value)}
                  />
                  <button
                    onClick={() => handleDeleteLock(idx)}
                    style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: 18 }}
                  >×</button>
                </div>
              ))}
              <button onClick={handleAddLock} className="add-tier-btn" style={{ marginTop: 8 }}>
                + Add Level Unlock
              </button>
              <div className="config-input-group" style={{ marginTop: 16 }}>
                <label className="config-label">Minimum Level for Rare Collections</label>
                <select 
                  className="config-select"
                  value={rareCollectionMinLevel}
                  onChange={(e) => setRareCollectionMinLevel(e.target.value)}
                >
                  {levels.map(l => (
                    <option key={l.level} value={l.level}>{l.name} (Level {l.level})</option>
                  ))}
                </select>
                <p className="config-hint">Users must reach this level to browse rare curated collections.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sticky Footer */}
        <footer className="config-sticky-footer">
          <button className="btn-cancel-config" onClick={loadConfig}>Cancel Changes</button>
          <button className="btn-save-config" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save System Rules'}
          </button>
        </footer>
      </div>
    </AdminLayout>
  );
}
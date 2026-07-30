import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { systemConfigAPI } from "../../services/api";
import "../../styles/systemconfig.css";
import { showToast } from "../../utils/toast";

export default function SystemConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [basePointRate, setBasePointRate] = useState("10");
  const [collectionBonus, setCollectionBonus] = useState("10");
  const [conversionRate, setConversionRate] = useState("100:10");

  const [levels, setLevels] = useState([]);

  const [mysteryBoxBooks, setMysteryBoxBooks] = useState("5");
  const [mysteryBoxPointsCost, setMysteryBoxPointsCost] = useState("200");
  const [rareCollectionMinLevel, setRareCollectionMinLevel] = useState("2");
  const [mysteryBoxLocks, setMysteryBoxLocks] = useState([]);

  const [mysteryBoxConfigs, setMysteryBoxConfigs] = useState([]);

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
        try { setLevels(JSON.parse(config.LEVEL_THRESHOLDS)); } catch {}
      }
      if (config.MYSTERY_BOX_LOCKS) {
        try { setMysteryBoxLocks(JSON.parse(config.MYSTERY_BOX_LOCKS)); } catch {}
      }
      if (config.MYSTERY_BOX_LEVEL_CONFIG) {
        try { setMysteryBoxConfigs(JSON.parse(config.MYSTERY_BOX_LEVEL_CONFIG)); } catch {}
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load configuration' });
    } finally {
      setLoading(false);
    }
  };

  // Level handlers
  const handleAddTier = () => {
    const newId = levels.length > 0 ? Math.max(...levels.map(l => l.level)) + 1 : 1;
    setLevels([...levels, { level: newId, minBooks: "0", name: "New Level", reward: "TBD" }]);
  };

  const handleLevelChange = (level, field, value) => {
    setLevels(levels.map(l => l.level === level ? { ...l, [field]: value } : l));
  };

  const handleDeleteLevel = (level) => {
    setLevels(levels.filter(l => l.level !== level));
    setMysteryBoxConfigs(mysteryBoxConfigs.filter(c => c.level !== level));
  };

  // Mystery Box Lock handlers
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

  // Mystery Box Per-Level Config handlers
  const handleAddMysteryBoxConfig = () => {
    const usedLevels = mysteryBoxConfigs.map(c => c.level);
    const unlockedLevelNums = mysteryBoxLocks.map(lock => parseInt(lock.level, 10));
    const availableLevel = levels.find(l => unlockedLevelNums.includes(l.level) && !usedLevels.includes(l.level));
    if (!availableLevel) {
      setMessage({ type: 'error', text: 'No more eligible levels. Ensure the level has a Level Unlock and doesn\'t already have a mystery box config.' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setMysteryBoxConfigs([...mysteryBoxConfigs, {
      level: availableLevel.level,
      points: 100,
      books: 3,
      bookTitles: []
    }]);
  };

  const handleMysteryBoxConfigChange = (level, field, value) => {
    setMysteryBoxConfigs(mysteryBoxConfigs.map(c => c.level === level ? { ...c, [field]: value } : c));
  };

  const handleDeleteMysteryBoxConfig = (level) => {
    setMysteryBoxConfigs(mysteryBoxConfigs.filter(c => c.level !== level));
  };

  const handleAddBookTitle = (level) => {
    setMysteryBoxConfigs(mysteryBoxConfigs.map(c => {
      if (c.level === level) {
        return { ...c, bookTitles: [...(c.bookTitles || []), ""] };
      }
      return c;
    }));
  };

  const handleBookTitleChange = (level, bookIdx, value) => {
    setMysteryBoxConfigs(mysteryBoxConfigs.map(c => {
      if (c.level === level) {
        const titles = [...(c.bookTitles || [])];
        titles[bookIdx] = value;
        return { ...c, bookTitles: titles };
      }
      return c;
    }));
  };

  const handleRemoveBookTitle = (level, bookIdx) => {
    setMysteryBoxConfigs(mysteryBoxConfigs.map(c => {
      if (c.level === level) {
        const titles = [...(c.bookTitles || [])];
        titles.splice(bookIdx, 1);
        return { ...c, bookTitles: titles };
      }
      return c;
    }));
  };

  // Save handler
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
        MYSTERY_BOX_LEVEL_CONFIG: JSON.stringify(mysteryBoxConfigs),
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
        <div className="sc-loading-state">
          <div className="sc-loading-spinner"></div>
          <p>Loading configuration...</p>
        </div>
      </AdminLayout>
    );
  }

  const configuredLevels = mysteryBoxConfigs.map(c => c.level);

  return (
    <AdminLayout title="System Configuration" hideHeaderLabel={true} hideNotifications={true}>
      <div className="sc-wrapper">
        {/* ============ HERO HEADER ============ */}
        <div className="sc-hero-panel">
          <div className="sc-hero-grid">
            <div>
              <p className="sc-hero-label">Platform Settings</p>
              <h1 className="sc-hero-title">
                System Configuration <span className="sc-hero-title-italic">& Rules</span>
              </h1>
              <p className="sc-hero-desc">
                Configure the core economic models, gamification tiers, mystery boxes, and collection logic for the entire platform.
              </p>
            </div>
            <div className="sc-hero-stats">
              <div className="sc-hero-stat-box">
                <p className="sc-hero-stat-label">Levels</p>
                <p className="sc-hero-stat-value">{levels.length}</p>
              </div>
              <div className="sc-hero-stat-box">
                <p className="sc-hero-stat-label">Mystery Boxes</p>
                <p className="sc-hero-stat-value">{mysteryBoxConfigs.length}</p>
              </div>
              <div className="sc-hero-stat-box">
                <p className="sc-hero-stat-label">Base Points</p>
                <p className="sc-hero-stat-value">{basePointRate}</p>
              </div>
              <div className="sc-hero-stat-box">
                <p className="sc-hero-stat-label">Box Cost</p>
                <p className="sc-hero-stat-value">{mysteryBoxPointsCost}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="sc-content">
          {message && (
            <div className={`sc-toast ${message.type === 'success' ? 'sc-toast-success' : 'sc-toast-error'}`}>
              {message.type === 'success' ? <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', backgroundColor: '#2E7D32', color: '#fff', fontSize: 11, fontWeight: 700, marginRight: 4 }}>✓</span> : <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', backgroundColor: '#C62828', color: '#fff', fontSize: 11, fontWeight: 700, marginRight: 4 }}>!</span>} {message.text}
            </div>
          )}

          {/* ============ POINT & ECONOMICS ============ */}
          <section className="sc-card">
            <div className="sc-card-header">
              <div className="sc-card-icon sc-icon-teal">
                <i className="fa-solid fa-coins"></i>
              </div>
              <div>
                <h3 className="sc-card-title">Point & Economics Settings</h3>
                <p className="sc-card-subtitle">Configure the core earning and conversion rules</p>
              </div>
            </div>
            <div className="sc-grid-3">
              <div className="sc-input-group">
                <label className="sc-label">Base Points Per Book</label>
                <div className="sc-input-wrapper">
                  <input className="sc-input" type="number" min="0" value={basePointRate} onChange={(e) => setBasePointRate(e.target.value)} />
                  <span className="sc-input-suffix">pts</span>
                </div>
                <p className="sc-hint">Minimum points awarded for every verified book donation.</p>
              </div>
              <div className="sc-input-group">
                <label className="sc-label">Collection Bonus %</label>
                <div className="sc-input-wrapper">
                  <input className="sc-input" type="number" min="0" max="100" value={collectionBonus} onChange={(e) => setCollectionBonus(e.target.value)} />
                  <span className="sc-input-suffix">%</span>
                </div>
                <p className="sc-hint">Extra percentage for verified complete collection donations.</p>
              </div>
              <div className="sc-input-group">
                <label className="sc-label">Point-to-Cash Conversion</label>
                <input className="sc-input" type="text" value={conversionRate} onChange={(e) => setConversionRate(e.target.value)} />
                <p className="sc-hint">Ratio format: 100:10 means 100 points = 10 Rs.</p>
              </div>
            </div>
          </section>

          {/* ============ GAMIFICATION & LEVELS ============ */}
          <section className="sc-card">
            <div className="sc-card-header">
              <div className="sc-card-icon sc-icon-gold">
                <i className="fa-solid fa-layer-group"></i>
              </div>
              <div>
                <h3 className="sc-card-title">Gamification & Levels</h3>
                <p className="sc-card-subtitle">Define level tiers, thresholds, and reward unlocks</p>
              </div>
            </div>
            <div className="sc-tier-table-wrap">
              <table className="sc-tier-table">
                <thead>
                  <tr>
                    <th className="sc-tier-th-level">Level</th>
                    <th>Level Name</th>
                    <th>Min Books</th>
                    <th>Reward Unlock</th>
                    <th className="sc-tier-th-action"></th>
                  </tr>
                </thead>
                <tbody>
                  {levels.map((level) => (
                    <tr key={level.level}>
                      <td className="sc-tier-level-num">{level.level}</td>
                      <td>
                        <input className="sc-tier-input sc-tier-name" type="text" value={level.name} onChange={(e) => handleLevelChange(level.level, 'name', e.target.value)} />
                      </td>
                      <td>
                        <input className="sc-tier-input sc-tier-points" type="number" min="0" value={level.minBooks || level.minPoints || 0} onChange={(e) => handleLevelChange(level.level, 'minBooks', e.target.value)} />
                      </td>
                      <td>
                        <input className="sc-tier-input" type="text" value={level.reward || ''} onChange={(e) => handleLevelChange(level.level, 'reward', e.target.value)} placeholder="Reward description" />
                      </td>
                      <td>
                        <button className="sc-tier-delete" onClick={() => handleDeleteLevel(level.level)} title="Remove level">
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={handleAddTier} className="sc-add-btn">
                <i className="fa-solid fa-plus"></i> Add New Tier
              </button>
            </div>
          </section>

          {/* ============ MYSTERY BOX PER-LEVEL CONFIG ============ */}
          <section className="sc-card">
            <div className="sc-card-header">
              <div className="sc-card-icon sc-icon-orange">
                <i className="fa-solid fa-box-open"></i>
              </div>
              <div>
                <h3 className="sc-card-title">Mystery Box — Per Level Configuration</h3>
                <p className="sc-card-subtitle">Set custom books count, points, and specific book titles for each level's mystery box</p>
              </div>
            </div>

            <div className="sc-mystery-grid">
              {mysteryBoxConfigs.length === 0 && (
                <div className="sc-mystery-empty">
                  <i className="fa-solid fa-box-open"></i>
                  <p>No mystery boxes configured yet. Add one to get started.</p>
                </div>
              )}

              {mysteryBoxConfigs.map((config) => {
                const levelInfo = levels.find(l => l.level === config.level);
                return (
                  <div key={config.level} className="sc-mystery-box-card">
                    <div className="sc-mystery-box-header">
                      <div className="sc-mystery-box-badge">
                        <span className="sc-mystery-box-level">Lvl {config.level}</span>
                        <span className="sc-mystery-box-name">{levelInfo?.name || 'Unknown'}</span>
                      </div>
                      <button className="sc-tier-delete" onClick={() => handleDeleteMysteryBoxConfig(config.level)} title="Remove">
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>

                    <div className="sc-mystery-box-fields">
                      <div className="sc-input-group">
                        <label className="sc-label">Points Cost to Claim</label>
                        <div className="sc-input-wrapper">
                          <input className="sc-input" type="number" min="0" value={config.points} onChange={(e) => handleMysteryBoxConfigChange(config.level, 'points', parseInt(e.target.value) || 0)} />
                          <span className="sc-input-suffix">pts</span>
                        </div>
                      </div>
                      <div className="sc-input-group">
                        <label className="sc-label">Books in Box</label>
                        <div className="sc-input-wrapper">
                          <input className="sc-input" type="number" min="1" value={config.books} onChange={(e) => handleMysteryBoxConfigChange(config.level, 'books', parseInt(e.target.value) || 1)} />
                          <span className="sc-input-suffix">books</span>
                        </div>
                      </div>
                    </div>

                    <div className="sc-mystery-books-section">
                      <label className="sc-label">Custom Book Titles (optional)</label>
                      {(config.bookTitles || []).map((title, idx) => (
                        <div key={idx} className="sc-book-title-row">
                          <input className="sc-input sc-book-input" type="text" value={title} onChange={(e) => handleBookTitleChange(config.level, idx, e.target.value)} placeholder={`Book ${idx + 1} title`} />
                          <button className="sc-book-remove" onClick={() => handleRemoveBookTitle(config.level, idx)}>
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </div>
                      ))}
                      <button className="sc-add-book-btn" onClick={() => handleAddBookTitle(config.level)}>
                        <i className="fa-solid fa-plus"></i> Add Book Title
                      </button>
                    </div>
                  </div>
                );
              })}

              {mysteryBoxConfigs.length < levels.length && (
                <button onClick={handleAddMysteryBoxConfig} className="sc-mystery-add-card">
                  <i className="fa-solid fa-plus"></i>
                  <span>Add Mystery Box for Level {levels.find(l => !configuredLevels.includes(l.level))?.level || ''}</span>
                </button>
              )}
            </div>
          </section>

          {/* ============ GENERAL MYSTERY BOX & RARE COLLECTIONS ============ */}
          <section className="sc-card">
            <div className="sc-card-header">
              <div className="sc-card-icon sc-icon-purple">
                <i className="fa-solid fa-gem"></i>
              </div>
              <div>
                <h3 className="sc-card-title">General Mystery Box & Rare Collections</h3>
                <p className="sc-card-subtitle">Default settings and rare collection access rules</p>
              </div>
            </div>
            <div className="sc-grid-2">
              <div className="sc-sub-card">
                <h4 className="sc-sub-card-title">
                  <span className="sc-sub-dot sc-sub-dot-teal"></span>
                  Default Mystery Box Settings
                </h4>
                <div className="sc-input-group" style={{ marginBottom: 16 }}>
                  <label className="sc-label">Default Books per Box</label>
                  <input className="sc-input" type="number" min="1" value={mysteryBoxBooks} onChange={(e) => setMysteryBoxBooks(e.target.value)} />
                  <p className="sc-hint">Default number of random books if no per-level config exists.</p>
                </div>
                <div className="sc-input-group">
                  <label className="sc-label">Default Points Cost (0 = Free)</label>
                  <input className="sc-input" type="number" min="0" value={mysteryBoxPointsCost} onChange={(e) => setMysteryBoxPointsCost(e.target.value)} />
                  <p className="sc-hint">Default points required to unlock a mystery box.</p>
                </div>
              </div>

              <div className="sc-sub-card">
                <h4 className="sc-sub-card-title">
                  <span className="sc-sub-dot sc-sub-dot-gold"></span>
                  Level Unlocks & Rare Access
                </h4>
                {mysteryBoxLocks.map((lock, idx) => (
                  <div key={idx} className="sc-lock-row">
                    <span className="sc-lock-label">Level</span>
                    <input className="sc-input sc-lock-level" type="number" min="1" value={lock.level} onChange={(e) => handleLockChange(idx, 'level', e.target.value)} />
                    <span className="sc-lock-label">Unlocks</span>
                    <input className="sc-input sc-lock-desc" type="text" value={lock.unlock} onChange={(e) => handleLockChange(idx, 'unlock', e.target.value)} />
                    <button className="sc-book-remove" onClick={() => handleDeleteLock(idx)}>
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                ))}
                <button onClick={handleAddLock} className="sc-add-btn" style={{ marginTop: 8 }}>
                  <i className="fa-solid fa-plus"></i> Add Level Unlock
                </button>
                <div className="sc-input-group" style={{ marginTop: 16 }}>
                  <label className="sc-label">Min Level for Rare Collections</label>
                  <select className="sc-select" value={rareCollectionMinLevel} onChange={(e) => setRareCollectionMinLevel(e.target.value)}>
                    {levels.map(l => (
                      <option key={l.level} value={l.level}>{l.name} (Level {l.level})</option>
                    ))}
                  </select>
                  <p className="sc-hint">Users must reach this level to browse rare curated collections.</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ============ STICKY FOOTER ============ */}
        <footer className="sc-footer">
          <button className="sc-btn-cancel" onClick={loadConfig}>Cancel Changes</button>
          <button className="sc-btn-save" onClick={handleSave} disabled={saving}>
            {saving ? (
              <><span className="sc-btn-spinner"></span> Saving...</>
            ) : (
              <><i className="fa-solid fa-check"></i> Save System Rules</>
            )}
          </button>
        </footer>
      </div>
    </AdminLayout>
  );
}

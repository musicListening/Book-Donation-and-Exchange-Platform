import React, { useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import "../../styles/systemconfig.css";

export default function SystemConfig() {
  // State for Point & Economics
  const [basePointRate, setBasePointRate] = useState("10");
  const [collectionBonus, setCollectionBonus] = useState("10%");
  const [conversionRate, setConversionRate] = useState("100:1");

  // State for Levels
  const [levels, setLevels] = useState([
    { id: 1, name: "Novice Donor", threshold: "100", reward: "Basic Mystery Box (3 Books)" },
    { id: 2, name: "Avid Reader", threshold: "500", reward: "Rare Collection Unlock (Victorian Set)" },
    { id: 3, name: "Bookworm", threshold: "1500", reward: "Premium Mystery Box + 5% Discount" },
    { id: 4, name: "Literary Elite", threshold: "5000", reward: "Exclusive Editions + Direct Support" },
  ]);

  // State for Mystery Collections
  const [mysteryBoxBooks, setMysteryBoxBooks] = useState("5");
  const [mysteryBoxPointsCost, setMysteryBoxPointsCost] = useState("200");
  const [rareCollectionMinLevel, setRareCollectionMinLevel] = useState("2"); // Stores ID

  const handleAddTier = () => {
    const newId = levels.length > 0 ? Math.max(...levels.map(l => l.id)) + 1 : 1;
    setLevels([...levels, { id: newId, name: "New Level", threshold: "0", reward: "TBD" }]);
  };

  const handleLevelChange = (id, field, value) => {
    setLevels(levels.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  return (
    <AdminLayout title="System Configuration" hideHeaderLabel={true} hideNotifications={true}>
      <div className="system-config-container">
        {/* Page Header */}
        <div style={{ marginBottom: "32px" }}>
          <h2 className="page-header-title">System Configuration & Platform Rules</h2>
          <p className="page-header-subtitle">Configure the core economic models, gamification tiers, and collection logic for the entire platform.</p>
        </div>

        {/* Section 1: Point & Economics Settings */}
        <section className="config-section-card">
          <div className="section-header">
            <h3 className="section-title">Point & Economics Settings</h3>
          </div>
          <div className="config-grid-3">
            <div className="config-input-group">
              <label className="config-label">Base Point Rate (Per Book)</label>
              <input 
                className="config-input" 
                type="text" 
                value={basePointRate}
                onChange={(e) => setBasePointRate(e.target.value)}
              />
              <p className="config-hint">Minimum points awarded for every single verified book donation.</p>
            </div>
            <div className="config-input-group">
              <label className="config-label">Collection Bonus %</label>
              <input 
                className="config-input" 
                type="text" 
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
              <p className="config-hint">Ratio of points to currency (e.g., 100 points = Rs. 100 discount).</p>
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
                  <th>Level Name</th>
                  <th>Points Threshold</th>
                  <th>Reward Unlock</th>
                  <th style={{ width: "50px" }}></th>
                </tr>
              </thead>
              <tbody>
                {levels.map((level) => (
                  <tr key={level.id}>
                    <td>
                      <input 
                        className="tier-input name-input" 
                        type="text" 
                        value={level.name}
                        onChange={(e) => handleLevelChange(level.id, 'name', e.target.value)}
                      />
                    </td>
                    <td>
                      <input 
                        className="tier-input threshold-input" 
                        type="text" 
                        value={level.threshold}
                        onChange={(e) => handleLevelChange(level.id, 'threshold', e.target.value)}
                      />
                    </td>
                    <td>
                      <span className="reward-pill">{level.reward}</span>
                    </td>
                    <td style={{ textAlign: "right", color: "#767777", cursor: "pointer" }}>
                      ✏️
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={handleAddTier} className="add-tier-btn">
              ➕ Add New Tier
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
                  type="text" 
                  value={mysteryBoxBooks}
                  onChange={(e) => setMysteryBoxBooks(e.target.value)}
                />
                <p className="config-hint">Number of random books included in a standard mystery box.</p>
              </div>
              <div className="config-input-group">
                <label className="config-label">Points Cost to Redeem</label>
                <input 
                  className="config-input" 
                  type="text" 
                  value={mysteryBoxPointsCost}
                  onChange={(e) => setMysteryBoxPointsCost(e.target.value)}
                />
                <p className="config-hint">Points required for a user to unlock/redeem a mystery box.</p>
              </div>
            </div>

            {/* Rare Collection Rules */}
            <div className="mystery-sub-card">
              <h4 className="mystery-sub-title">Rare Collection Rules</h4>
              <div className="config-input-group" style={{ marginBottom: "20px" }}>
                <label className="config-label">Minimum Level to Unlock</label>
                <select 
                  className="config-select"
                  value={rareCollectionMinLevel}
                  onChange={(e) => setRareCollectionMinLevel(e.target.value)}
                >
                  {levels.map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.threshold} pts)</option>
                  ))}
                </select>
                <p className="config-hint">Users must reach this level to browse rare curated collections.</p>
              </div>
              <div className="config-input-group">
                <label className="config-label">Auto-Curation Threshold</label>
                <input 
                  className="config-input" 
                  type="text" 
                  defaultValue="5 Books / Genre"
                />
                <p className="config-hint">Minimum donated books of the same genre to auto-suggest a new collection.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sticky Footer */}
        <footer className="config-sticky-footer">
          <button className="btn-cancel-config">Cancel Changes</button>
          <button className="btn-save-config">Save System Rules</button>
        </footer>
      </div>
    </AdminLayout>
  );
}
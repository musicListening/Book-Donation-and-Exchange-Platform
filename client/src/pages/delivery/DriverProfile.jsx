import '../../styles/delivery.css';

const DriverProfile = () => {
  return (
    <>
      <div className="page-header">
        <h1 style={{ fontSize: '40px' }}>Driver Profile</h1>
        <p>Manage your professional credentials and delivery performance.</p>
      </div>

      <div className="profile-grid">
        {/* Identity */}
        <section className="col-span-8 identity-card">
         
          <div className="info">
            <div className="name-title">
              <h3>Benjamin Thorne</h3>
              <p>Senior Logistics Partner</p>
            </div>
            <div className="details-grid">
              <div>
                <div className="field-label">Driver ID</div>
                <div className="field-value bold">AL-8829-THORNE</div>
              </div>
              <div>
                <div className="field-label">Contact</div>
                <div className="field-value">+44 7700 900 123</div>
              </div>
              <div>
                <div className="field-label">Email</div>
                <div className="field-value underline">b.thorne@arboreal.eco</div>
              </div>
              <div>
                <div className="field-label">Service Region</div>
                <div className="field-value">Greater London (Zone 1-2)</div>
              </div>
            </div>
          </div>
        </section>

        {/* Performance */}
        <section className="col-span-4 perf-card">
          <div className="bg-decoration">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          </div>
          <div className="perf-header">
            <span className="material-symbols-outlined">award_star</span>
            <h3>Performance</h3>
          </div>
          <div className="stat-group">
            <div className="stat-item">
              <div className="stat-label">Reliability Score</div>
              <div className="stat-value">
                98% <span className="trend material-symbols-outlined">trending_up</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Total CO2 Saved</div>
              <div className="stat-value">428 kg</div>
            </div>
          </div>
          <div className="member-since">
            <div className="label">Member Since</div>
            <div className="date">March 2023</div>
          </div>
        </section>

        {/* Vehicle */}
        <section className="col-span-5 vehicle-card">
          <div className="vehicle-header">
            <h3>Vehicle Details</h3>
            <span className="status-badge">Active</span>
          </div>
          <div className="vehicle-detail">
            <div className="icon-box">
              <span className="material-symbols-outlined">electric_bike</span>
            </div>
            <div className="info">
              <div className="label">Type</div>
              <div className="name">Eco-Cargo E-Bike v4</div>
              <div className="id">ARB-2291-EB</div>
            </div>
          </div>
          <div className="stats-row">
            <div className="stat-box">
              <span className="material-symbols-outlined" style={{ color: '#16a34a' }}>battery_horiz_075</span>
              <div>
                <div className="stat-label">Battery</div>
                <div className="stat-value">84%</div>
              </div>
            </div>
            <div className="stat-box">
              <span className="material-symbols-outlined" style={{ color: 'var(--on-tertiary-container)' }}>settings_suggest</span>
              <div>
                <div className="stat-label">Service in</div>
                <div className="stat-value">12 days</div>
              </div>
            </div>
          </div>
        </section>

        {/* Compliance */}
        <section className="col-span-7 compliance-card">
          <div className="compliance-header">
            <h3>Compliance & Documents</h3>
            <button className="update-btn">Update All</button>
          </div>
          <div className="doc-list">
            <div className="doc-item">
              <div className="doc-left">
                <div className="doc-icon"><span className="material-symbols-outlined">badge</span></div>
                <div className="doc-info">
                  <div className="doc-name">Driver License</div>
                  <div className="doc-meta">Expires: Dec 2025</div>
                </div>
              </div>
              <div className="doc-right"><span className="material-symbols-outlined">chevron_right</span></div>
            </div>
            <div className="doc-item">
              <div className="doc-left">
                <div className="doc-icon"><span className="material-symbols-outlined">verified_user</span></div>
                <div className="doc-info">
                  <div className="doc-name">Insurance Policy</div>
                  <div className="doc-meta">Verified • Auto-renews Mar 2024</div>
                </div>
              </div>
              <div className="doc-right"><span className="material-symbols-outlined">chevron_right</span></div>
            </div>
            <div className="doc-item">
              <div className="doc-left">
                <div className="doc-icon"><span className="material-symbols-outlined">description</span></div>
                <div className="doc-info">
                  <div className="doc-name">Tax Forms (FY23)</div>
                  <div className="doc-meta">Ready for download</div>
                </div>
              </div>
              <div className="doc-right"><span className="material-symbols-outlined download">download</span></div>
            </div>
          </div>
        </section>

        {/* Courier note */}
        <section className="col-span-12">
          <div className="courier-note">
            <div className="quote-mark">“</div>
            <div className="note-text">
              "Benjamin continues to set the standard for eco-friendly logistics in our London hub. His reliability score hasn't dipped below 97% in two years, and his commitment to the e-bike transition is a model for all our regional partners. A true asset to the ShareShelf community."
            </div>
            <div className="note-author">
              <div className="avatar-circle">SJ</div>
              <div>
                <div className="author-name">Sarah Jenkins</div>
                <div className="author-title">Regional Operations Manager, London</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default DriverProfile;
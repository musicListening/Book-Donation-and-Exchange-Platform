import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import "../../styles/CustomReportGeneration.css";

const reportDataTemplates = {
  "Total Points Provided": {
    title: "Points Distribution & Redemption Report",
    subtitle: "Summary of points issued, redeemed, and remaining platform balances",
    headers: ["Category", "Points Issued", "Points Redeemed", "Net Balance"],
    rows: [
      { col1: "Single Book Donations", col2: "12,500", col3: "0", col4: "+12,500" },
      { col1: "Collection Donations (w/ Bonus)", col2: "45,200", col3: "0", col4: "+45,200" },
      { col1: "Book Marketplace Purchases", col2: "0", col3: "18,400", col4: "-18,400" },
      { col1: "Craft Marketplace Purchases", col2: "0", col3: "8,500", col4: "-8,500" },
      { col1: "Total Platform Points", col2: "57,700", col3: "26,900", col4: "30,800" },
    ],
    chartData: [
      { label: "Issued", val: 85, color: "#1E4D4B" },
      { label: "Redeemed", val: 45, color: "#E9C46A" },
      { label: "Pending", val: 40, color: "#643C29" },
    ]
  },
  "Total Deliveries": {
    title: "Delivery & Fulfillment Status Report",
    subtitle: "Real-time tracking of book and craft shipments across all stages",
    headers: ["Status Stage", "Book Orders", "Craft Orders", "Total"],
    rows: [
      { col1: "Order Confirmed", col2: "45", col3: "12", col4: "57" },
      { col1: "Processed & Packed", col2: "38", col3: "10", col4: "48" },
      { col1: "At Airport / Courier", col2: "22", col3: "5", col4: "27" },
      { col1: "Arrived at Destination", col2: "115", col3: "28", col4: "143" },
      { col1: "Total Deliveries", col2: "220", col3: "55", col4: "275" },
    ],
    chartData: [
      { label: "Confirmed", val: 20, color: "#767777" },
      { label: "Processed", val: 35, color: "#E9C46A" },
      { label: "In Transit", val: 50, color: "#643C29" },
      { label: "Delivered", val: 85, color: "#1E4D4B" },
    ]
  },
  "Most Popular Collections": {
    title: "Top Performing Book Collections",
    subtitle: "Most requested and curated book bundles by genre",
    headers: ["Collection Name", "Category", "Units Sold", "Demand Trend"],
    rows: [
      { col1: "O/L Science Past Papers 2018-2024", col2: "Education", col3: "142", col4: "High" },
      { col1: "Harry Potter Full Series", col2: "Fiction", col3: "98", col4: "High" },
      { col1: "Classic Victorian Novels Set", col2: "Literature", col3: "76", col4: "Medium" },
      { col1: "A/L Mathematics Revision", col2: "Education", col3: "65", col4: "Medium" },
      { col1: "Children's Storybook Bundle", col2: "Kids", col3: "54", col4: "Low" },
    ],
    chartData: [
      { label: "Education", val: 90, color: "#1E4D4B" },
      { label: "Fiction", val: 75, color: "#E9C46A" },
      { label: "Literature", val: 60, color: "#643C29" },
      { label: "Kids", val: 40, color: "#767777" },
    ]
  },
  "Top Users Who Level Up": {
    title: "Top Users & Level Progression Report",
    subtitle: "Leaderboard of most active donors and their unlocked tier benefits",
    headers: ["User Identity", "Total Donated", "Current Level", "Next Unlock"],
    rows: [
      { col1: "sarah.jenkins@ethos.com", col2: "342 Books", col3: "Level 5 (Expert)", col4: "Mystery Box" },
      { col1: "marcus.thorne@ethos.com", col2: "215 Books", col3: "Level 4 (Advocate)", col4: "Rare Collection" },
      { col1: "elena.rodriguez@ethos.com", col2: "180 Books", col3: "Level 4 (Advocate)", col4: "Rare Collection" },
      { col1: "david.kim@ethos.com", col2: "120 Books", col3: "Level 3 (Supporter)", col4: "Level 4 Badge" },
      { col1: "amasha.fernando@ethos.com", col2: "95 Books", col3: "Level 3 (Supporter)", col4: "Level 4 Badge" },
    ],
    chartData: [
      { label: "Lvl 5", val: 15, color: "#1E4D4B" },
      { label: "Lvl 4", val: 35, color: "#E9C46A" },
      { label: "Lvl 3", val: 50, color: "#643C29" },
      { label: "Lvl 1-2", val: 80, color: "#767777" },
    ]
  }
};

export default function CustomReportGeneration() {
  const [reportType, setReportType] = useState("Total Points Provided");
  const [startDate, setStartDate] = useState("2026-06-01");
  const [endDate, setEndDate] = useState("2026-06-11");
  const [exportFormat, setExportFormat] = useState("PDF");
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [anonymizeUsers, setAnonymizeUsers] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [notification, setNotification] = useState("");

  // Setup initial report preview
  useEffect(() => {
    setCurrentReport(reportDataTemplates[reportType]);
  }, [reportType]);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      // Generate standard notification toast
      setNotification(`Report generated successfully as ${exportFormat}!`);
      setTimeout(() => setNotification(""), 4000);
    }, 1200);
  };

  const maskUserIdentity = (text) => {
    if (!anonymizeUsers) return text;
    if (text.includes("@")) {
      const [name, domain] = text.split("@");
      if (name.length <= 3) return `***@${domain}`;
      return `${name.substring(0, 2)}***@${domain}`;
    }
    // Handle standard user IDs or incident/txn codes
    if (text.startsWith("SEC-")) return "SEC-***";
    if (text.startsWith("sarah") || text.startsWith("marcus") || text.startsWith("elena") || text.startsWith("david") || text.startsWith("amasha")) {
      return text.substring(0, 2) + "***";
    }
    return text;
  };

  const report = currentReport || reportDataTemplates["Total Points Provided"];

  return (
    <AdminLayout title="Custom Reports" hideHeaderLabel={true} hideNotifications={true}>
      <div className="report-dashboard-container">
        {notification && (
          <div className="toast-notification">
            <span className="toast-icon">✨</span>
            <span className="toast-message">{notification}</span>
          </div>
        )}
        <header className="report-header">
          <h2 className="report-title">Custom Report Generation</h2>
          <p className="report-subtitle">Configure and visualize data exports for platform analytics and auditing.</p>
        </header>

        <div className="report-layout-grid">
          {/* Left Panel: Configuration Form */}
          <section className="control-panel-card">
            <h3 className="panel-title-label">Configuration</h3>
           
            <div className="form-stack">
              {/* Report Type Select */}
              <div className="form-group">
                <label className="input-label">Report Type</label>
                <div className="select-wrapper">
                  <select 
                    value={reportType} 
                    onChange={(e) => setReportType(e.target.value)}
                    className="styled-select"
                  >
                    <option>Total Points Provided</option>
                    <option>Total Deliveries</option>
                    <option>Most Popular Collections</option>
                    <option>Top Users Who Level Up</option>
                  </select>
                  <span className="select-arrow">▼</span>
                </div>
              </div>

              {/* Timeframe Pickers */}
              <div className="form-group">
                <label className="input-label">Timeframe</label>
                <div className="date-picker-row">
                  <div className="date-input-wrapper">
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="styled-date-input"
                    />
                  </div>
                  <span className="date-separator">—</span>
                  <div className="date-input-wrapper">
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="styled-date-input"
                    />
                  </div>
                </div>
              </div>

              {/* Segmented Buttons for Format */}
              <div className="form-group">
                <label className="input-label">Export Format</label>
                <div className="segmented-control">
                  {["PDF", "CSV", "JSON"].map((format) => (
                    <button
                      key={format}
                      type="button"
                      onClick={() => setExportFormat(format)}
                      className={`segment-btn ${exportFormat === format ? "active" : ""}`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkbox Options */}
              <div className="checkbox-options-stack">
                <label className="checkbox-label-group">
                  <input 
                    type="checkbox" 
                    checked={includeMetadata}
                    onChange={(e) => setIncludeMetadata(e.target.checked)}
                    className="hidden-checkbox"
                  />
                  <span className={`custom-checkbox ${includeMetadata ? "checked" : ""}`}>
                    {includeMetadata && <span className="checkmark">✓</span>}
                  </span>
                  <span className="checkbox-text">Include raw metadata</span>
                </label>

                <label className="checkbox-label-group">
                  <input 
                    type="checkbox" 
                    checked={anonymizeUsers}
                    onChange={(e) => setAnonymizeUsers(e.target.checked)}
                    className="hidden-checkbox"
                  />
                  <span className={`custom-checkbox ${anonymizeUsers ? "checked" : ""}`}>
                    {anonymizeUsers && <span className="checkmark">✓</span>}
                  </span>
                  <span className="checkbox-text">Anonymize user IDs</span>
                </label>
                {reportType === "Top Users Who Level Up" && (
                  <p className="checkbox-hint" style={{ fontSize: "0.8rem", color: "#767777", marginTop: "-8px" }}>
                    *Recommended for privacy compliance when exporting user leaderboards.
                  </p>
                )}
              </div>

              {/* Primary CTA */}
              <button 
                onClick={handleGenerateReport}
                className="btn-generate-report"
                disabled={isGenerating}
              >
                <span className="btn-icon-symbol">🪄</span>
                {isGenerating ? "Generating..." : "Generate Report"}
              </button>
            </div>
          </section>

          {/* Right Panel: Live Preview */}
          <section className="preview-canvas-column">
            <div className="document-preview-card">
              {/* Document Header */}
              <div className="doc-preview-header">
                <div className="doc-header-details">
                  <h4 className="doc-main-title">{report.title}</h4>
                  <p className="doc-sub-title">{report.subtitle}</p>
                </div>
                <div className="doc-badge-pill">
                  {exportFormat} FORMAT
                </div>
              </div>

              {/* Document Metadata Details (If checked) */}
              {includeMetadata && (
                <div className="doc-metadata-bar">
                  <span><strong>Date Span:</strong> {startDate || "N/A"} to {endDate || "N/A"}</span>
                  <span><strong>Security Hash:</strong> SHA-256/ETHOS-99</span>
                </div>
              )}

              {/* Document Main Data Table */}
              <div className="doc-table-wrapper">
                <table className="doc-preview-table">
                  <thead>
                    <tr>
                      {report.headers.map((h, i) => (
                        <th key={i}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.rows.map((row, index) => (
                      <tr key={index}>
                        <td className="font-mono">{maskUserIdentity(row.col1)}</td>
                        <td>{maskUserIdentity(row.col2)}</td>
                        <td>
                          {row.col3 === "High" || row.col3.includes("Level 5") || row.col3.includes("Expert") ? (
                            <span className="pill-status success">{row.col3}</span>
                          ) : row.col3 === "Medium" || row.col3.includes("Level 4") || row.col3.includes("Level 3") ? (
                            <span className="pill-status warning">{row.col3}</span>
                          ) : (
                            row.col3
                          )}
                        </td>
                        <td>{row.col4}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Visual CSS-based Chart */}
              <div className="doc-chart-wrapper">
                <h5 className="chart-label-title">Visualized Trends</h5>
                <div className="doc-chart-canvas">
                  {report.chartData.map((bar, index) => (
                    <div key={index} className="doc-chart-bar-group">
                      <div className="doc-chart-bar-container">
                        <div 
                          className="doc-chart-bar-fill"
                          style={{ 
                            height: `${bar.val}%`, 
                            backgroundColor: bar.color 
                          }}
                        >
                          <span className="bar-tooltip-val">{bar.val}%</span>
                        </div>
                      </div>
                      <span className="doc-chart-bar-label">{bar.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skeletons/Indicators Footer */}
              <div className="doc-preview-footer">
                <span className="footer-doc-stamp">Ethos Auditing & Compliance System</span>
                <span className="footer-doc-page">Page 1 of 1</span>
              </div>

              {/* Live Preview Mode Overlay (Absolute position) */}
              {isGenerating ? (
                <div className="loading-report-overlay">
                  <div className="spinner-loader"></div>
                  <p className="loading-text">Compiling database rows...</p>
                </div>
              ) : (
                <div className="live-preview-indicator-overlay">
                  <div className="indicator-badge">
                    <span className="pulsing-eye">👁</span>
                    <span>Live Preview Mode</span>
                  </div>
                </div>
              )}
            </div>

            {/* Context Info Chips */}
            <div className="preview-info-chips">
              <div className="info-chip accent-yellow">
                <span className="chip-dot"></span>
                <span>Real-time validation active</span>
              </div>
              <div className="info-chip accent-brown">
                <span className="chip-dot"></span>
                <span>Enterprise data masking</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
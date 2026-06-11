import React, { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import "../styles/CustomReportGeneration.css";

const reportDataTemplates = {
  "System Performance Audit": {
    title: "System Performance Audit Report",
    subtitle: "Enterprise Auditing & Latency Metrics",
    headers: ["Metric", "Value", "Status", "Last Checked"],
    rows: [
      { col1: "CPU Utilization", col2: "42.8%", col3: "Optimal", col4: "10 mins ago" },
      { col1: "Memory Usage", col2: "64.2 GB / 128 GB", col3: "Optimal", col4: "5 mins ago" },
      { col1: "API Response Latency", col2: "142 ms", col3: "Warning", col4: "1 min ago" },
      { col1: "Disk I/O Write Rate", col2: "98.4 MB/s", col3: "Optimal", col4: "15 mins ago" },
      { col1: "Network In/Out Traffic", col2: "1.2 Gbps / 840 Mbps", col3: "Optimal", col4: "2 mins ago" },
    ],
    chartData: [
      { label: "00:00", val: 30, color: "#1E4D4B" },
      { label: "04:00", val: 45, color: "#1E4D4B" },
      { label: "08:00", val: 80, color: "#E9C46A" },
      { label: "12:00", val: 95, color: "#643C29" },
      { label: "16:00", val: 75, color: "#1E4D4B" },
      { label: "20:00", val: 50, color: "#1E4D4B" },
    ]
  },
  "User Access & Permissions": {
    title: "Access Control & Security Logs",
    subtitle: "User Permissions Audit & Modifications",
    headers: ["User Identity", "Role", "Action Performed", "Access Status"],
    rows: [
      { col1: "sarah.jenkins@ethos.com", col2: "Community Admin", col3: "Modified Role #USR-104", col4: "Approved" },
      { col1: "marcus.thorne@ethos.com", col2: "Staff", col3: "Exported Books List", col4: "Approved" },
      { col1: "elena.rodriguez@ethos.com", col2: "End User", col3: "Requested Book Exchange", col4: "Approved" },
      { col1: "david.kim@ethos.com", col2: "Staff", col3: "Access Security Config", col4: "Denied" },
      { col1: "amasha.fernando@ethos.com", col2: "End User", col3: "Updated Profile Info", col4: "Approved" },
    ],
    chartData: [
      { label: "Mon", val: 60, color: "#1E4D4B" },
      { label: "Tue", val: 75, color: "#1E4D4B" },
      { label: "Wed", val: 95, color: "#E9C46A" },
      { label: "Thu", val: 85, color: "#1E4D4B" },
      { label: "Fri", val: 90, color: "#1E4D4B" },
      { label: "Sat", val: 40, color: "#643C29" },
    ]
  },
  "Resource Utilization": {
    title: "Storage & Bandwidth Utilization",
    subtitle: "Cloud Compute and Database Stats",
    headers: ["Component", "Allocated", "Used", "Efficiency"],
    rows: [
      { col1: "Amazon S3 Book Assets", col2: "50 TB", col3: "38.2 TB", col4: "76.4%" },
      { col1: "PostgreSQL Database", col2: "500 GB", col3: "342.5 GB", col4: "68.5%" },
      { col1: "CDN Cache Hit Rate", col2: "100%", col3: "92.4%", col4: "Optimal" },
      { col1: "Redis Cache Clusters", col2: "32 GB", col3: "24.8 GB", col4: "77.5%" },
      { col1: "Vite Client Hosting Node", col2: "2 Core", col3: "1.2 Core", col4: "70.0%" },
    ],
    chartData: [
      { label: "S3", val: 76, color: "#1E4D4B" },
      { label: "DB", val: 68, color: "#1E4D4B" },
      { label: "CDN", val: 92, color: "#E9C46A" },
      { label: "Redis", val: 77, color: "#1E4D4B" },
      { label: "Host", val: 70, color: "#1E4D4B" },
    ]
  },
  "Security Incident Log": {
    title: "Security Threat & Policy Audits",
    subtitle: "Active System Attacks & Intrusion Prev.",
    headers: ["Incident ID", "Severity", "Description", "Timestamp"],
    rows: [
      { col1: "SEC-8492", col2: "Low", col3: "Failed login threshold exceeded", col4: "Today, 18:24" },
      { col1: "SEC-8491", col2: "Medium", col3: "Suspected automated port scan", col4: "Today, 14:15" },
      { col1: "SEC-8490", col2: "High", col3: "SQL Injection attack blocked", col4: "Yesterday, 09:30" },
      { col1: "SEC-8489", col2: "Low", col3: "Session hijack prevention active", col4: "Yesterday, 08:12" },
      { col1: "SEC-8488", col2: "Low", col3: "Brute-force lockout for IP 192.168.1.1", col4: "June 9, 21:05" },
    ],
    chartData: [
      { label: "Low", val: 75, color: "#1E4D4B" },
      { label: "Med", val: 45, color: "#E9C46A" },
      { label: "High", val: 15, color: "#643C29" },
      { label: "Crit", val: 5, color: "#767777" },
    ]
  }
};

export default function CustomReportGeneration() {
  const [reportType, setReportType] = useState("System Performance Audit");
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
    if (text.startsWith("SEC-")) return "SEC-****";
    if (text.startsWith("sarah") || text.startsWith("marcus") || text.startsWith("elena") || text.startsWith("david") || text.startsWith("amasha")) {
      return text.substring(0, 2) + "****";
    }
    return text;
  };

  const report = currentReport || reportDataTemplates["System Performance Audit"];

  return (
    <AdminLayout title="Custom Reports">
      <div className="report-dashboard-container">
        {notification && (
          <div className="toast-notification">
            <span className="toast-icon">✨</span>
            <span className="toast-message">{notification}</span>
          </div>
        )}

        <header className="report-header">
          <h2 className="report-title">Custom Report Generation</h2>
          <p className="report-subtitle">Configure and visualize data exports for enterprise auditing.</p>
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
                    <option>System Performance Audit</option>
                    <option>User Access & Permissions</option>
                    <option>Resource Utilization</option>
                    <option>Security Incident Log</option>
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
                          {row.col3 === "Optimal" || row.col3 === "Approved" ? (
                            <span className="pill-status success">{row.col3}</span>
                          ) : row.col3 === "Warning" || row.col3 === "Denied" || row.col3 === "Medium" ? (
                            <span className="pill-status warning">{row.col3}</span>
                          ) : row.col3 === "High" ? (
                            <span className="pill-status danger">{row.col3}</span>
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

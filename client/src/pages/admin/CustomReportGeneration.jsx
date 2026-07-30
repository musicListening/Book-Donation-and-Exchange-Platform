import React, { useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { adminAPI } from "../../services/api";
import "../../styles/CustomReportGeneration.css";

export default function CustomReportGeneration() {
  const [reportType, setReportType] = useState("System Logs");
  const [startDate, setStartDate] = useState(() => new Date().getFullYear() + "-01-01");
  const [endDate, setEndDate] = useState(() => new Date().getFullYear() + "-12-31");
  const [exportFormat, setExportFormat] = useState("PDF");
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [anonymizeUsers, setAnonymizeUsers] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [notification, setNotification] = useState("");
  const [error, setError] = useState("");

  const handlePreview = async () => {
    setIsPreviewing(true);
    setError("");
    setNotification("");
    try {
      const data = await adminAPI.getReport(reportType, startDate, endDate);
      if (!data || !data.rows) throw new Error("No data returned");
      setCurrentReport(data);
    } catch (err) {
      const msg = err.message?.includes("HTTP 500")
        ? `Server error: Unable to generate "${reportType}" report. The database query may have failed.`
        : err.message?.includes("HTTP 404")
        ? `Report type "${reportType}" is not available on the server.`
        : `Failed to load preview: ${err.message || "Please try again."}`;
      setError(msg);
      console.error("Preview error:", err);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setError("");
    setNotification("");
    try {
      const data = await adminAPI.getReport(reportType, startDate, endDate);
      if (!data || !data.rows) throw new Error("No data returned for this report type");
      exportReport(data, exportFormat);
      setNotification(`Report downloaded as ${exportFormat}!`);
      setTimeout(() => setNotification(""), 4000);
    } catch (err) {
      const msg = err.message?.includes("HTTP 500")
        ? `Server error: Unable to generate "${reportType}" report.`
        : `Failed to export: ${err.message || "Please try again."}`;
      setError(msg);
      console.error("Export error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadBlob = (content, filename, mime) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sanitize = (v) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const toCSV = (report) => {
    const headers = report.headers || [];
    const lines = [headers.map(sanitize).join(",")];
    for (const row of report.rows || []) {
      lines.push(headers.map((_, i) => sanitize(row[`col${i + 1}`])).join(","));
    }
    return lines.join("\n");
  };

  const exportReport = (report, format) => {
    const stamp = new Date().toISOString().slice(0, 10);
    const base = `report_${reportType.replace(/\s+/g, "_").toLowerCase()}_${stamp}`;

    if (format === "JSON") {
      const payload = {
        title: report.title,
        subtitle: report.subtitle,
        generatedAt: new Date().toISOString(),
        dateSpan: { startDate, endDate },
        headers: report.headers,
        rows: report.rows,
      };
      downloadBlob(JSON.stringify(payload, null, 2), `${base}.json`, "application/json");
      return;
    }

    if (format === "CSV") {
      downloadBlob(toCSV(report), `${base}.csv`, "text/csv;charset=utf-8;");
      return;
    }

    // Save as PDF
    const html = `
      <html>
        <head>
          <title>${report.title}</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; padding: 32px; color: #1a1a1a; }
            h1 { font-size: 22px; margin: 0 0 6px; color: #1A6B68; }
            p.sub { color: #555; margin: 0 0 4px; font-size: 13px; }
            p.meta { color: #888; font-size: 12px; margin: 0 0 18px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #d0d0d0; padding: 9px 10px; text-align: left; font-size: 13px; }
            th { background: #1A6B68; color: #fff; }
            tr:nth-child(even) td { background: #f6f8f8; }
          </style>
        </head>
        <body>
          <h1>${report.title}</h1>
          <p class="sub">${report.subtitle || ""}</p>
          <p class="meta">Date Span: ${startDate} to ${endDate} &nbsp;|&nbsp; Generated: ${new Date().toLocaleString()}</p>
          <table>
            <thead><tr>${(report.headers || []).map((h) => `<th>${h}</th>`).join("")}</tr></thead>
            <tbody>
              ${(report.rows || []).map((r) => `<tr>${(report.headers || []).map((_, i) => `<td>${r[`col${i + 1}`] ?? ""}</td>`).join("")}</tr>`).join("")}
            </tbody>
          </table>
        </body>
      </html>`;
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => {
      if (iframe.parentNode) document.body.removeChild(iframe);
    }, 2000);
  };

  const maskUserIdentity = (text) => {
    if (!anonymizeUsers || typeof text !== "string") return text;
    if (text.includes("@")) {
      const [name, domain] = text.split("@");
      if (name.length <= 3) return `***@${domain}`;
      return `${name.substring(0, 2)}***@${domain}`;
    }
    return text;
  };

  return (
    <AdminLayout title="Custom Reports" hideHeaderLabel={true} hideNotifications={true}>
      <div className="report-dashboard-container">
        {notification && (
          <div className="toast-notification">
            <span className="toast-icon">✨</span>
            <span className="toast-message">{notification}</span>
          </div>
        )}
        {/* ============ HEADER ============ */}
        <header className="report-header">
          <h2 className="report-title">Custom Report Generation</h2>
          <p className="report-subtitle">Configure and visualize data exports for platform analytics and auditing.</p>
        </header>

        {/* ============ ERROR BANNER ============ */}
        {error && (
          <div style={{ backgroundColor: '#FDF2F2', color: '#C02B2B', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.85rem', fontWeight: 500 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', backgroundColor: '#C02B2B', color: '#fff', fontSize: 12, fontWeight: 700, marginRight: 8, flexShrink: 0 }}>!</span>
            {error}
          </div>
        )}

        <div className="report-layout-grid">
          {/* ============ LEFT PANEL — CONFIG ============ */}
          <section className="control-panel-card">
            <h3 className="panel-title-label">Configuration</h3>
           
            <div className="form-stack">
              {/* ===== REPORT TYPE ===== */}
              <div className="form-group">
                <label className="input-label">Report Type</label>
                <div className="select-wrapper">
                  <select 
                    value={reportType} 
                    onChange={(e) => setReportType(e.target.value)}
                    className="styled-select"
                  >
                    <option>System Logs</option>
                    <option>Total Deliveries</option>
                    <option>Most Popular Bundles</option>
                    <option>Top Users Who Level Up</option>
                  </select>
                  <span className="select-arrow">▼</span>
                </div>
              </div>

              {/* ===== DATE RANGE ===== */}
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

              {/* ===== FORMAT SELECT ===== */}
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

              {/* ===== OPTIONS ===== */}
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

              {/* ===== ACTIONS ===== */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={handlePreview}
                  className="btn-generate-report"
                  disabled={isPreviewing || isGenerating}
                  style={{ flex: 1, background: '#fff', color: '#1A6B68', border: '2px solid #1A6B68' }}
                >
                  {isPreviewing ? "Loading..." : "Preview Report"}
                </button>
                <button 
                  onClick={handleGenerateReport}
                  className="btn-generate-report"
                  disabled={isPreviewing || isGenerating}
                  style={{ flex: 1 }}
                >
                  <span className="btn-icon-symbol">↓</span>
                  {isGenerating ? "Exporting..." : `Export ${exportFormat}`}
                </button>
              </div>
            </div>
          </section>

          {/* ============ RIGHT PANEL — LIVE PREVIEW ============ */}
          <section className="preview-canvas-column">
            <div className="document-preview-card">
              {!currentReport ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-neutral)', fontSize: '0.95rem' }}>
                  {isPreviewing ? '' : 'Click "Preview Report" to see your data here'}
                </div>
              ) : (
                <>
                    {/* ===== PREVIEW HEADER ===== */}
                    <div className="doc-preview-header">
                      <div className="doc-header-details">
                      <h4 className="doc-main-title">{currentReport.title}</h4>
                      <p className="doc-sub-title">{currentReport.subtitle}</p>
                    </div>
                    <div className="doc-badge-pill">
                      {exportFormat} FORMAT
                    </div>
                  </div>

                  {/* ===== PREVIEW METADATA ===== */}
                  {includeMetadata && (
                    <div className="doc-metadata-bar">
                      <span><strong>Date Span:</strong> {startDate || "N/A"} to {endDate || "N/A"}</span>
                      <span><strong>Security Hash:</strong> SHA-256/ETHOS-99</span>
                    </div>
                  )}

                  {/* ===== PREVIEW TABLE ===== */}
                  <div className="doc-table-wrapper">
                    <table className="doc-preview-table">
                      <thead>
                        <tr>
                          {currentReport.headers.map((h, i) => (
                            <th key={i}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {currentReport.rows.map((row, index) => (
                          <tr key={index}>
                            {currentReport.headers.map((_, i) => {
                              const val = row[`col${i + 1}`];
                              if (i === 0) return <td key={i} className="font-mono">{maskUserIdentity(val)}</td>;
                              if (i === 1 && (val === "High" || (typeof val === 'string' && (val.includes("Level 5") || val.includes("Expert"))))) {
                                return <td key={i}><span className="pill-status success">{val}</span></td>;
                              }
                              if (i === 1 && (val === "Medium" || (typeof val === 'string' && (val.includes("Level 4") || val.includes("Level 3"))))) {
                                return <td key={i}><span className="pill-status warning">{val}</span></td>;
                              }
                              return <td key={i}>{typeof val === 'string' ? maskUserIdentity(val) : val}</td>;
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* ===== PREVIEW CHART ===== */}
                  <div className="doc-chart-wrapper">
                    <h5 className="chart-label-title">Visualized Trends</h5>
                    <div className="doc-chart-canvas">
                      {currentReport.chartData.map((bar, index) => (
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

                  {/* ===== PREVIEW FOOTER ===== */}
                  <div className="doc-preview-footer">
                    <span className="footer-doc-stamp">Ethos Auditing & Compliance System</span>
                    <span className="footer-doc-page">Page 1 of 1</span>
                  </div>
                </>
              )}

              {/* ===== PREVIEW OVERLAY ===== */}
              {isPreviewing && (
                <div className="loading-report-overlay">
                  <div className="spinner-loader"></div>
                  <p className="loading-text">Fetching report data...</p>
                </div>
              )}
              {!isPreviewing && currentReport && (
                <div className="live-preview-indicator-overlay">
                  <div className="indicator-badge">
                    <span className="pulsing-eye" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ display: 'inline-block', width: 16, height: 10, border: '2px solid currentColor', borderRadius: '50%', position: 'relative' }}>
                        <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 4, height: 4, borderRadius: '50%', backgroundColor: 'currentColor' }} />
                      </span>
                    </span>
                    <span>Live Preview Mode</span>
                  </div>
                </div>
              )}
            </div>

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
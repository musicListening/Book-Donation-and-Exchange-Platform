import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import "../styles/AdminDashboard.css";
import "../styles/Reports.css";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Monthly");

  // Report Generator States
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const [reportType, setReportType] = useState("Donations Summary");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);

  const recentDonations = [
    { id: "#TXN-84920", donor: "Sarah Jenkins", quantity: "12 Books", status: "Verified", points: "+240 pts", date: "May 24, 2024" },
    { id: "#TXN-84919", donor: "Marcus Thorne", quantity: "4 Books", status: "Pending", points: "+80 pts", date: "May 24, 2024" },
    { id: "#TXN-84918", donor: "Elena Rodriguez", quantity: "28 Books", status: "Verified", points: "+560 pts", date: "May 23, 2024" },
    { id: "#TXN-84917", donor: "David Kim", quantity: "15 Books", status: "Verified", points: "+300 pts", date: "May 22, 2024" },
  ];

  const genres = [
    { name: "Literary Fiction", percentage: 32, color: "#1E4D4B" },
    { name: "Science & Technology", percentage: 28, color: "#E9C46A" },
    { name: "Biography & Memoir", percentage: 18, color: "#643C29" },
    { name: "History", percentage: 12, color: "#767777" },
    { name: "Young Adult", percentage: 10, color: "#1E4D4B" },
  ];

  const handleGenerateReport = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneratedReport(null);

    setTimeout(() => {
      setIsLoading(false);
      
      let mockData = [];
      let metrics = {};

      if (reportType === "Donations Summary") {
        mockData = [
          { date: "May 24, 2024", donor: "Sarah Jenkins", quantity: "12 Books", status: "Verified", points: "240 pts" },
          { date: "May 24, 2024", donor: "Marcus Thorne", quantity: "4 Books", status: "Pending", points: "80 pts" },
          { date: "May 23, 2024", donor: "Elena Rodriguez", quantity: "28 Books", status: "Verified", points: "560 pts" },
          { date: "May 22, 2024", donor: "David Kim", quantity: "15 Books", status: "Verified", points: "300 pts" },
        ];
        metrics = {
          stat1: { label: "Total Donations", value: "59 Books" },
          stat2: { label: "Points Distributed", value: "1,180 pts" },
          stat3: { label: "Verification Rate", value: "97.8%" }
        };
      } else if (reportType === "Active Users") {
        mockData = [
          { date: "Joined Jun 05, 2026", name: "Arjun Sharma", email: "user@example.com", status: "Active", points: "450 pts" },
          { date: "Joined May 20, 2026", name: "Priya Patel", email: "priya@example.com", status: "Active", points: "890 pts" },
        ];
        metrics = {
          stat1: { label: "Total Active Users", value: "3,842 Members" },
          stat2: { label: "New Users This Month", value: "+148 Users" },
          stat3: { label: "Avg Balance", value: "340 pts" }
        };
      } else {
        mockData = [
          { date: "Transaction Date", item: "Cozy Winter Reads Redeem", user: "Vikram R.", quantity: "-250 pts", status: "Completed" },
          { date: "Transaction Date", item: "Donation Reward", user: "Elena Rodriguez", quantity: "+560 pts", status: "Completed" },
        ];
        metrics = {
          stat1: { label: "Total Points Redeemed", value: "48,250 pts" },
          stat2: { label: "Points Circulating", value: "890,410 pts" },
          stat3: { label: "Redeem Rate", value: "72.4%" }
        };
      }

      setGeneratedReport({
        title: `${reportType} (${dateRange})`,
        type: reportType,
        metrics,
        data: mockData
      });
    }, 1200);
  };

  const handleExport = (format) => {
    alert(`Exporting report as ${format.toUpperCase()}...`);
  };

  return (
    <AdminLayout title="Admin Console">
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <p className="stat-label">Total Books Donated</p>
            <h3 className="stat-value">14,280</h3>
            <span className="stat-trend positive">+12.5%</span>
          </div>
          <div className="stat-icon">📚</div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <p className="stat-label">Active Readers</p>
            <h3 className="stat-value">8,432</h3>
            <span className="stat-trend positive">+5.2%</span>
          </div>
          <div className="stat-icon">👥</div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <p className="stat-label">Points Issued</p>
            <h3 className="stat-value">124.5k</h3>
            <span className="stat-trend negative">-2.4%</span>
          </div>
          <div className="stat-icon">⭐</div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <p className="stat-label">Platform Efficiency</p>
            <h3 className="stat-value">98.2%</h3>
            <span className="stat-trend positive">+0.8%</span>
          </div>
          <div className="stat-icon">⚡</div>
        </div>
      </section>

      <section className="data-grid">
        <div className="chart-card">
          <div className="card-header">
            <h3>Monthly Performance Metrics</h3>
            <div className="tabs">
              {["Daily", "Monthly", "Yearly"].map((tab) => (
                <button
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="chart-container">
            <div className="chart-bars">
              {["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL"].map((month, index) => {
                const height = [40, 55, 45, 70, 85, 60, 75][index];
                return (
                  <div key={month} className="bar-group">
                    <div className="bar" style={{ height: `${height}%`, backgroundColor: month === "MAY" ? "#E9C46A" : "#1E4D4B" }}></div>
                    <span className="bar-label">{month}</span>
                  </div>
                );
              })}
            </div>
            <div className="chart-legend">
              <span className="legend-item"><span className="dot primary"></span> Donated: 2,840</span>
              <span className="legend-item"><span className="dot secondary"></span> Points: 8,200</span>
            </div>
          </div>
        </div>

        <div className="genres-card">
          <div className="card-header">
            <h3>Popular Book Genres</h3>
            <button className="text-btn">View Detailed Breakdown →</button>
          </div>
          <div className="genres-list">
            {genres.map((genre) => (
              <div key={genre.name} className="genre-item">
                <div className="genre-info">
                  <span className="genre-name">{genre.name}</span>
                  <span className="genre-percent">{genre.percentage}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${genre.percentage}%`, backgroundColor: genre.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Toggleable Custom Report Generator Panel */}
      {showReportGenerator && (
        <section className="reports-container" style={{ marginBottom: '24px' }}>
          <div className="report-setup-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0 }}><i className="fa-solid fa-file-invoice"></i> Configure Custom Report</h2>
              <button 
                onClick={() => setShowReportGenerator(false)} 
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--grey)' }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleGenerateReport}>
              <div className="form-row">
                <div className="form-group">
                  <label>Report Type</label>
                  <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                    <option value="Donations Summary">Donations Summary</option>
                    <option value="Active Users">Active Users & Activity</option>
                    <option value="Points Transaction Ledger">Points Transaction Ledger</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Date Range</label>
                  <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                    <option value="Last 7 Days">Last 7 Days</option>
                    <option value="Last 30 Days">Last 30 Days</option>
                    <option value="Last 90 Days">Last 90 Days</option>
                    <option value="Custom Range">Custom Range (All Time)</option>
                  </select>
                </div>

                <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                  <button type="submit" className="generate-btn">
                    <i className="fa-solid fa-arrows-rotate"></i> Generate Report
                  </button>
                </div>
              </div>
            </form>
          </div>

          {isLoading && (
            <div className="report-viewer report-loading-container">
              <div className="spinner"></div>
              <p>Compiling database entries & generating report graphs...</p>
            </div>
          )}

          {generatedReport && (
            <div className="report-viewer">
              <div className="report-viewer-header">
                <h3>{generatedReport.title}</h3>
                <div className="report-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => handleExport('csv')}>
                    <i className="fa-solid fa-file-csv"></i> Export CSV
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => handleExport('pdf')}>
                    <i className="fa-solid fa-file-pdf"></i> Export PDF
                  </button>
                </div>
              </div>

              <div className="report-summary-boxes">
                <div className="report-summary-card">
                  <h4>{generatedReport.metrics.stat1.label}</h4>
                  <p>{generatedReport.metrics.stat1.value}</p>
                </div>
                <div className="report-summary-card accent">
                  <h4>{generatedReport.metrics.stat2.label}</h4>
                  <p>{generatedReport.metrics.stat2.value}</p>
                </div>
                <div className="report-summary-card success">
                  <h4>{generatedReport.metrics.stat3.label}</h4>
                  <p>{generatedReport.metrics.stat3.value}</p>
                </div>
              </div>

              <table className="admin-mini-table">
                <thead>
                  {generatedReport.type === "Donations Summary" ? (
                    <tr>
                      <th>Date</th>
                      <th>Donor Name</th>
                      <th>Quantity</th>
                      <th>Earned Points</th>
                      <th>Status</th>
                    </tr>
                  ) : generatedReport.type === "Active Users" ? (
                    <tr>
                      <th>Join Date</th>
                      <th>Member Name</th>
                      <th>Email Address</th>
                      <th>Current Balance</th>
                      <th>Account Status</th>
                    </tr>
                  ) : (
                    <tr>
                      <th>Transaction Date</th>
                      <th>Ledger Description</th>
                      <th>Member Account</th>
                      <th>Ledger Value</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {generatedReport.type === "Donations Summary" ? (
                    generatedReport.data.map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.date}</td>
                        <td>{row.donor}</td>
                        <td>{row.quantity}</td>
                        <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>{row.points}</td>
                        <td>
                          <span className={`admin-badge admin-badge-${row.status.toLowerCase()}`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : generatedReport.type === "Active Users" ? (
                    generatedReport.data.map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.date}</td>
                        <td style={{ fontWeight: 'bold' }}>{row.name}</td>
                        <td>{row.email}</td>
                        <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{row.points}</td>
                        <td>
                          <span className={`admin-badge ${row.status === 'Active' ? 'admin-badge-verified' : 'admin-badge-pending'}`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    generatedReport.data.map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.date}</td>
                        <td style={{ fontWeight: 'bold' }}>{row.item}</td>
                        <td>{row.user}</td>
                        <td style={{ color: row.quantity.startsWith('-') ? 'var(--error)' : 'var(--success)', fontWeight: 'bold' }}>
                          {row.quantity}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <section className="table-card">
        <div className="card-header">
          <h3>Recent Donations Activity</h3>
          <button className="action-btn" onClick={() => setShowReportGenerator(!showReportGenerator)}>
            {showReportGenerator ? "Hide Report Panel" : "Generate Custom Report"}
          </button>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Donor Name</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Points</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentDonations.map((row) => (
                <tr key={row.id}>
                  <td className="font-mono">{row.id}</td>
                  <td>{row.donor}</td>
                  <td>{row.quantity}</td>
                  <td>
                    <span className={`status-badge ${row.status.toLowerCase()}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="text-success">{row.points}</td>
                  <td>{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
}

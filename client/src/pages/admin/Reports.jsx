// client/src/pages/Reports.jsx

import React, { useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import "../../styles/Reports.css";

export default function Reports() {
  const [reportType, setReportType] = useState("Donations Summary");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);

  const handleGenerateReport = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneratedReport(null);

    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
      
      let mockData = [];
      let metrics = {};

      if (reportType === "Donations Summary") {
        mockData = [
          { date: "Jun 12, 2026", donor: "Sarah Jenkins", quantity: "12 Books", status: "Verified", points: "240 pts" },
          { date: "Jun 12, 2026", donor: "Marcus Thorne", quantity: "4 Books", status: "Pending", points: "80 pts" },
          { date: "Jun 11, 2026", donor: "Elena Rodriguez", quantity: "28 Books", status: "Verified", points: "560 pts" },
          { date: "Jun 10, 2026", donor: "David Kim", quantity: "15 Books", status: "Verified", points: "300 pts" },
          { date: "Jun 08, 2026", donor: "Aman Gupta", quantity: "8 Books", status: "Verified", points: "160 pts" },
        ];
        metrics = {
          stat1: { label: "Total Donations", value: "67 Books" },
          stat2: { label: "Points Distributed", value: "1,340 pts" },
          stat3: { label: "Verification Rate", value: "98.5%" }
        };
      } else if (reportType === "Active Users") {
        mockData = [
          { date: "Joined Jun 05, 2026", name: "Arjun Sharma", email: "user@example.com", status: "Active", points: "450 pts" },
          { date: "Joined May 20, 2026", name: "Priya Patel", email: "priya@example.com", status: "Active", points: "890 pts" },
          { date: "Joined Apr 15, 2026", name: "Rajesh Kumar", email: "rajesh@example.com", status: "Inactive", points: "120 pts" },
          { date: "Joined Feb 10, 2026", name: "Ananya Iyer", email: "ananya@example.com", status: "Active", points: "1,450 pts" },
        ];
        metrics = {
          stat1: { label: "Total Active Users", value: "3,842 Members" },
          stat2: { label: "New Users This Month", value: "+148 Users" },
          stat3: { label: "Avg Balance", value: "340 pts" }
        };
      } else {
        // Points Distribution / Other
        mockData = [
          { date: "Transaction Date", item: "Cozy Winter Reads Bundle Redeem", user: "Vikram R.", quantity: "-250 pts", status: "Completed" },
          { date: "Transaction Date", item: "Hand-Painted Bookmarks Buy", user: "Ananya S.", quantity: "-75 pts", status: "Completed" },
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
    <AdminLayout title="System Reports">
      <div className="reports-container">
        
        {/* Setup Section */}
        <section className="report-setup-card">
          <h2><i className="fa-solid fa-file-invoice"></i> Configure Custom Report</h2>
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
        </section>

        {/* Loader state */}
        {isLoading && (
          <div className="report-viewer report-loading-container">
            <div className="spinner"></div>
            <p>Compiling database entries & generating report graphs...</p>
          </div>
        )}

        {/* Output Section */}
        {generatedReport && (
          <section className="report-viewer">
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
          </section>
        )}

      </div>
    </AdminLayout>
  );
}

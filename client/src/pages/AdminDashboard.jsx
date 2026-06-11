import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import "../styles/AdminDashboard.css";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Monthly");

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

      <section className="table-card">
        <div className="card-header">
          <h3>Recent Donations Activity</h3>
          <button className="action-btn">Download CSV Report</button>
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

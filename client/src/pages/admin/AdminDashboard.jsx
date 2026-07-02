import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import "../../styles/AdminDashboard.css";

const API_URL = "http://localhost:5000/api";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Monthly");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/admin/dashboard`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Admin Console">
        <div className="loading-state">
          <span className="loading-spinner">⏳</span>
          <p>Loading dashboard data...</p>
        </div>
      </AdminLayout>
    );
  }

  const stats = data?.stats || {};
  const genres = data?.genreDistribution || [];
  const daily = data?.dailyPerformance || [];
  const monthly = data?.monthlyPerformance || [];
  const yearly = data?.yearlyPerformance || [];
  const performanceData = { Daily: daily, Monthly: monthly, Yearly: yearly }[activeTab] || [];
  const recentDonations = data?.recentDonations || [];
  const maxBooks = Math.max(...performanceData.map((m) => m.books), 1);
  const genreColors = ["#1E4D4B", "#E9C46A", "#643C29", "#767777", "#2A9D8F", "#E76F51", "#457B9D"];
  const totalGenreCount = genres.reduce((s, g) => s + g.count, 0);

  return (
    <AdminLayout title="Admin Console">
      <div className="page-header">
        <div>
          <h2 className="page-title">Analytics Dashboard</h2>
          <p className="page-subtitle">Platform performance and activity overview.</p>
        </div>
        <div className="period-badge">
          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>schedule</span>
          Last 30 Days
        </div>
      </div>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <p className="stat-label">Total Books Donated</p>
            <h3 className="stat-value">{(stats.totalBooksDonated || 0).toLocaleString()}</h3>
            <span className="stat-trend positive">{stats.totalDonations} Donation{stats.totalDonations !== 1 ? "s" : ""}</span>
          </div>
          <div className="stat-icon stat-icon-books"></div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <p className="stat-label">Active Readers</p>
            <h3 className="stat-value">{(stats.activeReaders || 0).toLocaleString()}</h3>
            <span className="stat-trend positive">{stats.totalOrders} Orders Placed</span>
          </div>
          <div className="stat-icon stat-icon-readers"></div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <p className="stat-label">Points Issued</p>
            <h3 className="stat-value">{(stats.pointsIssued || 0).toLocaleString()}</h3>
            <span className="stat-trend negative">{stats.pointsSpent || 0} Spent</span>
          </div>
          <div className="stat-icon stat-icon-points"></div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <p className="stat-label">Craft Listings</p>
            <h3 className="stat-value">{(stats.craftListings || 0).toLocaleString()}</h3>
            <span className="stat-trend positive">{stats.craftSold || 0} Sold</span>
          </div>
          <div className="stat-icon stat-icon-craft"></div>
        </div>
      </section>

      <section className="data-grid">
        <div className="chart-card">
          <div className="card-header">
            <h3>{activeTab} Performance</h3>
            <div className="tabs">
              {["Daily", "Monthly", "Yearly"].map((tab) => (
                <button key={tab}
                  className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >{tab}</button>
              ))}
            </div>
          </div>
          <div className="chart-container">
            <div className="chart-bars">
              {performanceData.length > 0 ? performanceData.map((m) => (
                <div key={m.label} className="bar-group">
                  <div className="bar" style={{
                    height: `${Math.max((m.books / maxBooks) * 100, 6)}%`,
                    backgroundColor: "#1E4D4B"
                  }}></div>
                  <span className="bar-label">{m.label}</span>
                </div>
              )) : <div className="chart-empty">No data yet</div>}
            </div>
            <div className="chart-legend">
              <span className="legend-item"><span className="dot primary"></span> {(stats.totalBooksDonated || 0).toLocaleString()} Books Donated</span>
              <span className="legend-item"><span className="dot secondary"></span> {(stats.pointsIssued || 0).toLocaleString()} Points Issued</span>
            </div>
          </div>
        </div>

        <div className="genres-card">
          <div className="card-header">
            <h3>Popular Book Genres</h3>
          </div>
          <div className="genres-list">
            {genres.length > 0 ? genres.map((genre, i) => (
              <div key={genre.name} className="genre-item">
                <div className="genre-info">
                  <span className="genre-name">{genre.name}</span>
                  <span className="genre-percent">
                    {totalGenreCount > 0 ? Math.round((genre.count / totalGenreCount) * 100) : 0}%
                  </span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{
                    width: `${(genre.count / totalGenreCount) * 100}%`,
                    backgroundColor: genreColors[i % genreColors.length]
                  }}></div>
                </div>
              </div>
            )) : <div className="chart-empty">No genre data yet</div>}
          </div>
        </div>
      </section>

      <section className="table-card">
        <div className="card-header">
          <h3>Recent Donations Activity</h3>
          <span className="donation-count">{recentDonations.length} Records</span>
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
              {recentDonations.length > 0 ? recentDonations.map((row, i) => (
                <tr key={i}>
                  <td className="font-mono">{row.id}</td>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar"></div>
                      <div>
                        <span className="user-name">{row.donor}</span>
                        <br />
                        <span className="user-email">{row.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>{row.quantity}</td>
                  <td>
                    <span className={`status-badge ${row.status?.toLowerCase()}`}>{row.status}</span>
                  </td>
                  <td className="text-success">{row.points}</td>
                  <td>{row.date}</td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="empty-state">No donations recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
}

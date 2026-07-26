import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import "../../styles/AdminDashboard.css";
import { TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { adminAPI } from "../../services/api";

const GENRE_COLORS = [
  "#1E4D4B",
  "#E9C46A",
  "#643C29",
  "#767777",
  "#2A9D8F",
  "#E76F51",
  "#457B9D",
];

function statusTone(s) {
  const status = s || "";
  if (status === "Verified") return "success";
  if (status === "Pending") return "warn";
  if (status === "Flagged") return "danger";
  return "neutral";
}

function MetricCard({ variant, label, value, hint, delta }) {
  const isAccent = variant === "accent";
  return (
    <div className={`metric-card-box ${isAccent ? "metric-card-accent" : ""}`}>
      <p className="metric-label-text">{label}</p>
      <p className="metric-value-text">{value}</p>
      {hint && <p className="metric-hint-text">{hint}</p>}
      {delta && <span className="metric-delta-text">{delta}</span>}
    </div>
  );
}

function StatusPill({ label, tone }) {
  const toneClass = `status-${tone || "neutral"}`;
  return (
    <span className={`status-pill-badge ${toneClass}`}>
      {label}
    </span>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Monthly");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    adminAPI.getDashboard()
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard data fetch failed:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
    <AdminLayout title="Admin Console" hideNotifications={true}>
        <div className="loading-box">
          <span className="loading-spinner-char">⏳</span>
          <p className="loading-text">Loading dashboard analytics...</p>
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
  const totalGenreCount = genres.reduce((s, g) => s + g.count, 0);

  const totalBooksDonatedStr = (stats.totalBooksDonated || 0).toLocaleString();
  const activeReadersStr = (stats.activeReaders || 0).toLocaleString();
  const pointsIssuedStr = (stats.pointsIssued || 0).toLocaleString();
  const craftListingsStr = (stats.craftListings || 0).toLocaleString();

  return (
    <AdminLayout title="Admin Console" hideNotifications={true}>
      <header className="dashboard-header-bar">
        <div className="dashboard-header-inner">
          <div className="dashboard-header-title-block">
            <p className="dashboard-pretitle">Admin · Analytics</p>
            <h2 className="dashboard-title">Analytics Dashboard</h2>
            <p className="dashboard-subtitle">Platform performance and activity overview.</p>
          </div>
          <div className="dashboard-period-badge">Last 30 Days</div>
        </div>
      </header>

      <div className="dashboard-content-wrapper">
        {/* ── Hero ink panel ───────────────────────────────────────────────── */}
        <section className="hero-ink-panel">
          <div className="hero-grid">
            <div>
              <p className="hero-intro-label">Platform overview</p>
              <h2 className="hero-headline">
                Books shared,{" "}
                <span className="hero-headline-italic">communities built.</span>
              </h2>
              <p className="hero-description">
                {totalBooksDonatedStr} books donated across{" "}
                {stats.totalDonations || 0} transactions. {activeReadersStr} active
                readers with {pointsIssuedStr} points in circulation.
              </p>
            </div>
            <div className="hero-stats-subgrid">
              {[
                {
                  label: "Books Donated",
                  value: totalBooksDonatedStr,
                  hint: `${stats.totalDonations || 0} transactions`,
                },
                {
                  label: "Active Readers",
                  value: activeReadersStr,
                  hint: `${stats.totalOrders || 0} orders`,
                },
                {
                  label: "Points Issued",
                  value: pointsIssuedStr,
                  hint: `${(stats.pointsSpent || 0).toLocaleString()} spent`,
                },
                {
                  label: "Craft Listings",
                  value: craftListingsStr,
                  hint: `${stats.craftSold || 0} sold`,
                },
              ].map((m) => (
                <div key={m.label} className="hero-stat-box">
                  <p className="hero-stat-label">{m.label}</p>
                  <p className="hero-stat-value">{m.value}</p>
                  <p className="hero-stat-hint">{m.hint}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stat row ─────────────────────────────────────────────────────── */}
        <section className="metric-cards-row">
          <MetricCard
            variant="accent"
            label="Total Books Donated"
            value={totalBooksDonatedStr}
            hint={`${stats.totalDonations || 0} Donations`}
          />
          <MetricCard
            label="Active Readers"
            value={activeReadersStr}
            hint={`${stats.totalOrders || 0} Orders`}
          />
          <MetricCard
            label="Total Orders Placed"
            value={(stats.totalOrders || 0).toLocaleString()}
            hint={`${stats.completedOrders || 0} Completed Orders`}
          />
          <MetricCard
            label="Sri Lankan Rupees (LKR)"
            value={`LKR ${(stats.totalEarnedLKR || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            hint="Earned from completed orders"
          />
          <MetricCard
            label="Points Issued"
            value={pointsIssuedStr}
            delta={`${(stats.pointsSpent || 0).toLocaleString()} Spent`}
          />
          <MetricCard
            label="Craft Listings"
            value={craftListingsStr}
            hint={`${stats.craftSold || 0} Sold`}
          />
        </section>

        {/* ── Performance chart + Genre distribution ────────────────────────── */}
        <section className="charts-split-grid">
          {/* Performance chart */}
          <div className="editorial-card-box">
            <div className="editorial-card-header">
              <div>
                <p className="card-pretitle">Section 01</p>
                <h3 className="card-headline">
                  {activeTab} Performance
                  <TrendingUp className="w-4 h-4" style={{ color: "var(--teal-primary)", marginLeft: "6px" }} />
                </h3>
              </div>
              <div className="tab-buttons-container">
                {["Daily", "Monthly", "Yearly"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`tab-toggle-btn ${activeTab === tab ? "btn-active" : ""}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-52" style={{ height: "220px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={performanceData}
                  margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="rgba(26, 107, 104, 0.08)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    stroke="#5C6A6A"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#5C6A6A"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(26, 107, 104, 0.04)" }}
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid rgba(26, 107, 104, 0.15)",
                      borderRadius: 4,
                      fontSize: 12,
                      fontFamily: "Inter, sans-serif"
                    }}
                    formatter={(v) => [v, "Books"]}
                  />
                  <Bar
                    dataKey="books"
                    fill="#1A6B68"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-bottom-legend">
              <span className="legend-indicator">
                <span
                  className="legend-indicator-dot"
                  style={{ background: "#1A6B68" }}
                />
                {totalBooksDonatedStr} Books Donated
              </span>
              <span className="legend-indicator">
                <span
                  className="legend-indicator-dot"
                  style={{ background: "#E9C46A" }}
                />
                {pointsIssuedStr} Points Issued
              </span>
            </div>
          </div>

          {/* Genre distribution */}
          <div className="editorial-card-box">
            <div style={{ marginBottom: "20px" }}>
              <p className="card-pretitle">Section 02</p>
              <h3 className="card-headline">Popular Genres</h3>
            </div>
            <div className="genres-progress-list">
              {genres.length > 0 ? (
                genres.map((genre, i) => {
                  const pct = totalGenreCount > 0 ? Math.round((genre.count / totalGenreCount) * 100) : 0;
                  return (
                    <div key={genre.name} className="genre-progress-row">
                      <div className="genre-text-meta">
                        <span className="genre-name-label">{genre.name}</span>
                        <span className="genre-pct-value">{pct}%</span>
                      </div>
                      <div className="genre-progress-track">
                        <div
                          className="genre-progress-bar"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: GENRE_COLORS[i % GENRE_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-cell-state">No genre data yet</div>
              )}
            </div>
          </div>
        </section>

        {/* ── Recent Donations table ────────────────────────────────────────── */}
        <section className="table-editorial-box">
          <div className="table-header-bar">
            <div>
              <p className="card-pretitle">Section 03</p>
              <h3 className="card-headline">Recent Donations Activity</h3>
            </div>
            <span className="records-badge">
              {recentDonations.length} Records
            </span>
          </div>
          <div className="table-responsive-container">
            <table className="editorial-data-table">
              <thead>
                <tr>
                  {[
                    "Transaction ID",
                    "Donor Name",
                    "Quantity",
                    "Status",
                    "Points",
                    "Date",
                  ].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentDonations.length > 0 ? (
                  recentDonations.map((row, i) => {
                    const initials = row.donor
                      ? row.donor.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                      : "DN";
                    return (
                      <tr key={i}>
                        <td className="table-txn-mono">
                          {row.id}
                        </td>
                        <td>
                          <div className="donor-cell-wrapper">
                            <div
                              className="donor-avatar-circle"
                              style={{
                                background: `linear-gradient(135deg, #1A6B68, #0F4F4D)`,
                              }}
                            >
                              {initials}
                            </div>
                            <div>
                              <p className="donor-name-text">{row.donor}</p>
                              <p className="donor-email-text">{row.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>{row.quantity}</td>
                        <td>
                          <StatusPill
                            label={row.status}
                            tone={statusTone(row.status)}
                          />
                        </td>
                        <td className="points-table-col">
                          {row.points}
                        </td>
                        <td style={{ color: "#5C6A6A" }}>
                          {row.date}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="empty-cell-state">
                      No recent donations recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

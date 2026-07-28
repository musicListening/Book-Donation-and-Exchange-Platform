import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import "../../styles/ReviewManagement.css";
import { showToast } from "../../utils/toast";

const API_URL = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? '/api' : 'https://book-donation-and-exchange-platform.onrender.com/api');

function authFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

const statusOptions = ["All Statuses", "Approved", "Pending"];
const ratingOptions = ["All Ratings", "5", "4", "3", "2", "1"];

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [ratingFilter, setRatingFilter] = useState("All Ratings");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [confirmAction, setConfirmAction] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await authFetch(`${API_URL}/reviews/admin/all`);
      if (!response.ok) throw new Error("Failed to fetch reviews");
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Could not connect to the database. Make sure your backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleToggleApproval = async (id) => {
    try {
      const response = await authFetch(`${API_URL}/reviews/admin/${id}/approve`, { method: "PATCH" });
      if (!response.ok) throw new Error("Failed to update approval");
      showToast("Review approval status updated.", "success");
      fetchReviews();
    } catch (err) {
      console.error(err);
      showToast("Failed to update review approval.", "error");
    }
  };

  const handleDeleteReview = async (id) => {
    try {
      const response = await authFetch(`${API_URL}/reviews/admin/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete review");
      showToast("Review deleted successfully.", "success");
      setConfirmAction(null);
      fetchReviews();
    } catch (err) {
      console.error(err);
      showToast("Failed to delete review.", "error");
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      review.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      review.comment?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All Statuses" ||
      (statusFilter === "Approved" && review.isApproved) ||
      (statusFilter === "Pending" && !review.isApproved);
    const matchesRating =
      ratingFilter === "All Ratings" || review.rating === parseInt(ratingFilter);
    return matchesSearch && matchesStatus && matchesRating;
  });

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => { setCurrentPage(1); }, [search, statusFilter, ratingFilter]);

  const totalReviews = reviews.length;
  const approvedCount = reviews.filter((r) => r.isApproved).length;
  const pendingCount = reviews.filter((r) => !r.isApproved).length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <AdminLayout title="Admin Console" hideHeaderLabel={true} hideNotifications={true}>
      <section className="rm-page">
        <div className="rm-hero-panel">
          <div className="rm-hero-grid">
            <div>
              <p className="rm-hero-intro-label">Moderation</p>
              <h1 className="rm-hero-headline">
                Review Management <span className="rm-hero-headline-italic">& Approvals</span>
              </h1>
              <p className="rm-hero-description">
                Moderate platform reviews submitted by users. Approve reviews to display them on the homepage, or remove inappropriate content.
              </p>
            </div>
            <div className="rm-hero-stats-grid">
              <div className="rm-hero-stat-box">
                <p className="rm-hero-stat-label">Total Reviews</p>
                <p className="rm-hero-stat-value">{totalReviews}</p>
                <p className="rm-hero-stat-hint">across all users</p>
              </div>
              <div className="rm-hero-stat-box">
                <p className="rm-hero-stat-label">Approved</p>
                <p className="rm-hero-stat-value">{approvedCount}</p>
                <p className="rm-hero-stat-hint">shown on homepage</p>
              </div>
              <div className="rm-hero-stat-box">
                <p className="rm-hero-stat-label">Pending</p>
                <p className="rm-hero-stat-value">{pendingCount}</p>
                <p className="rm-hero-stat-hint">awaiting review</p>
              </div>
              <div className="rm-hero-stat-box">
                <p className="rm-hero-stat-label">Avg Rating</p>
                <p className="rm-hero-stat-value">{avgRating}</p>
                <p className="rm-hero-stat-hint">out of 5.0</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rm-content-wrapper">
          {error && <div className="rm-error-banner">⚠️ {error}</div>}

          <div className="rm-controls-bar">
            <div className="rm-search-box">
              <span className="rm-search-icon"></span>
              <input
                type="text"
                placeholder="Search by reviewer name, email, or comment..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="rm-filters">
              <div className="rm-filter-group">
                <label>Status:</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="rm-filter-group">
                <label>Rating:</label>
                <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
                  {ratingOptions.map((r) => (
                    <option key={r} value={r}>{r === "All Ratings" ? r : `${r} Star${r !== "1" ? "s" : ""}`}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="rm-table-card">
            <div className="rm-table-header-bar">
              <span className="rm-records-badge">{filteredReviews.length} reviews found</span>
            </div>
            <div className="rm-table-responsive">
              {loading ? (
                <div className="rm-loading-state">
                  <span className="rm-loading-spinner">⏳</span>
                  <p>Loading reviews from database...</p>
                </div>
              ) : (
                <table className="rm-data-table">
                  <thead>
                    <tr>
                      <th>Reviewer</th>
                      <th className="rm-text-center">Rating</th>
                      <th>Comment</th>
                      <th className="rm-text-center">Status</th>
                      <th>Date</th>
                      <th className="rm-text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedReviews.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="rm-empty-state">
                          No reviews found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      paginatedReviews.map((review) => {
                        const initials = review.user?.name
                          ? review.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                          : "U";
                        return (
                          <tr key={review.id}>
                            <td>
                              <div className="rm-user-cell">
                                <div className="rm-user-avatar">
                                  {review.user?.profileImage ? (
                                    <img src={review.user.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                                  ) : (
                                    <span>{initials}</span>
                                  )}
                                </div>
                                <div>
                                  <span className="rm-user-name">{review.user?.name || "Unknown"}</span>
                                  <br />
                                  <span className="rm-user-email">{review.user?.email || "—"}</span>
                                </div>
                              </div>
                            </td>
                            <td className="rm-text-center">
                              <span className="rm-stars">
                                {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                              </span>
                            </td>
                            <td>
                              <span className="rm-review-comment" title={review.comment || ""}>
                                {review.comment || "No comment"}
                              </span>
                            </td>
                            <td className="rm-text-center">
                              <span className={`rm-status-badge ${review.isApproved ? "rm-approved" : "rm-pending"}`}>
                                {review.isApproved ? "Approved" : "Pending"}
                              </span>
                            </td>
                            <td className="rm-date-cell">{formatDate(review.createdAt)}</td>
                            <td className="rm-text-right">
                              <div className="rm-action-buttons">
                                <button
                                  className={`rm-action-text-btn ${review.isApproved ? "reject" : "approve"}`}
                                  onClick={() => handleToggleApproval(review.id)}
                                >
                                  {review.isApproved ? "Reject" : "Approve"}
                                </button>
                                <button
                                  className="rm-action-text-btn delete"
                                  onClick={() => setConfirmAction({ type: "delete", review })}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="rm-table-footer">
              <span className="rm-pagination-info">
                Showing{" "}
                <strong>
                  {filteredReviews.length === 0
                    ? "0"
                    : `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, filteredReviews.length)}`}
                </strong>{" "}
                of <strong>{filteredReviews.length}</strong> reviews
              </span>
              <div className="rm-pagination">
                <button
                  className="rm-page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  ◀
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`rm-page-btn ${currentPage === page ? "active" : ""}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                {totalPages > 5 && <span className="rm-page-ellipsis">...</span>}
                {totalPages > 5 && (
                  <button className="rm-page-btn" onClick={() => setCurrentPage(totalPages)}>
                    {totalPages}
                  </button>
                )}
                <button
                  className="rm-page-btn"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  ▶
                </button>
              </div>
            </div>
          </div>
        </div>

        {confirmAction && (
          <div className="rm-confirm-overlay" onClick={() => setConfirmAction(null)}>
            <div className="rm-confirm-box" onClick={(e) => e.stopPropagation()}>
              <h3 className="rm-confirm-title">Delete Review</h3>
              <p className="rm-confirm-message">
                Are you sure you want to delete the review by <strong>{confirmAction.review.user?.name || "Unknown"}</strong>? This action cannot be undone.
              </p>
              <div className="rm-confirm-actions">
                <button className="rm-confirm-btn cancel" onClick={() => setConfirmAction(null)}>
                  Cancel
                </button>
                <button
                  className="rm-confirm-btn danger"
                  onClick={() => handleDeleteReview(confirmAction.review.id)}
                >
                  Delete Review
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}

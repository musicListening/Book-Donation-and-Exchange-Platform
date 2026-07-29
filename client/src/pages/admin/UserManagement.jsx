import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import ConfirmDialog from "../../components/ConfirmDialog";
import "../../styles/UserManagement.css";
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

const roles = ["All Roles", "End User", "Operations Staff", "Platform Admin", "Delivery Personnel", "Community Admin"];
const statuses = ["All Statuses", "Active", "Deactivated"];

const formatRole = (role) => {
  if (!role) return "End User";
  return role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function UserManagement() {
  // ---- data state ----
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---- filters ----
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ---- add modal ----
  const [showAddModal, setShowAddModal] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "END_USER" });
  const [fieldErrors, setFieldErrors] = useState({});

  // ---- edit modal ----
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "END_USER", points: 0 });
  const [editError, setEditError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // ---- confirm dialogs ----
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deactivateConfirm, setDeactivateConfirm] = useState(null);

  // ============ DATA ============
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await authFetch(`${API_URL}/users`);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to fetch users (${response.status})`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Fetch error:", err);
      if (err.message.includes("401") || err.message.includes("403")) {
        setError("Session expired or insufficient permissions. Please log in again.");
      } else {
        setError("Could not load users. Make sure the backend is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // ============ STATUS TOGGLE ============
  const handleToggleStatus = async () => {
    if (!deactivateConfirm) return;
    const { id, isActive } = deactivateConfirm;
    setDeactivateConfirm(null);
    try {
      const response = await authFetch(`${API_URL}/users/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive })
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to update status");
      }
      showToast(`User ${isActive ? "deactivated" : "activated"} successfully.`, "success");
      fetchUsers();
    } catch (err) {
      console.error(err);
      showToast(err.message, "error");
    }
  };

  // ============ DELETE ============
  const handleDeleteUser = async () => {
    if (!deleteConfirm) return;
    const { id } = deleteConfirm;
    setDeleteConfirm(null);
    try {
      const response = await authFetch(`${API_URL}/users/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 409) {
          showToast("Cannot delete user with existing records. Deactivate instead.", "error");
          return;
        }
        throw new Error(errData.error || "Failed to delete user");
      }
      showToast("User deleted successfully.", "success");
      fetchUsers();
    } catch (err) {
      console.error(err);
      showToast(err.message, "error");
    }
  };

  // ============ FILTERS ============
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.id?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "All Roles" || formatRole(user.role) === roleFilter;
    const userStatus = user.isActive ? "Active" : "Deactivated";
    const matchesStatus = statusFilter === "All Statuses" || userStatus === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  useEffect(() => { setCurrentPage(1); }, [search, roleFilter, statusFilter]);

  // ============ EDIT ============
  const openEditModal = (user) => {
    setEditUser(user);
    setEditForm({ name: user.name || "", email: user.email || "", role: user.role || "END_USER", points: user.points ?? 0 });
    setEditError("");
    setShowEditModal(true);
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setEditError("");
    setIsEditing(true);
    try {
      const response = await authFetch(`${API_URL}/users/${editUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to update user");
      }
      setShowEditModal(false);
      setEditUser(null);
      showToast("User updated successfully.", "success");
      fetchUsers();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setIsEditing(false);
    }
  };

  // ============ ADD ============
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateAddUser = () => {
    const errs = {};
    if (!newUser.name.trim() || newUser.name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters.";
    }
    if (!newUser.email.trim()) {
      errs.email = "Email address is required.";
    } else if (!emailPattern.test(newUser.email.trim())) {
      errs.email = "Enter a valid email address (e.g., user@domain.com).";
    }
    if (!newUser.password) {
      errs.password = "Password is required.";
    } else if (newUser.password.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});
    if (!validateAddUser()) return;
    setIsSubmitting(true);
    try {
      const response = await authFetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to create user");
      }
      setShowAddModal(false);
      setNewUser({ name: "", email: "", password: "", role: "END_USER" });
      showToast("User created successfully.", "success");
      fetchUsers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============ STATS ============
  const totalUsers = filteredUsers.length;
  const activeUsers = filteredUsers.filter(u => u.isActive).length;
  const adminCount = filteredUsers.filter(u => u.role === "PLATFORM_ADMIN" || u.role === "COMMUNITY_ADMIN").length;
  const totalPoints = filteredUsers.reduce((sum, u) => sum + (u.points || 0), 0);

  return (
    <AdminLayout title="Admin Console" hideHeaderLabel={true} hideNotifications={true}>
      <section className="user-management">

        {/* ==== HERO ==== */}
        <div className="um-hero-panel">
          <div className="um-hero-grid">
            <div>
              <p className="um-hero-intro-label">Administration</p>
              <h1 className="um-hero-headline">
                User Management <span className="um-hero-headline-italic">& Audits</span>
              </h1>
              <p className="um-hero-description">
                Manage system access, monitor user activity, and perform security audits across the entire platform.
              </p>
              <button className="um-hero-action-btn" onClick={() => { setShowAddModal(true); setFieldErrors({}); setFormError(""); }}>
                <span className="btn-icon">➕</span>
                <span>Add New User</span>
              </button>
            </div>
            <div className="um-hero-stats-grid">
              <div className="um-hero-stat-box">
                <p className="um-hero-stat-label">Total Users</p>
                <p className="um-hero-stat-value">{totalUsers}</p>
                <p className="um-hero-stat-hint">matching current filters</p>
              </div>
              <div className="um-hero-stat-box">
                <p className="um-hero-stat-label">Active Users</p>
                <p className="um-hero-stat-value">{activeUsers}</p>
                <p className="um-hero-stat-hint">currently enabled</p>
              </div>
              <div className="um-hero-stat-box">
                <p className="um-hero-stat-label">Admins</p>
                <p className="um-hero-stat-value">{adminCount}</p>
                <p className="um-hero-stat-hint">platform & community</p>
              </div>
              <div className="um-hero-stat-box">
                <p className="um-hero-stat-label">Total Points</p>
                <p className="um-hero-stat-value">{totalPoints.toLocaleString()}</p>
                <p className="um-hero-stat-hint">across all users</p>
              </div>
            </div>
          </div>
        </div>

        {/* ==== TABLE ==== */}
        <div className="um-content-wrapper">
          {error && <div className="error-banner">⚠️ {error}</div>}

          <div className="controls-bar">
            <div className="search-box">
              <span className="search-icon"></span>
              <input type="text" placeholder="Search users by Name, ID, or Email..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="filters">
              <div className="filter-group">
                <label>Role:</label>
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                  {roles.map((role) => (<option key={role} value={role}>{role}</option>))}
                </select>
              </div>
              <div className="filter-group">
                <label>Status:</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  {statuses.map((status) => (<option key={status} value={status}>{status}</option>))}
                </select>
              </div>
            </div>
          </div>

          <div className="table-card">
            <div className="table-header-bar">
              <span className="records-badge">{filteredUsers.length} users found</span>
            </div>
            <div className="table-responsive">
              {loading ? (
                <div className="loading-state">
                  <span className="loading-spinner">⏳</span>
                  <p>Loading users from database...</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th className="text-center">Level</th>
                      <th className="text-right">Points Balance</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.length === 0 ? (
                      <tr><td colSpan="7" className="empty-state">No users found matching your filters.</td></tr>
                    ) : (
                      paginatedUsers.map((user) => {
                        const userInitials = user.name
                          ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                          : 'U';
                        return (
                          <tr key={user.id}>
                            <td className="font-mono">{user.id.substring(0, 8).toUpperCase()}</td>
                            <td>
                              <div className="user-cell">
                                <div className="user-avatar">
                                  {user.profileImage ? (
                                    <img src={user.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                                  ) : <span>{userInitials}</span>}
                                </div>
                                <div>
                                  <span className="user-name">{user.name}</span>
                                  <br />
                                  <span className="user-email">{user.email}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`role-badge role-${user.role?.toLowerCase() || 'end_user'}`}>
                                {formatRole(user.role)}
                              </span>
                            </td>
                            <td>
                              <span className={`status-badge ${user.isActive ? "status-active" : "status-deactivated"}`}>
                                {user.isActive ? "Active" : "Deactivated"}
                              </span>
                            </td>
                            <td className="text-center">{user.level}</td>
                            <td className="text-right points-col">{user.points?.toLocaleString()}</td>
                            <td className="text-right">
                              <div className="action-buttons">
                                <button className="action-text-btn" onClick={() => openEditModal(user)}>Edit</button>
                                <button
                                  className={`action-text-btn ${user.isActive ? "deactivate" : "activate"}`}
                                  onClick={() => setDeactivateConfirm({ id: user.id, name: user.name, isActive: user.isActive })}
                                >
                                  {user.isActive ? "Deactivate" : "Activate"}
                                </button>
                                <button className="action-text-btn delete" onClick={() => setDeleteConfirm({ id: user.id, name: user.name })}>
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

            <div className="table-footer">
              <span className="pagination-info">
                Showing <strong>{filteredUsers.length === 0 ? "0" : `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, filteredUsers.length)}`}</strong> of <strong>{filteredUsers.length}</strong> users
              </span>
              <div className="pagination">
                <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>◀</button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                  <button key={page} className={`page-btn ${currentPage === page ? "active" : ""}`} onClick={() => setCurrentPage(page)}>{page}</button>
                ))}
                {totalPages > 5 && <span className="page-ellipsis">...</span>}
                {totalPages > 5 && <button className="page-btn" onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>}
                <button className="page-btn" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage((p) => p + 1)}>▶</button>
              </div>
            </div>
          </div>
        </div>

        {/* ==== ADD MODAL ==== */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Add New User</h3>
              {formError && <p className="modal-error">⚠️ {formError}</p>}
              <form onSubmit={handleAddUser} noValidate>
                <div className="modal-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => { setNewUser({...newUser, name: e.target.value}); if (fieldErrors.name) setFieldErrors({...fieldErrors, name: ""}); }}
                    className={fieldErrors.name ? "field-invalid" : ""}
                    placeholder="e.g. John Doe"
                  />
                  {fieldErrors.name && <p className="field-error-msg">{fieldErrors.name}</p>}
                </div>
                <div className="modal-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => { setNewUser({...newUser, email: e.target.value}); if (fieldErrors.email) setFieldErrors({...fieldErrors, email: ""}); }}
                    className={fieldErrors.email ? "field-invalid" : ""}
                    placeholder="e.g. user@domain.com"
                  />
                  {fieldErrors.email && <p className="field-error-msg">{fieldErrors.email}</p>}
                </div>
                <div className="modal-field">
                  <label>Password</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => { setNewUser({...newUser, password: e.target.value}); if (fieldErrors.password) setFieldErrors({...fieldErrors, password: ""}); }}
                    className={fieldErrors.password ? "field-invalid" : ""}
                    placeholder="Min. 6 characters"
                  />
                  {fieldErrors.password && <p className="field-error-msg">{fieldErrors.password}</p>}
                </div>
                <div className="modal-field">
                  <label>Role</label>
                  <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})}>
                    <option value="END_USER">End User</option>
                    <option value="OPERATIONS_STAFF">Operations Staff</option>
                    <option value="PLATFORM_ADMIN">Platform Admin</option>
                    <option value="DELIVERY_PERSONNEL">Delivery Personnel</option>
                    <option value="COMMUNITY_ADMIN">Community Admin</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="modal-btn cancel" onClick={() => { setShowAddModal(false); setFieldErrors({}); }}>Cancel</button>
                  <button type="submit" className="modal-btn submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create User"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==== EDIT MODAL ==== */}
        {showEditModal && editUser && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Edit User</h3>
              {editError && <p className="modal-error">⚠️ {editError}</p>}
              <form onSubmit={handleEditUser}>
                <div className="modal-field">
                  <label>Full Name</label>
                  <input type="text" required value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                </div>
                <div className="modal-field">
                  <label>Email Address</label>
                  <input type="email" required value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} />
                </div>
                <div className="modal-field">
                  <label>Role</label>
                  <select value={editForm.role} onChange={(e) => setEditForm({...editForm, role: e.target.value})}>
                    <option value="END_USER">End User</option>
                    <option value="OPERATIONS_STAFF">Operations Staff</option>
                    <option value="PLATFORM_ADMIN">Platform Admin</option>
                    <option value="DELIVERY_PERSONNEL">Delivery Personnel</option>
                    <option value="COMMUNITY_ADMIN">Community Admin</option>
                  </select>
                </div>
                <div className="modal-field">
                  <label>Points Balance</label>
                  <input type="number" min="0" value={editForm.points} onChange={(e) => setEditForm({...editForm, points: parseInt(e.target.value) || 0})} />
                </div>
                <div className="modal-actions">
                  <button type="button" className="modal-btn cancel" onClick={() => { setShowEditModal(false); setEditUser(null); }}>Cancel</button>
                  <button type="submit" className="modal-btn submit" disabled={isEditing}>{isEditing ? "Saving..." : "Save Changes"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==== DELETE CONFIRM ==== */}
        <ConfirmDialog
          open={!!deleteConfirm}
          title="Delete User"
          message={deleteConfirm ? <>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? Their data will be moved to the deleted users archive.</> : ""}
          confirmLabel="Delete"
          confirmStyle={{ background: '#C02B2B' }}
          onConfirm={handleDeleteUser}
          onCancel={() => setDeleteConfirm(null)}
        />

        {/* ==== DEACTIVATE CONFIRM ==== */}
        <ConfirmDialog
          open={!!deactivateConfirm}
          title={deactivateConfirm?.isActive ? "Deactivate User" : "Activate User"}
          message={deactivateConfirm ? <>Are you sure you want to {deactivateConfirm.isActive ? "deactivate" : "activate"} <strong>{deactivateConfirm.name}</strong>?</> : ""}
          confirmLabel={deactivateConfirm?.isActive ? "Deactivate" : "Activate"}
          confirmStyle={deactivateConfirm?.isActive ? { background: '#E76F51' } : { background: '#1A6B68' }}
          onConfirm={handleToggleStatus}
          onCancel={() => setDeactivateConfirm(null)}
        />

      </section>
    </AdminLayout>
  );
}

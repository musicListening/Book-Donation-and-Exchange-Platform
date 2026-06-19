import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import "../../styles/UserManagement.css";

// Change this to your Render.com URL when deployed
const API_URL = "http://localhost:5000/api";

const roles = ["All Roles", "End User", "Operations Staff", "Platform Admin", "Delivery Personnel", "Community Admin"];
const statuses = ["All Statuses", "Active", "Deactivated"];

// Helper: Convert DB role format to display format
const formatRole = (role) => {
  if (!role) return "End User";
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // === NEW: Modal & Form State ===
  const [showAddModal, setShowAddModal] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "END_USER",
  });

  // === FETCH REAL DATA FROM NEON DATABASE ===
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_URL}/users`);
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Could not connect to the database. Make sure your backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // === TOGGLE USER STATUS (Deactivate/Activate) ===
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const response = await fetch(`${API_URL}/users/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (!response.ok) throw new Error("Failed to update status");
      fetchUsers(); // Refresh the table with real data
    } catch (err) {
      console.error(err);
      alert("Failed to update user status.");
    }
  };

  // === DELETE USER PERMANENTLY ===
  const handleDeleteUser = async (id, name) => {
    // Safety confirmation
    if (!window.confirm(`⚠️ WARNING: Permanently delete ${name}? This will also delete all their donations, orders, and crafts. This cannot be undone!`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");
      fetchUsers(); // Refresh the table with real data
    } catch (err) {
      console.error(err);
      alert("Failed to delete user.");
    }
  };

  // === FILTER LOGIC ===
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.id?.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "All Roles" || formatRole(user.role) === roleFilter;

    const userStatus = user.isActive ? "Active" : "Deactivated";
    const matchesStatus = statusFilter === "All Statuses" || userStatus === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // === PAGINATION ===
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter]);

  const getStatusClass = (isActive) => {
    return isActive ? "status-active" : "status-deactivated";
  };

  // === NEW: Handle Add User Submission ===
  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to create user");
      }

      // Success: Close modal, reset form, and refresh data
      setShowAddModal(false);
      setNewUser({ name: "", email: "", password: "", role: "END_USER" });
      fetchUsers(); 
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Admin Console">
      <section className="user-management">
        <div className="page-header">
          <div>
            <h2 className="page-title">User Management & Account Audits</h2>
            <p className="page-subtitle">Manage system access and perform security audits.</p>
          </div>
          {/* Updated button to open modal */}
          <button className="action-btn" onClick={() => setShowAddModal(true)}>
            <span className="btn-icon">➕</span>
            <span>Add New User</span>
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: "#FEE2E2", color: "#B91C1C", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", border: "1px solid #FECACA" }}>
            ⚠️ {error}
          </div>
        )}

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
          <div className="table-responsive">
            {loading ? (
              <div style={{ padding: "60px", textAlign: "center", color: "#767777" }}>
                <div style={{ fontSize: "24px", marginBottom: "12px" }}>⏳</div>
                <p>Loading users from database...</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th className="text-center">Level</th>
                    <th className="text-right">Points Balance</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length === 0 ? (
                    <tr><td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "#767777" }}>No users found matching your filters.</td></tr>
                  ) : (
                    paginatedUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="font-mono">{user.id.substring(0, 8).toUpperCase()}</td>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar"><span></span></div>
                            <div>
                              <span className="user-name">{user.name}</span>
                              <br />
                              <span style={{ fontSize: "12px", color: "#767777" }}>{user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>{formatRole(user.role)}</td>
                        <td className="text-center">{user.level}</td>
                        <td className="text-right">{user.points?.toLocaleString()}</td>
                        <td>
                          <span className={`status-badge ${getStatusClass(user.isActive)}`}>
                            {user.isActive ? "Active" : "Deactivated"}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="action-buttons">
                            <button className="icon-btn edit" title="Edit Permissions"><span>👤</span></button>
                            <button 
                              className="icon-btn deactivate" 
                              title={user.isActive ? "Deactivate" : "Activate"}
                              onClick={() => handleToggleStatus(user.id, user.isActive)}
                            >
                              <span>{user.isActive ? "🚫" : "✅"}</span>
                            </button>
                            <button 
                              className="icon-btn delete" 
                              title="Delete User"
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              style={{ marginLeft: "8px" }}
                            >
                              <span>🗑️</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
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

        {/* === NEW: Add User Modal === */}
        {showAddModal && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
            justifyContent: "center", alignItems: "center", zIndex: 1000
          }}>
            <div style={{
              backgroundColor: "white", padding: "32px", borderRadius: "12px",
              width: "100%", maxWidth: "450px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
            }}>
              <h3 style={{ marginTop: 0, color: "#1E4D4B", marginBottom: "24px", fontSize: "20px" }}>Add New User</h3>
              
              {formError && (
                <p style={{ color: "#B91C1C", backgroundColor: "#FEE2E2", padding: "10px", borderRadius: "6px", fontSize: "14px", marginBottom: "16px" }}>
                  ⚠️ {formError}
                </p>
              )}

              <form onSubmit={handleAddUser}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "600", color: "#767777" }}>Full Name</label>
                  <input type="text" required value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    style={{ width: "100%", padding: "10px", border: "1px solid #D1D5DB", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }} />
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "600", color: "#767777" }}>Email Address</label>
                  <input type="email" required value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    style={{ width: "100%", padding: "10px", border: "1px solid #D1D5DB", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }} />
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "600", color: "#767777" }}>Password</label>
                  <input type="password" required value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    style={{ width: "100%", padding: "10px", border: "1px solid #D1D5DB", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }} />
                </div>
                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "600", color: "#767777" }}>Role</label>
                  <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    style={{ width: "100%", padding: "10px", border: "1px solid #D1D5DB", borderRadius: "6px", fontSize: "14px", backgroundColor: "white", boxSizing: "border-box" }}>
                    <option value="END_USER">End User</option>
                    <option value="OPERATIONS_STAFF">Operations Staff</option>
                    <option value="PLATFORM_ADMIN">Platform Admin</option>
                    <option value="DELIVERY_PERSONNEL">Delivery Personnel</option>
                    <option value="COMMUNITY_ADMIN">Community Admin</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => setShowAddModal(false)}
                    style={{ padding: "10px 20px", border: "1px solid #D1D5DB", borderRadius: "6px", backgroundColor: "white", cursor: "pointer", fontWeight: "600" }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting}
                    style={{ padding: "10px 20px", border: "none", borderRadius: "6px", backgroundColor: "#1E4D4B", color: "white", cursor: isSubmitting ? "not-allowed" : "pointer", fontWeight: "600", opacity: isSubmitting ? 0.7 : 1 }}>
                    {isSubmitting ? "Creating..." : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </section>
    </AdminLayout>
  );
}
import React, { useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import "../../styles/UserManagement.css";

const mockUsers = [
  { id: "#USR-842", name: "Roshean Perera", role: "Community Admin", level: 42, points: "12,450", status: "Active" },
  { id: "#USR-319", name: "Savinthi Minaya", role: "Staff", level: 28, points: "4,200", status: "Flagged" },
  { id: "#USR-104", name: "Pasindu Madushan", role: "End User", level: 15, points: "850", status: "Deactivated" },
  { id: "#USR-955", name: "Kavindu Deshan", role: "Delivery", level: 54, points: "2,300", status: "Active" },
  { id: "#USR-201", name: "Amasha Fernando", role: "End User", level: 31, points: "1,890", status: "Active" },
  { id: "#USR-467", name: "Dinesh Karunaratne", role: "Staff", level: 19, points: "3,100", status: "Active" },
  { id: "#USR-583", name: "Nipun Silva", role: "End User", level: 8, points: "420", status: "Flagged" },
  { id: "#USR-729", name: "Tharindu Wickrama", role: "Community Admin", level: 67, points: "15,800", status: "Active" },
];

const roles = ["All Roles", "End User", "Staff", "Delivery", "Community Admin"];
const statuses = ["All Statuses", "Active", "Flagged", "Deactivated"];

export default function UserManagement() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.id.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "All Roles" || user.role === roleFilter;
    const matchesStatus = statusFilter === "All Statuses" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case "Active": return "status-active";
      case "Flagged": return "status-flagged";
      case "Deactivated": return "status-deactivated";
      default: return "";
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
          <button className="action-btn">
            <span className="btn-icon">➕</span>
            <span>Add New User</span>
          </button>
        </div>

        <div className="controls-bar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search users by Name, ID, or Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filters">
            <div className="filter-group">
              <label>Role:</label>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                {roles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Status:</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <button className="filter-btn">
              <span>🔽</span>
            </button>
          </div>
        </div>

        <div className="table-card">
          <div className="table-responsive">
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
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="font-mono">{user.id}</td>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          <span>👤</span>
                        </div>
                        <span className="user-name">{user.name}</span>
                      </div>
                    </td>
                    <td>{user.role}</td>
                    <td className="text-center">{user.level}</td>
                    <td className="text-right">{user.points}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="action-buttons">
                        <button className="icon-btn edit" title="Edit Permissions">
                          <span>👤</span>
                        </button>
                        <button className="icon-btn deactivate" title="Deactivate">
                          <span>🚫</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <span className="pagination-info">
              Showing <strong>1-{filteredUsers.length}</strong> of <strong>{mockUsers.length}</strong> users
            </span>
            <div className="pagination">
              <button className="page-btn" disabled>◀</button>
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">3</button>
              <span className="page-ellipsis">...</span>
              <button className="page-btn">50</button>
              <button className="page-btn">▶</button>
            </div>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}

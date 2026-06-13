// pages/staff/BundleManagement.jsx
import React, { useState } from 'react';
import StaffLayout from '../../components/StaffLayout';  // Fixed import path (two levels up)

function BundleManagement() {
  const [bundles] = useState([
    { 
      id: '#BND-9012', 
      name: 'Victorian Literature Collection', 
      includes: 'Includes: Bronte, Dickens, Hardy', 
      items: 12, 
      value: 450.00, 
      status: 'PUBLISHED', 
      date: 'Oct 24, 2023' 
    },
    { 
      id: '#BND-9014', 
      name: 'Advanced Physics Reference Set', 
      includes: 'Includes: Quantum Dynamics, Optics', 
      items: 5, 
      value: 215.50, 
      status: 'DRAFT', 
      date: 'Nov 02, 2023' 
    },
    { 
      id: '#BND-8892', 
      name: 'Art History: Renaissance Era', 
      includes: 'Includes: Florence, Da Vinci, Medici', 
      items: 8, 
      value: 320.00, 
      status: 'SOLD', 
      date: 'Oct 15, 2023' 
    },
    { 
      id: '#BND-9101', 
      name: 'Early Exploration Journals', 
      includes: 'Includes: Cook, Magellan, Polo', 
      items: 18, 
      value: 1150.00, 
      status: 'PUBLISHED', 
      date: 'Nov 10, 2023' 
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  return (
    <StaffLayout>  {/* Wrap with StaffLayout - removed the manual Sidebar and app-container */}
      {/* Header with user info */}
      <div className="content-header">
        <div>
          <h1>Bundle Management</h1>
          <p className="page-subtitle">Curate, monitor, and publish book collections for the marketplace.</p>
        </div>
        <div className="user-info">
          <span className="user-role">A. Vance</span>
          <span className="user-title">ARCHIVIST II</span>
          <div className="user-avatar">AV</div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Active Bundles</h3>
          <div className="stat-value">128</div>
          <div className="stat-trend">▲ 4.2% from last month</div>
        </div>
        <div className="stat-card">
          <h3>Pending Publication</h3>
          <div className="stat-value">14</div>
          <div className="stat-sub">Requires curator approval</div>
        </div>
        <div className="stat-card">
          <h3>Marketplace Revenue</h3>
          <div className="stat-value">$12,450</div>
          <div className="stat-sub">Current fiscal quarter</div>
        </div>
        <div className="stat-card">
          <h3>Average Bundle Value</h3>
          <div className="stat-value">$98.20</div>
          <div className="stat-sub">Based on 45 items avg.</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search bundles or books..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Bundle Inventory Table */}
      <div className="bundle-table-section">
        <div className="table-header">
          <h3>Bundle Inventory</h3>
          <div className="table-controls">
            <button className="filter-btn">All Statuses ▼</button>
            <button className="filter-btn">Sort by: Date Created ▼</button>
          </div>
        </div>

        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>BUNDLE ID</th>
                <th>BUNDLE NAME</th>
                <th>ITEMS</th>
                <th>VALUE ($)</th>
                <th>STATUS</th>
                <th>DATE CREATED</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {bundles.map((bundle) => (
                <tr key={bundle.id}>
                  <td className="bundle-id">{bundle.id}</td>
                  <td>
                    <div className="bundle-name">{bundle.name}</div>
                    <div className="bundle-includes">{bundle.includes}</div>
                  </td>
                  <td>{bundle.items}</td>
                  <td>${bundle.value.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${bundle.status.toLowerCase()}`}>
                      {bundle.status}
                    </span>
                  </td>
                  <td>{bundle.date}</td>
                  <td>
                    <button className="action-btn">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>Showing 1-4 of 128 bundles</span>
          <button className="new-donation-btn">+ New Donation</button>
        </div>
      </div>
    </StaffLayout>
  );
}

export default BundleManagement;
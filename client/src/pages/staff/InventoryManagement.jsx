// pages/staff/InventoryManagement.jsx
import React from 'react';
import StaffLayout from '../../components/StaffLayout';

function InventoryManagement() {
  const inventory = [
    { book: 'Principles of Modern UI', genre: 'Technology', condition: 'Pristine', quantity: 12 },
    { book: 'The Alchemist (Collectors Ed)', genre: 'Fiction', condition: 'Good', quantity: 5 },
    { book: 'Victorian Poetry Anthology', genre: 'Literature', condition: 'Very Good', quantity: 23 },
    { book: 'Quantum Physics Explained', genre: 'Science', condition: 'Damaged', quantity: 3 },
  ];

  return (
    <StaffLayout>
      <div className="content-header">
        <h1>Inventory Management</h1>
        <div className="user-info">
          <span className="user-role">INVENTORY LEAD</span>
        </div>
      </div>

      <div className="cards-grid">
        <div className="stat-card">
          <h3>Total Books</h3>
          <div className="stat-value">12,847</div>
          <div className="stat-trend">▲ +342 this week</div>
        </div>
        <div className="stat-card">
          <h3>Unique Titles</h3>
          <div className="stat-value">3,921</div>
        </div>
        <div className="stat-card">
          <h3>Low Stock Alert</h3>
          <div className="stat-value">8</div>
          <div className="stat-trend negative">Critical items</div>
        </div>
      </div>

      <div className="card-panel">
        <div className="search-bar" style={{ marginBottom: '20px' }}>
          <input type="text" placeholder="Search by title, ISBN, or author..." />
          <button className="btn-primary">Search</button>
          <button className="btn-secondary">Filter</button>
        </div>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Genre</th>
                <th>Condition</th>
                <th>Quantity</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item, idx) => (
                <tr key={idx}>
                  <td><strong>{item.book}</strong></td>
                  <td>{item.genre}</td>
                  <td>
                    <span className={`status-badge ${item.condition === 'Pristine' ? 'published' : item.condition === 'Damaged' ? 'delayed' : 'pending'}`}>
                      {item.condition}
                    </span>
                  </td>
                  <td>{item.quantity}</td>
                  <td>{item.condition === 'Pristine' ? 'Aisle 4' : 'Warehouse B'}</td>
                  <td><button className="btn-small">Details</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </StaffLayout>
  );
}

export default InventoryManagement;
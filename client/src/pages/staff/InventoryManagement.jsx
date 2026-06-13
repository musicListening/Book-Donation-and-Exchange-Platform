// pages/staff/InventoryManagement.jsx
import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/StaffLayout';

function InventoryManagement() {
  const [currentUser, setCurrentUser] = useState({ name: '', role: '' });

  useEffect(() => {
    // Get logged-in user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser({
        name: user.name || user.email || 'Staff User',
        role: user.role || 'INVENTORY STAFF'
      });
    }
  }, []);

  const inventory = [
    { book: 'Madol Doowa by Martin Wickramasinghe', genre: 'Sinhala Literature', condition: 'Pristine', quantity: 25, location: 'Colombo Warehouse' },
    { book: 'Gamperaliya by Martin Wickramasinghe', genre: 'Sinhala Novel', condition: 'Very Good', quantity: 18, location: 'Kandy Store' },
    { book: 'The History of Ceylon', genre: 'Sri Lankan History', condition: 'Good', quantity: 12, location: 'Colombo Warehouse' },
    { book: 'Buddhist Philosophy Guide', genre: 'Religion', condition: 'Pristine', quantity: 45, location: 'Kandy Store' },
    { book: 'Sri Lankan Cookbook Collection', genre: 'Cuisine', condition: 'Very Good', quantity: 8, location: 'Galle Branch' },
    { book: 'Ceylon Tea Heritage', genre: 'History', condition: 'Good', quantity: 15, location: 'Nuwara Eliya Store' },
    { book: 'Sinharaja Rainforest Guide', genre: 'Nature', condition: 'Pristine', quantity: 22, location: 'Colombo Warehouse' },
    { book: 'Ancient Cities of Anuradhapura', genre: 'Archaeology', condition: 'Very Good', quantity: 30, location: 'Kandy Store' },
  ];

  // Get user initials for avatar
  const getUserInitials = () => {
    if (currentUser.name) {
      const names = currentUser.name.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return currentUser.name[0].toUpperCase();
    }
    return 'IM';
  };

  return (
    <StaffLayout>
      <div className="content-header">
        <h1>Inventory Management</h1>
        <div className="user-info">
          <span className="user-role">{currentUser.name}</span>
          <span className="user-title">{currentUser.role}</span>
          <div className="user-avatar">{getUserInitials()}</div>
        </div>
      </div>

      <div className="cards-grid">
        <div className="stat-card">
          <h3>Total Books</h3>
          <div className="stat-value">15,847</div>
          <div className="stat-trend">▲ +528 this week</div>
        </div>
        <div className="stat-card">
          <h3>Unique Titles</h3>
          <div className="stat-value">5,234</div>
        </div>
        <div className="stat-card">
          <h3>Low Stock Alert</h3>
          <div className="stat-value">14</div>
          <div className="stat-trend negative">Critical items</div>
        </div>
      </div>

      <div className="card-panel">
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
                    <span className={`status-badge ${item.condition === 'Pristine' ? 'published' : item.condition === 'Damaged' ? 'delayed' : 'in-review'}`}>
                      {item.condition}
                    </span>
                  </td>
                  <td>{item.quantity}</td>
                  <td>{item.location}</td>
                  <td><button className="btn-small">Details</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>Showing 1-8 of 5,234 titles</span>
          <button className="new-donation-btn">+ Add New Book</button>
        </div>
      </div>
    </StaffLayout>
  );
}

export default InventoryManagement;
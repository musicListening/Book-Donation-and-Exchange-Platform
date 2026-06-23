// pages/staff/StaffDashboard.jsx
import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/StaffLayout';

function StaffDashboard() {
  const [currentUser, setCurrentUser] = useState({ name: '', role: '' });

  useEffect(() => {
    // Get logged-in user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser({
        name: user.name || user.email || 'Staff User',
        role: user.role || 'OPERATIONS STAFF'
      });
    }
  }, []);

  const urgentTasks = [
    { id: '#SL-88210', donor: 'Malini Perera', location: 'Colombo', volume: '45 Books', date: 'Oct 12, 2023 | 14:30', status: 'In Review' },
    { id: '#SL-88195', donor: 'Dr. Anura Bandaranaike', location: 'Kandy', volume: '112 Books', date: 'Oct 12, 2023 | 11:15', status: 'In Review' },
    { id: '#SL-88188', donor: 'Nimal Weerasinghe', location: 'Galle', volume: '28 Books', date: 'Oct 12, 2023 | 09:45', status: 'In Review' },
    { id: '#SL-88182', donor: 'University of Peradeniya', location: 'Kandy', volume: '250 Books', date: 'Oct 11, 2023 | 15:20', status: 'Pending' },
    { id: '#SL-88178', donor: 'Ramesh Kumar', location: 'Jaffna', volume: '62 Books', date: 'Oct 11, 2023 | 10:30', status: 'In Review' },
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
    return 'SD';
  };

  // Get first name for welcome message
  const getFirstName = () => {
    if (currentUser.name) {
      const names = currentUser.name.split(' ');
      return names[0];
    }
    return 'Staff';
  };

  return (
    <StaffLayout title="Operations Overview - Sri Lanka">
      <p className="welcome-text">Welcome back, {getFirstName()}! Here is what needs your attention today across Sri Lanka.</p>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>PENDING VERIFICATIONS</h3>
          <div className="stat-value">187</div>
          <div className="stat-trend">▲ +15% from yesterday</div>
          <div className="stat-sub">Books awaiting condition assessment</div>
        </div>

        <div className="stat-card">
          <h3>TODAY'S PICKUPS</h3>
          <div className="stat-value">52</div>
          <div className="stat-trend">Target: 60</div>
          <div className="stat-sub">Scheduled • 87% of capacity utilized</div>
        </div>

        <div className="stat-card">
          <h3>ACTIVE ORDERS</h3>
          <div className="stat-value">3,245</div>
          <div className="stat-sub">Books • 24 charity fulfillment in progress</div>
        </div>

        <div className="stat-card">
          <h3>ACTIVE DONORS</h3>
          <div className="stat-value">1,842</div>
          <div className="stat-trend">▲ +8% this month</div>
          <div className="stat-sub">Across 12 districts</div>
        </div>
      </div>

      <div className="task-section">
        <h3>Urgent Task Queue</h3>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>DONATION ID</th>
                <th>DONOR NAME</th>
                <th>LOCATION</th>
                <th>VOLUME</th>
                <th>SUBMISSION DATE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {urgentTasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.id}</td>
                  <td>{task.donor}</td>
                  <td>{task.location}</td>
                  <td>{task.volume}</td>
                  <td>{task.date}</td>
                  <td><span className="status-badge in-review">{task.status}</span></td>
                  <td><button className="btn-process">Process</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          Showing 5 urgent tasks across Sri Lanka
        </div>
      </div>

      <div className="inventory-flow">
        <h3>Inventory Flow (Weekly) - National Overview</h3>
        <div className="flow-chart">
          <div className="flow-bar">
            <span className="flow-label">Donations Received</span>
            <div className="flow-progress donations" style={{ width: '72%' }}></div>
            <span className="flow-percent">↑ 28% from last week</span>
          </div>
          <div className="flow-bar">
            <span className="flow-label">Distributions</span>
            <div className="flow-progress distributions" style={{ width: '56%' }}></div>
            <span className="flow-percent">→ 2,150 books delivered</span>
          </div>
          <div className="flow-bar">
            <span className="flow-label">In Processing</span>
            <div className="flow-progress" style={{ width: '34%', background: '#E9C46A' }}></div>
            <span className="flow-percent">→ 1,280 books in queue</span>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}

export default StaffDashboard;
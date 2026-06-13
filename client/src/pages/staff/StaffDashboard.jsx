// pages/staff/StaffDashboard.jsx
import React from 'react';
import StaffLayout from '../../components/StaffLayout';

function StaffDashboard() {
  const urgentTasks = [
    { id: '#RB-88210', donor: 'Eleanor Shellstrop', volume: '45 Books', date: 'Oct 12, 2023 | 14:30', status: 'In Review' },
    { id: '#RB-88195', donor: 'Michael Realman', volume: '112 Books', date: 'Oct 12, 2023 | 11:15', status: 'In Review' },
    { id: '#RB-88188', donor: 'Tahani Al-Jamil', volume: '12 Books', date: 'Oct 11, 2023 | 09:45', status: 'In Review' },
  ];

  return (
    <StaffLayout>
      <div className="content-header">
        <h1>Operations Overview</h1>
        <div className="user-info">
          <span className="user-role">Alex</span>
          <div className="user-avatar">A</div>
        </div>
      </div>

      <p className="welcome-text">Welcome back, Alex. Here is what needs your attention today.</p>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>PENDING VERIFICATIONS</h3>
          <div className="stat-value">124</div>
          <div className="stat-trend">▲ +12%</div>
          <div className="stat-sub">Books awaiting condition assessment</div>
        </div>

        <div className="stat-card">
          <h3>TODAY'S PICKUPS</h3>
          <div className="stat-value">38</div>
          <div className="stat-trend">Target: 45</div>
          <div className="stat-sub">Scheduled • 84% of capacity utilized</div>
        </div>

        <div className="stat-card">
          <h3>ACTIVE ORDERS</h3>
          <div className="stat-value">2,410</div>
          <div className="stat-sub">Books • 18 charity fulfillment in progress</div>
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
          Showing 3 urgent tasks
        </div>
      </div>

      <div className="inventory-flow">
        <h3>Inventory Flow (Weekly)</h3>
        <div className="flow-chart">
          <div className="flow-bar">
            <span className="flow-label">Donations</span>
            <div className="flow-progress donations" style={{ width: '65%' }}></div>
            <span className="flow-percent">↑ 24%</span>
          </div>
          <div className="flow-bar">
            <span className="flow-label">Distributions</span>
            <div className="flow-progress distributions" style={{ width: '48%' }}></div>
            <span className="flow-percent">→ 1,280 books</span>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}

export default StaffDashboard;
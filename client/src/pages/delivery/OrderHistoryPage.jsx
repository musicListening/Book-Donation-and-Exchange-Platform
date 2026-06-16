import '../../styles/Delivery.css';

const OrderHistoryPage = () => {
  return (
    <>
      <div className="page-header">
        <h1 style={{ fontSize: '40px' }}>Order History</h1>
        <p>Review your completed missions and performance metrics.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="bg-icon material-symbols-outlined">inventory_2</span>
          <div className="stat-label">Total Deliveries</div>
          <div className="stat-value">1,284</div>
          <div className="stat-trend">
            <span className="material-symbols-outlined">trending_up</span>
            +12% from last month
          </div>
        </div>
        <div className="stat-card">
          <span className="bg-icon material-symbols-outlined">payments</span>
          <div className="stat-label">Total Earnings</div>
          <div className="stat-value">$14,520.50</div>
          <div className="stat-trend">
            <span className="material-symbols-outlined">auto_graph</span>
            Top 5% of Drivers
          </div>
        </div>
        <div className="stat-card">
          <span className="bg-icon material-symbols-outlined">star</span>
          <div className="stat-label">Average Rating</div>
          <div className="flex items-baseline gap-2">
            <div className="stat-value" style={{ fontSize: '32px', display: 'inline' }}>4.92</div>
            <span style={{ color: 'var(--on-tertiary-container)', fontWeight: 500 }}>/ 5.0</span>
          </div>
          <div className="rating-stars">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <label>Search Order ID or Address</label>
          <div className="input-icon">
            <span className="material-symbols-outlined">search</span>
            <input type="text" placeholder="e.g. #ORD-9921" />
          </div>
        </div>
        <div className="filter-group w-56">
          <label>Status</label>
          <select>
            <option>All Statuses</option>
            <option>Completed</option>
            <option>Cancelled</option>
            <option>Returned</option>
          </select>
        </div>
        <div className="filter-group w-56">
          <label>Time Period</label>
          <select>
            <option>Last 30 Days</option>
            <option>This Week</option>
            <option>Last Quarter</option>
            <option>Custom Date</option>
          </select>
        </div>
        <button className="btn-apply">Apply Filters</button>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <div className="table-scroll no-scrollbar">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Delivery Address</th>
                <th>Earnings</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: '#ORD-10293', date: 'Oct 24, 2023 • 14:20', address: '482 Forest Edge Dr, Willow Creek, WA', earnings: '$24.50', status: 'Completed' },
                { id: '#ORD-10288', date: 'Oct 24, 2023 • 11:45', address: '99 Spruce Ave, Apartment 4B, Seattle...', earnings: '$18.20', status: 'Completed' },
                { id: '#ORD-10255', date: 'Oct 23, 2023 • 09:10', address: '1204 Pineview Dr, Redmond, WA', earnings: '$0.00', status: 'Cancelled' },
                { id: '#ORD-10242', date: 'Oct 22, 2023 • 18:30', address: '87 Cedar Ln, Bellevue, WA', earnings: '$32.15', status: 'Completed' },
                { id: '#ORD-10239', date: 'Oct 22, 2023 • 15:05', address: '233 Hemlock Way, Seattle, WA', earnings: '$15.00', status: 'Completed' },
              ].map((order, idx) => (
                <tr key={idx}>
                  <td><span className="order-id">{order.id}</span></td>
                  <td>{order.date}</td>
                  <td>{order.address}</td>
                  <td><span className="earnings">{order.earnings}</span></td>
                  <td>
                    <span className={`status-badge ${order.status === 'Completed' ? 'completed' : 'cancelled'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td><button className="view-link">View Details</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <span className="info">Showing 1 to 5 of 1,284 orders</span>
          <div className="pages">
            <button disabled><span className="material-symbols-outlined">chevron_left</span></button>
            <button className="active">1</button>
            <button>2</button>
            <button>3</button>
            <button><span className="material-symbols-outlined">chevron_right</span></button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderHistoryPage;
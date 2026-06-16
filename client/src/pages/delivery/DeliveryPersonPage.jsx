import '../../styles/Delivery.css';

const DeliveryPersonPage = () => {
  return (
    <>
      <div className="page-header">
        <h1>Delivery Details</h1>
        <p>Welcome back! Manage your active route and upcoming tasks below.</p>
      </div>

      <div className="delivery-grid">
        {/* Current Task – same as before */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 600, color: 'var(--primary)' }}>Current Task</h2>
            <button className="flex items-center gap-1" style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>help_outline</span>
              Need help?
            </button>
          </div>

          <div className="white-card">
            {/* Map */}
            <div className="map-container">
              <img
                alt="Route Map"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwzBuqdVMr68u9rhvoCMRzxdDadcGKE0jdpZz8Hew1MBbrWAvHKW59g6WN9m-Snb51ogd7KOMXELb6wFYOCYJ138dcHfp5cXdRvdxeaxqLf9UvzKDnNoExEnsdrcdp3cEeA1TagpnS74GHTCpejgI28s3f4R1PNhSYhO63IYOvCl2qgfQOKydfjtGav7Lz2sBkkA0E2Jn2mUDDAz0FP9-FF9EvU-KHfngnFBjW5uexISRTIa-gSYP7wb8fZPFyO6XjoN22IT0Ktrk"
              />
              <div className="map-overlay"></div>
              <div className="map-controls">
                <button><span className="material-symbols-outlined">my_location</span></button>
                <button><span className="material-symbols-outlined">add</span></button>
                <button><span className="material-symbols-outlined">remove</span></button>
              </div>
              <div className="map-bottom-info">
                <div className="info-box">
                  <div className="info-left">
                    <div className="icon-circle">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>navigation</span>
                    </div>
                    <div className="info-text">
                      <p>Next turn in 400m</p>
                      <p>Turn right onto Bloomsbury Way</p>
                    </div>
                  </div>
                  <div className="info-right">
                    <div className="time">8 min</div>
                    <div className="dist">1.2 km left</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="order-details">
              <div className="order-header">
                <div>
                  <div className="order-id">Order #SS-8291</div>
                  <h3>Gourmet Book Set & Stationery</h3>
                </div>
                <div className="badge">Priority Express</div>
              </div>

              <div className="order-address-grid">
                <div className="space-y-6">
                  <div className="address-item">
                    <div className="icon-box" style={{ color: 'var(--on-surface-variant)' }}>
                      <span className="material-symbols-outlined">storefront</span>
                    </div>
                    <div>
                      <div className="address-label">Pick-up From</div>
                      <div className="address-name">ShareShelf Flagship Store</div>
                      <div className="address-detail">24 Literary Grove, Bloomsbury</div>
                    </div>
                  </div>
                  <div className="address-item">
                    <div className="icon-box" style={{ color: 'var(--primary)' }}>
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                    </div>
                    <div>
                      <div className="address-label">Delivery To</div>
                      <div className="address-name">Eleanor Rigby</div>
                      <div className="address-detail">82 Abbey Road, Apt 4B</div>
                    </div>
                  </div>
                </div>
                <div className="delivery-notes">
                  <div className="notes-label">Delivery Notes</div>
                  <p>"Please leave at the concierge desk. Fragile items inside. Call upon arrival."</p>
                </div>
              </div>

              <div className="order-actions">
                <button className="btn-primary">Confirm Delivery</button>
                <button className="btn-secondary">
                  <span className="material-symbols-outlined">call</span>
                  Contact Customer
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Queue */}
        <section className="queue-section">
          <div className="queue-header">
            <h2>Queue</h2>
            <span className="badge-count">3 Pending</span>
          </div>

          <div className="queue-item">
            <div className="item-header">
              <div>
                <div className="order-id-sm">Order #SS-8294</div>
                <h4>Vintage Classics Bundle</h4>
              </div>
              <span className="time">14:30</span>
            </div>
            <div className="item-meta">
              <span className="meta-chip"><span className="material-symbols-outlined">near_me</span> 2.4 km</span>
              <span className="meta-chip"><span className="material-symbols-outlined">timer</span> 15 min</span>
            </div>
            <div className="item-footer">
              <span className="item-info"><span className="material-symbols-outlined">package</span> 3 Items • 1.2 kg</span>
              <span className="arrow-icon material-symbols-outlined">arrow_forward_ios</span>
            </div>
          </div>

          <div className="queue-item opacity-90">
            <div className="item-header">
              <div>
                <div className="order-id-sm">Order #SS-8299</div>
                <h4>Eco-Wrap Gift Set</h4>
              </div>
              <span className="time">15:15</span>
            </div>
            <div className="item-meta">
              <span className="meta-chip"><span className="material-symbols-outlined">near_me</span> 4.1 km</span>
              <span className="meta-chip"><span className="material-symbols-outlined">timer</span> 22 min</span>
            </div>
            <div className="item-footer">
              <span className="item-info"><span className="material-symbols-outlined">package</span> 1 Item • 0.5 kg</span>
              <span className="arrow-icon material-symbols-outlined">arrow_forward_ios</span>
            </div>
          </div>

          <div className="queue-item opacity-90">
            <div className="item-header">
              <div>
                <div className="order-id-sm">Order #SS-8302</div>
                <h4>Coffee Table Collection</h4>
              </div>
              <span className="time">16:00</span>
            </div>
            <div className="item-meta">
              <span className="meta-chip"><span className="material-symbols-outlined">near_me</span> 6.8 km</span>
              <span className="meta-chip"><span className="material-symbols-outlined">timer</span> 35 min</span>
            </div>
            <div className="item-footer">
              <span className="item-info"><span className="material-symbols-outlined">package</span> 5 Items • 4.8 kg</span>
              <span className="arrow-icon material-symbols-outlined">arrow_forward_ios</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default DeliveryPersonPage;
// client/src/pages/HomePage.jsx
import React from "react";
import "../styles/HomePage.css"; // Import the CSS file

export default function HomePage() {
  return (
    <div className="homepage">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <i className="fas fa-book-open"></i>
            <span>LeafSwap</span>
          </div>
          <div className="nav-links">
            <a href="#home">Home</a>
            <a href="#categories">Categories</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#exchange">Exchange</a>
            <button className="login-btn">
              <i className="fas fa-user-circle"></i> Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="hero-badge">
                <i className="fas fa-gem"></i> Points-Based Platform
              </div>
              <h1>
                Donate Books, <br />
                <span className="hero-highlight">Earn Points</span>, Exchange
              </h1>
              <p className="hero-desc">
                Turn your old books into points and unlock a world of reading.
                Every donation gives you points to exchange for your next favorite book.
              </p>
              <div className="btn-group">
                <a href="#donate" className="btn-primary">
                  <i className="fas fa-hand-holding-heart"></i> Donate Books
                </a>
                <a href="#exchange" className="btn-outline">
                  <i className="fas fa-exchange-alt"></i> Start Earning
                </a>
              </div>
            </div>
            <div className="hero-stats">
              <div className="stat-card">
                <i className="fas fa-chart-line"></i>
                <div className="stat-number">2,450+</div>
                <div className="stat-label">Books Exchanged</div>
              </div>
              <div className="stat-card">
                <i className="fas fa-users"></i>
                <div className="stat-number">1,280+</div>
                <div className="stat-label">Active Members</div>
              </div>
              <div className="stat-card">
                <i className="fas fa-coins"></i>
                <div className="stat-number">45K+</div>
                <div className="stat-label">Points Earned</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories" id="categories">
        <div className="container">
          <div className="section-header">
            <h2>Browse by Category</h2>
            <p>Find your next read from our diverse collection</p>
          </div>
          <div className="categories-grid">
            <div className="category-card">
              <i className="fas fa-flask"></i>
              <h3>Science & Tech</h3>
              <p>245 books available</p>
              <span className="points-badge">Starting 50 pts</span>
            </div>
            <div className="category-card">
              <i className="fas fa-chalkboard-user"></i>
              <h3>Academic</h3>
              <p>189 books available</p>
              <span className="points-badge">Starting 30 pts</span>
            </div>
            <div className="category-card">
              <i className="fas fa-feather"></i>
              <h3>Literature</h3>
              <p>432 books available</p>
              <span className="points-badge">Starting 40 pts</span>
            </div>
            <div className="category-card">
              <i className="fas fa-brain"></i>
              <h3>Self-Help</h3>
              <p>167 books available</p>
              <span className="points-badge">Starting 35 pts</span>
            </div>
            <div className="category-card">
              <i className="fas fa-child"></i>
              <h3>Children's</h3>
              <p>298 books available</p>
              <span className="points-badge">Starting 25 pts</span>
            </div>
            <div className="category-card">
              <i className="fas fa-chart-simple"></i>
              <h3>Business & Econ</h3>
              <p>134 books available</p>
              <span className="points-badge">Starting 60 pts</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Earn, exchange, and enjoy — in 3 simple steps</p>
          </div>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-icon">
                <i className="fas fa-box-open"></i>
              </div>
              <h3>Donate Books</h3>
              <p>List your books for donation. We verify quality and condition.</p>
              <div className="step-points">+10 to 200 points per book</div>
            </div>
            <div className="step-arrow">
              <i className="fas fa-arrow-right"></i>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-icon">
                <i className="fas fa-coins"></i>
              </div>
              <h3>Earn Points</h3>
              <p>Get points based on book rarity, condition, and demand.</p>
              <div className="step-points">Build your balance</div>
            </div>
            <div className="step-arrow">
              <i className="fas fa-arrow-right"></i>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-icon">
                <i className="fas fa-book"></i>
              </div>
              <h3>Exchange Books</h3>
              <p>Redeem points to get any book you want from the platform.</p>
              <div className="step-points">Start reading today!</div>
            </div>
          </div>

          {/* Bonus points info */}
          <div className="points-info">
            <div className="info-card">
              <i className="fas fa-star"></i>
              <div>
                <strong>Bonus Points:</strong> First donation gets 50 bonus points!
              </div>
            </div>
            <div className="info-card">
              <i className="fas fa-truck"></i>
              <div>
                <strong>Free Delivery:</strong> On exchanges above 200 points
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>Ready to transform your bookshelf?</h2>
            <p>Join thousands of readers who are donating and exchanging books every day.</p>
            <button className="btn-primary-large">
              <i className="fas fa-user-plus"></i> Create Free Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <i className="fas fa-book-open"></i>
              <span>LeafSwap</span>
              <p>Donate • Earn • Exchange</p>
            </div>
            <div className="footer-links">
              <div className="link-group">
                <h4>Platform</h4>
                <a href="#">How it Works</a>
                <a href="#">Categories</a>
                <a href="#">Points System</a>
              </div>
              <div className="link-group">
                <h4>Support</h4>
                <a href="#">FAQs</a>
                <a href="#">Shipping Info</a>
                <a href="#">Contact Us</a>
              </div>
              <div className="link-group">
                <h4>Legal</h4>
                <a href="#">Terms of Service</a>
                <a href="#">Privacy Policy</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 LeafSwap — Turn books into opportunities.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
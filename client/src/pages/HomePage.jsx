// client/src/pages/HomePage.jsx

import React, { useState } from "react";
import "../styles/HomePage.css";

// Import Local Images
import bookStackImage from "../assets/book-stack.png";
import bundlesImage from "../assets/bundles-icon.png";
import craftsImage from "../assets/crafts-icon.png";
import progressImage from "../assets/progress-icon.png";
import bookIcon from "../assets/book-icon.png";
import rewardsIcon from "../assets/rewards-icon.png";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="homepage">
      
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-container">

          <div className="logo">
            <span className="logo-icon">📚</span>
            <span className="logo-text">PROJENIUS</span>
          </div>

          <div className="nav-menu">
            <a href="#home" className="nav-link active">
              HOME
            </a>

            <a href="#marketplace" className="nav-link">
              MARKETPLACE
            </a>

            <a href="#donate" className="nav-link">
              DONATE
            </a>

            <a href="#about" className="nav-link">
              ABOUT US
            </a>
          </div>

          <div className="nav-search">
            <input
              type="text"
              placeholder="SEARCH"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />

            <button className="search-btn">
              <span className="search-icon">🔍</span>
            </button>
          </div>

        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-container">

          <div className="hero-split">

            {/* Left Side Image */}
            <div className="hero-image">
              <img
                src={bookStackImage}
                alt="Stack of books"
                className="book-stack-img"
              />
            </div>

            {/* Right Side Content */}
            <div className="hero-content">

              <h1 className="hero-title">
                Give a Book, Earn <span className="highlight">Rewards!</span>
              </h1>

              <p className="hero-description">
                Join our sustainable ecosystem to reduce book waste and exchange
                points for curated bundles or handmade crafts.
              </p>

              {/* Stats */}
              <div className="hero-stats">

                <div className="stat-item">
                  <img
                    src={bundlesImage}
                    alt="Bundles"
                    className="stat-image"
                  />
                  <span className="stat-label">BUNDLES</span>
                </div>

                <div className="stat-item">
                  <img
                    src={bookIcon}
                    alt="Book"
                    className="stat-image"
                  />
                  <span className="stat-label">BOOK</span>
                </div>

                <div className="stat-item">
                  <img
                    src={craftsImage}
                    alt="Crafts"
                    className="stat-image"
                  />
                  <span className="stat-label">
                    HANDMADE
                    <br />
                    CRAFTS
                  </span>
                </div>

                <div className="stat-item">
                  <img
                    src={rewardsIcon}
                    alt="Rewards"
                    className="stat-image"
                  />
                  <span className="stat-label">
                    REWARDS
                    <br />
                    POINTS
                  </span>
                </div>

              </div>

              <button className="donate-now-btn">
                DONATE NOW →
              </button>

            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-container">

          <div className="feature-card">
            <div className="feature-number">01</div>

            <div className="feature-icon">
              <img
                src={bundlesImage}
                alt="Curated Bundles"
                className="feature-img"
              />
            </div>

            <h3 className="feature-title">
              Curated Bundles
            </h3>

            <p className="feature-description">
              Genre-specific collections curated by our staff from community
              donations.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-number">02</div>

            <div className="feature-icon">
              <img
                src={craftsImage}
                alt="Handmade Crafts"
                className="feature-img"
              />
            </div>

            <h3 className="feature-title">
              Handmade Crafts
            </h3>

            <p className="feature-description">
              Direct peer-to-peer sales of unique paper-based artistic creations.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-number">03</div>

            <div className="feature-icon">
              <img
                src={progressImage}
                alt="Your Progress"
                className="feature-img"
              />
            </div>

            <h3 className="feature-title">
              Your Progress
            </h3>

            <p className="feature-description">
              View your total points, current user level, and contributions to
              literacy.
            </p>
          </div>

        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">

          <h2 className="section-title">
            How It Works
          </h2>

          <div className="steps-container">

            <div className="step-card">
              <div className="step-circle">1</div>
              <div className="step-icon">📚</div>

              <h3>Donate Books</h3>

              <p>
                Share your pre-loved books with our community.
              </p>

              <span className="step-points">
                Earn 10-200 points
              </span>
            </div>

            <div className="step-arrow">→</div>

            <div className="step-card">
              <div className="step-circle">2</div>
              <div className="step-icon">⭐</div>

              <h3>Collect Points</h3>

              <p>
                Accumulate points based on book value & demand.
              </p>

              <span className="step-points">
                Build your balance
              </span>
            </div>

            <div className="step-arrow">→</div>

            <div className="step-card">
              <div className="step-circle">3</div>
              <div className="step-icon">🎁</div>

              <h3>Redeem Rewards</h3>

              <p>
                Exchange points for bundles or handmade crafts.
              </p>

              <span className="step-points">
                Start redeeming!
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories">
        <div className="container">

          <h2 className="section-title">
            Browse Categories
          </h2>

          <div className="categories-grid">

            <div className="category-card">
              <div className="category-icon">🔬</div>
              <h3>Science & Tech</h3>
              <p>245 books</p>
            </div>

            <div className="category-card">
              <div className="category-icon">📚</div>
              <h3>Academic</h3>
              <p>189 books</p>
            </div>

            <div className="category-card">
              <div className="category-icon">✍️</div>
              <h3>Literature</h3>
              <p>432 books</p>
            </div>

            <div className="category-card">
              <div className="category-icon">💡</div>
              <h3>Self-Help</h3>
              <p>167 books</p>
            </div>

            <div className="category-card">
              <div className="category-icon">🧸</div>
              <h3>Children's</h3>
              <p>298 books</p>
            </div>

            <div className="category-card">
              <div className="category-icon">📈</div>
              <h3>Business</h3>
              <p>134 books</p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="cta-container">

          <div className="cta-content">

            <h2>
              Start Your Journey Today
            </h2>

            <p>
              Join thousands of readers making a difference, one book at a time.
            </p>

            <button className="cta-button">
              Create Free Account →
            </button>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">

        <div className="footer-container">

          <div className="footer-logo">
            <span className="logo-icon">📚</span>
            <span>PROJENIUS</span>

            <p>
              Sustainable reading for everyone
            </p>
          </div>

          <div className="footer-links">

            <div className="footer-column">
              <h4>Platform</h4>

              <a href="#">Marketplace</a>
              <a href="#">Donate</a>
              <a href="#">How it Works</a>
            </div>

            <div className="footer-column">
              <h4>Support</h4>

              <a href="#">FAQs</a>
              <a href="#">Contact</a>
              <a href="#">Shipping</a>
            </div>

            <div className="footer-column">
              <h4>Legal</h4>

              <a href="#">Terms</a>
              <a href="#">Privacy</a>
            </div>

          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; 2026 PROJENIUS — Give a Book, Earn Rewards
          </p>
        </div>

      </footer>
    </div>
  );
}
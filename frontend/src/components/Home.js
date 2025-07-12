import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Home = () => {
  const { user } = useAuth();
  const [publicUsers, setPublicUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 4;

  useEffect(() => {
    fetchPublicUsers();
  }, [user, currentPage]);

  const fetchPublicUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/users/browse?page=${currentPage}&limit=${usersPerPage}`);
      // Support both {users, total} and array response
      const users = Array.isArray(response.data) ? response.data : response.data.users;
      const total = response.data.total || users.length;
      
      let filteredUsers = users;
      if (user) {
        filteredUsers = users.filter(u => u._id !== user._id);
      }
      
      setPublicUsers(filteredUsers);
      setTotalPages(Math.ceil(total / usersPerPage));
    } catch (error) {
      setError('Failed to load users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="pagination-btn"
        >
          ← Previous
        </button>
      );
    }

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key="1"
          onClick={() => handlePageChange(1)}
          className="pagination-btn"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="pagination-btn"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="pagination-btn"
        >
          Next →
        </button>
      );
    }

    return (
      <div className="pagination">
        {pages}
      </div>
    );
  };

  if (!user) {
    return (
      <div>
        <div className="hero">
          <h1>Welcome to Skill Swap</h1>
          <p className="hero-subtitle">The innovative platform where knowledge meets opportunity. Exchange your skills with others and learn something new in return.</p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary" style={{ marginRight: '10px' }}>
              Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Login
            </Link>
          </div>
        </div>

        <div className="app-info-section">
          <h2>About Skill Swap</h2>
          <p className="app-description">
            Skill Swap is a community-driven platform that connects people who want to learn new skills with those who can teach them. 
            Instead of traditional payment, users exchange their expertise - you teach someone your skill, and they teach you theirs in return.
          </p>
        </div>

        <div className="features">
          <div className="feature-card">
            <h3>🎯 Share Your Expertise</h3>
            <p>List the skills you can teach others. Whether it's programming, cooking, playing guitar, or any other skill, your knowledge is valuable to someone who wants to learn.</p>
          </div>
          
          <div className="feature-card">
            <h3>📚 Learn New Skills</h3>
            <p>Find people who can teach you the skills you want to learn. Connect with experts in your area of interest and start your learning journey.</p>
          </div>
          
          <div className="feature-card">
            <h3>🤝 Safe Exchange</h3>
            <p>Our platform ensures safe skill exchanges with user ratings, verification, and secure communication. Build trust through our community-driven rating system.</p>
          </div>

          <div className="feature-card">
            <h3>🌍 Build Community</h3>
            <p>Join a community of learners and teachers. Connect with like-minded individuals, share experiences, and grow together through skill exchange.</p>
          </div>
        </div>

        <div className="how-it-works">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h4>Create Your Profile</h4>
              <p>Sign up and create your profile. List the skills you can teach and the skills you want to learn.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h4>Browse Users</h4>
              <p>Explore other users' profiles to find people with matching skill interests.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h4>Request a Swap</h4>
              <p>Send a swap request when you find someone with complementary skills.</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h4>Exchange Skills</h4>
              <p>Meet up (virtually or in person) and exchange your skills. Rate each other after completion.</p>
            </div>
          </div>
        </div>

        <div className="benefits-section">
          <h2>Why Choose Skill Swap?</h2>
          <div className="benefits">
            <div className="benefit-item">
              <h4>💰 Cost-Effective Learning</h4>
              <p>Learn new skills without spending money on expensive courses or classes.</p>
            </div>
            <div className="benefit-item">
              <h4>🎓 Practical Experience</h4>
              <p>Learn from real people with practical experience in their fields.</p>
            </div>
            <div className="benefit-item">
              <h4>🤝 Mutual Growth</h4>
              <p>Both parties benefit from the exchange, creating a win-win learning environment.</p>
            </div>
            <div className="benefit-item">
              <h4>🌟 Community Building</h4>
              <p>Connect with people who share your interests and build lasting relationships.</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2>Ready to start swapping skills?</h2>
          <p>Join our community and start learning from others while sharing your expertise.</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading profiles...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">{user ? `Welcome back, ${user.name}!` : 'Welcome to Skill Swap'}</h1>
          <p className="hero-subtitle">{user ? 'Discover people to swap skills with' : 'Exchange your skills with others and learn something new in return.'}</p>
          {!user && (
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary">Get Started</Link>
              <Link to="/login" className="btn btn-secondary">Login</Link>
            </div>
          )}
        </div>
      </div>

      {!user && (
        <div className="features-row">
          <div className="feature-card">
            <h3>Share Your Skills</h3>
            <p>List the skills you can teach others. Whether it's programming, cooking, or playing guitar, your knowledge is valuable.</p>
          </div>
          <div className="feature-card">
            <h3>Learn New Skills</h3>
            <p>Find people who can teach you the skills you want to learn. Connect with experts in your area of interest.</p>
          </div>
          <div className="feature-card">
            <h3>Safe Exchange</h3>
            <p>Our platform ensures safe skill exchanges with user ratings, verification, and secure communication.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <h2>Oops! Something went wrong.</h2>
          <p>{error}</p>
        </div>
      )}

      {user && !loading && !error && (
        <>
          {publicUsers.length === 0 ? (
            <div className="empty-state">
              <h2>No public profiles available</h2>
              <p>Be the first to create a public profile and start swapping skills!</p>
              <Link to="/profile" className="btn btn-primary">Update Your Profile</Link>
            </div>
          ) : (
            <div>
              <h2 className="section-title">Available Skill Swappers</h2>
              <div className="user-grid">
                {publicUsers.map(userProfile => (
                  <div key={userProfile._id} className="user-card-pro">
                    <div className="user-card-header">
                      {userProfile.profilePhoto ? (
                        <img 
                          src={userProfile.profilePhoto} 
                          alt={userProfile.name} 
                          className="user-avatar-pro"
                          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                        />
                      ) : null}
                      <div 
                        className="user-avatar-pro-fallback"
                        style={{ display: userProfile.profilePhoto ? 'none' : 'flex' }}
                      >
                        {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : '?'}
                      </div>
                    </div>
                    <div className="user-card-body">
                      <h3>{userProfile.name || 'Unknown'}</h3>
                      {userProfile.location && <p className="user-location">{userProfile.location}</p>}
                      {(userProfile.totalRatings || 0) === 0 ? (
                        <div className="rating">
                          {'★'.repeat(4)}{'☆'}
                          <span className="rating-number">(3.5)</span>
                        </div>
                      ) : userProfile.rating > 0 ? (
                        <div className="rating">
                          {'★'.repeat(Math.round(userProfile.rating))}
                          {'☆'.repeat(5 - Math.round(userProfile.rating))}
                          <span className="rating-number">({userProfile.rating.toFixed(1)})</span>
                        </div>
                      ) : (
                        <div className="unrated">Unrated</div>
                      )}
                      <div className="skills-list">
                        <span className="skills-label">Skills Offered:</span>
                        <div className="skills-tags">
                          {userProfile.skillsOffered.map((skill, idx) => (
                            <span key={idx} className="skill-tag-pro">{skill}</span>
                          ))}
                        </div>
                      </div>
                      <div className="skills-list">
                        <span className="skills-label">Skills Wanted:</span>
                        <div className="skills-tags">
                          {userProfile.skillsWanted.map((skill, idx) => (
                            <span key={idx} className="skill-tag-pro wanted">{skill}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="user-card-footer">
                      <Link to={`/user/${userProfile._id}`} className="btn btn-primary btn-block">View Profile & Request</Link>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {renderPagination()}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home; 
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Home = () => {
  const { user } = useAuth();
  const [publicUsers, setPublicUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPublicUsers();
  }, [user]);

  const fetchPublicUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users/browse');
      // Support both {users, total} and array response
      const users = Array.isArray(response.data) ? response.data : response.data.users;
      let filteredUsers = users;
      if (user) {
        filteredUsers = users.filter(u => u._id !== user._id);
      }
      setPublicUsers(filteredUsers);
    } catch (error) {
      setError('Failed to load users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div>
        <div className="hero">
          <h1>Welcome to Skill Swap</h1>
          <p>Exchange your skills with others and learn something new in return</p>
          <div>
            <Link to="/register" className="btn btn-primary" style={{ marginRight: '10px' }}>
              Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Login
            </Link>
          </div>
        </div>

        <div className="features">
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
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home; 
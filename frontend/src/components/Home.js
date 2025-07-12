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
    if (user) {
      fetchPublicUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchPublicUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users/browse');
      // Filter out the current user and only show public profiles
      const filteredUsers = response.data.filter(u => u._id !== user._id);
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
    <div>
      <div className="hero">
        <h1>Welcome back, {user.name}!</h1>
        <p>Discover people to swap skills with</p>
      </div>

      {publicUsers.length === 0 ? (
        <div className="text-center">
          <h2>No public profiles available</h2>
          <p>Be the first to create a public profile and start swapping skills!</p>
          <Link to="/profile" className="btn btn-primary">
            Update Your Profile
          </Link>
        </div>
      ) : (
        <div>
          <h2 className="text-center mb-20">Available Skill Swappers</h2>
          <div className="grid grid-3">
            {publicUsers.map(userProfile => (
              <div key={userProfile._id} className="user-card">
                <div className="text-center">
                  {userProfile.profilePhoto ? (
                    <img 
                      src={userProfile.profilePhoto} 
                      alt={userProfile.name} 
                      className="user-avatar"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <div 
                    className="user-avatar" 
                    style={{ 
                      display: userProfile.profilePhoto ? 'none' : 'block',
                      backgroundColor: '#e9ecef',
                      color: '#495057',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      lineHeight: '80px'
                    }}
                  >
                    {userProfile.name.charAt(0).toUpperCase()}
                  </div>
                  
                  <h3>{userProfile.name}</h3>
                  {userProfile.location && <p style={{ color: '#666', marginBottom: '10px' }}>{userProfile.location}</p>}
                  
                  {userProfile.rating > 0 ? (
                    <div className="rating mb-20">
                      {'★'.repeat(Math.round(userProfile.rating))}
                      {'☆'.repeat(5 - Math.round(userProfile.rating))}
                      <span style={{ color: '#666', marginLeft: '5px' }}>
                        ({userProfile.rating.toFixed(1)})
                      </span>
                    </div>
                  ) : (
                    <div className="mb-20" style={{ color: '#999', fontSize: '14px' }}>
                      Unrated
                    </div>
                  )}
                </div>

                <div className="skills-section">
                  <h4>Skills Offered:</h4>
                  <div>
                    {userProfile.skillsOffered.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>

                <div className="skills-section">
                  <h4>Skills Wanted:</h4>
                  <div>
                    {userProfile.skillsWanted.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <Link to={`/user/${userProfile._id}`} className="btn btn-primary">
                    View Profile & Request
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home; 
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const UserDetail = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSwapForm, setShowSwapForm] = useState(false);
  const [swapForm, setSwapForm] = useState({
    skillOffered: '',
    skillRequested: '',
    message: ''
  });

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`/api/users/${id}`);
      setUser(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  const handleSwapSubmit = async (e) => {
    e.preventDefault();
    
    if (!swapForm.skillOffered || !swapForm.skillRequested) {
      setError('Please select both skills');
      return;
    }

    try {
      await axios.post('/api/swaps', {
        recipientId: id,
        skillOffered: swapForm.skillOffered,
        skillRequested: swapForm.skillRequested,
        message: swapForm.message
      });
      
      setShowSwapForm(false);
      setSwapForm({ skillOffered: '', skillRequested: '', message: '' });
      navigate('/my-swaps');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create swap request');
    }
  };

  if (loading) {
    return <div className="loading">Loading user profile...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!user) {
    return <div className="error">User not found</div>;
  }

  return (
    <div>
      <div className="profile-header">
        <div>
          {user.profilePhoto ? (
            <img src={user.profilePhoto} alt={user.name} className="profile-avatar" />
          ) : (
            <div 
              className="profile-avatar"
              style={{ 
                backgroundColor: '#e9ecef',
                color: '#495057',
                fontSize: '48px',
                fontWeight: 'bold',
                lineHeight: '120px'
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <h2>{user.name}</h2>
        {user.location && <p>{user.location}</p>}
        {user.rating > 0 && (
          <div className="rating">
            {'★'.repeat(Math.round(user.rating))}
            {'☆'.repeat(5 - Math.round(user.rating))}
            <span style={{ color: '#666', marginLeft: '5px' }}>
              ({user.rating.toFixed(1)})
            </span>
          </div>
        )}
      </div>

      <div className="skills-section">
        <h3>Skills Offered</h3>
        <div>
          {user.skillsOffered.map((skill, index) => (
            <span key={index} className="skill-tag">{skill}</span>
          ))}
        </div>
      </div>

      <div className="skills-section">
        <h3>Skills Wanted</h3>
        <div>
          {user.skillsWanted.map((skill, index) => (
            <span key={index} className="skill-tag">{skill}</span>
          ))}
        </div>
      </div>

      <div className="skills-section">
        <h3>Availability</h3>
        <div>
          {Object.entries(user.availability).map(([key, value]) => (
            value && <span key={key} className="skill-tag">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
          ))}
        </div>
      </div>

      {currentUser && currentUser._id !== user._id && (
        <div className="card">
          <h3>Request a Skill Swap</h3>
          {!showSwapForm ? (
            <button 
              onClick={() => setShowSwapForm(true)} 
              className="btn btn-primary"
            >
              Propose Swap
            </button>
          ) : (
            <form onSubmit={handleSwapSubmit}>
              <div className="form-group">
                <label htmlFor="skillOffered">I can teach you:</label>
                <select
                  id="skillOffered"
                  name="skillOffered"
                  className="form-control"
                  value={swapForm.skillOffered}
                  onChange={(e) => setSwapForm(prev => ({ ...prev, skillOffered: e.target.value }))}
                  required
                >
                  <option value="">Select a skill you can offer</option>
                  {currentUser.skillsOffered?.map((skill, index) => (
                    <option key={index} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="skillRequested">I want to learn:</label>
                <select
                  id="skillRequested"
                  name="skillRequested"
                  className="form-control"
                  value={swapForm.skillRequested}
                  onChange={(e) => setSwapForm(prev => ({ ...prev, skillRequested: e.target.value }))}
                  required
                >
                  <option value="">Select a skill you want to learn</option>
                  {user.skillsOffered?.map((skill, index) => (
                    <option key={index} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message (Optional):</label>
                <textarea
                  id="message"
                  name="message"
                  className="form-control"
                  value={swapForm.message}
                  onChange={(e) => setSwapForm(prev => ({ ...prev, message: e.target.value }))}
                  rows="3"
                  placeholder="Add a personal message to your swap request..."
                />
              </div>

              <div className="flex" style={{ gap: '10px' }}>
                <button type="submit" className="btn btn-primary">
                  Send Swap Request
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowSwapForm(false)} 
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDetail; 
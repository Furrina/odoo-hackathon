import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { SKILL_LIST } from '../skills';

const UserDetail = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
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

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    
    if (!requestForm.skillOffered || !requestForm.skillRequested) {
      setError('Please select both skills');
      return;
    }

    try {
      await axios.post('/api/swaps', {
        recipientId: id,
        skillOffered: requestForm.skillOffered,
        skillRequested: requestForm.skillRequested,
        message: requestForm.message
      });
      
      setShowRequestForm(false);
      setRequestForm({ skillOffered: '', skillRequested: '', message: '' });
      navigate('/my-swaps');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create swap request');
    }
  };

  // Calculate skill intersections
  const getSkillIntersections = () => {
    if (!currentUser || !user) return { offered: [], requested: [] };

    console.log('Current user skills offered:', currentUser.skillsOffered);
    console.log('Current user skills wanted:', currentUser.skillsWanted);
    console.log('Other user skills offered:', user.skillsOffered);
    console.log('Other user skills wanted:', user.skillsWanted);

    // Skills I can offer that they want
    const offeredIntersection = currentUser.skillsOffered?.filter(skill => 
      user.skillsWanted?.includes(skill)
    ) || [];

    // Skills I want that they can offer
    const requestedIntersection = currentUser.skillsWanted?.filter(skill => 
      user.skillsOffered?.includes(skill)
    ) || [];

    console.log('Offered intersection:', offeredIntersection);
    console.log('Requested intersection:', requestedIntersection);

    return { offered: offeredIntersection, requested: requestedIntersection };
  };

  const skillIntersections = getSkillIntersections();
  console.log('Final skill intersections:', skillIntersections);

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
        {(user.totalRatings || 0) === 0 ? (
          <div className="rating">
            {'★'.repeat(4)}{'☆'}
            <span style={{ color: '#666', marginLeft: '5px' }}>(3.5)</span>
          </div>
        ) : user.rating > 0 ? (
          <div className="rating">
            {'★'.repeat(Math.round(user.rating))}
            {'☆'.repeat(5 - Math.round(user.rating))}
            <span style={{ color: '#666', marginLeft: '5px' }}>
              ({user.rating.toFixed(1)})
            </span>
          </div>
        ) : (
          <div style={{ color: '#999', fontSize: '16px' }}>
            Unrated
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
          
          {!showRequestForm ? (
            <div>
              <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
                <p>Debug Info:</p>
                <p>Skills you can offer that they want: {skillIntersections.offered.join(', ') || 'None'}</p>
                <p>Skills you want that they can offer: {skillIntersections.requested.join(', ') || 'None'}</p>
              </div>
              
              {skillIntersections.offered.length > 0 && skillIntersections.requested.length > 0 ? (
                <button 
                  onClick={() => setShowRequestForm(true)} 
                  className="btn btn-primary"
                >
                  Send Swap Request
                </button>
              ) : (
                <div className="alert alert-info">
                  <p>No matching skills found for a swap:</p>
                  <ul>
                    {skillIntersections.offered.length === 0 && (
                      <li>You don't have any skills they want to learn</li>
                    )}
                    {skillIntersections.requested.length === 0 && (
                      <li>They don't have any skills you want to learn</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleRequestSubmit}>
              <div className="form-group">
                <label htmlFor="skillOffered">I can teach you:</label>
                <select
                  id="skillOffered"
                  name="skillOffered"
                  className="form-control"
                  value={requestForm.skillOffered}
                  onChange={e => setRequestForm(prev => ({ ...prev, skillOffered: e.target.value }))}
                  required
                >
                  <option value="">Select a skill you can offer</option>
                  {skillIntersections.offered.map((skill, index) => (
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
                  value={requestForm.skillRequested}
                  onChange={e => setRequestForm(prev => ({ ...prev, skillRequested: e.target.value }))}
                  required
                >
                  <option value="">Select a skill you want to learn</option>
                  {skillIntersections.requested.map((skill, index) => (
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
                  value={requestForm.message}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, message: e.target.value }))}
                  rows="3"
                  placeholder="Add a personal message to your swap request..."
                />
              </div>

              <div className="flex" style={{ gap: '10px' }}>
                <button type="submit" className="btn btn-primary">
                  Send Request
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowRequestForm(false)} 
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
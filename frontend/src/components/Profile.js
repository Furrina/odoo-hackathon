import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    skillsOffered: [],
    skillsWanted: [],
    availability: {
      weekdays: false,
      weekends: false,
      evenings: false,
      mornings: false
    },
    isPublic: true
  });
  const [newSkill, setNewSkill] = useState({ offered: '', wanted: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setProfile(response.data);
      setFormData({
        name: response.data.name,
        location: response.data.location || '',
        skillsOffered: response.data.skillsOffered || [],
        skillsWanted: response.data.skillsWanted || [],
        availability: response.data.availability || {
          weekdays: false,
          weekends: false,
          evenings: false,
          mornings: false
        },
        isPublic: response.data.isPublic
      });
    } catch (error) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('availability.')) {
      const availabilityKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        availability: {
          ...prev.availability,
          [availabilityKey]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.put('/api/users/profile', formData);
      setProfile(response.data);
      updateUser(response.data);
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = async (type) => {
    const skill = type === 'offered' ? newSkill.offered : newSkill.wanted;
    if (!skill.trim()) return;

    try {
      const response = await axios.post(`/api/users/skills-${type}`, { skill: skill.trim() });
      setFormData(prev => ({
        ...prev,
        [`skills${type.charAt(0).toUpperCase() + type.slice(1)}`]: response.data
      }));
      setNewSkill(prev => ({ ...prev, [type]: '' }));
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add skill');
    }
  };

  const removeSkill = async (type, skill) => {
    try {
      const response = await axios.delete(`/api/users/skills-${type}/${encodeURIComponent(skill)}`);
      setFormData(prev => ({
        ...prev,
        [`skills${type.charAt(0).toUpperCase() + type.slice(1)}`]: response.data
      }));
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to remove skill');
    }
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await axios.post('/api/auth/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(response.data);
      updateUser(response.data);
      setSuccess('Profile photo updated successfully!');
    } catch (error) {
      setError('Failed to upload photo');
    }
  };

  if (loading && !profile) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="error">Failed to load profile</div>;
  }

  return (
    <div>
      <div className="profile-header">
        <div>
          {profile.profilePhoto ? (
            <img src={profile.profilePhoto} alt={profile.name} className="profile-avatar" />
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
              {profile.name.charAt(0).toUpperCase()}
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={uploadPhoto}
            style={{ display: 'none' }}
            id="photo-upload"
          />
          <label htmlFor="photo-upload" className="btn btn-secondary" style={{ marginTop: '10px' }}>
            Change Photo
          </label>
        </div>
        
        <h2>{profile.name}</h2>
        {profile.location && <p>{profile.location}</p>}
        {profile.rating > 0 ? (
          <div className="rating">
            {'★'.repeat(Math.round(profile.rating))}
            {'☆'.repeat(5 - Math.round(profile.rating))}
            <span style={{ color: '#666', marginLeft: '5px' }}>
              ({profile.rating.toFixed(1)})
            </span>
          </div>
        ) : (
          <div style={{ color: '#999', fontSize: '16px' }}>
            Unrated
          </div>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div className="flex flex-between mb-20">
          <h3>Profile Information</h3>
          <button 
            onClick={() => setEditing(!editing)} 
            className="btn btn-primary"
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Address/Location</label>
              <input
                type="text"
                id="location"
                name="location"
                className="form-control"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, Country"
              />
            </div>

            <div className="form-group">
              <label>Availability</label>
              <div>
                {Object.entries(formData.availability).map(([key, value]) => (
                  <label key={key} style={{ display: 'block', marginBottom: '5px' }}>
                    <input
                      type="checkbox"
                      name={`availability.${key}`}
                      checked={value}
                      onChange={handleChange}
                      style={{ marginRight: '8px' }}
                    />
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  style={{ marginRight: '8px' }}
                />
                Make my profile public (visible to other users)
              </label>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        ) : (
          <div>
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Address:</strong> {profile.location || 'Not specified'}</p>
            <p><strong>Profile Visibility:</strong> {profile.isPublic ? 'Public' : 'Private'}</p>
            <p><strong>Availability:</strong></p>
            <ul>
              {Object.entries(profile.availability).map(([key, value]) => (
                value && <li key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="skills-section">
        <h3>Skills I Can Offer</h3>
        <div className="skill-input-group">
          <input
            type="text"
            placeholder="Add a skill you can teach"
            value={newSkill.offered}
            onChange={(e) => setNewSkill(prev => ({ ...prev, offered: e.target.value }))}
            className="form-control"
          />
          <button 
            onClick={() => addSkill('offered')} 
            className="btn btn-success"
            disabled={!newSkill.offered.trim()}
          >
            Add
          </button>
        </div>
        <div>
          {formData.skillsOffered.map((skill, index) => (
            <span key={index} className="skill-tag">
              {skill}
              <button
                onClick={() => removeSkill('offered', skill)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#dc3545', 
                  marginLeft: '5px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="skills-section">
        <h3>Skills I Want to Learn</h3>
        <div className="skill-input-group">
          <input
            type="text"
            placeholder="Add a skill you want to learn"
            value={newSkill.wanted}
            onChange={(e) => setNewSkill(prev => ({ ...prev, wanted: e.target.value }))}
            className="form-control"
          />
          <button 
            onClick={() => addSkill('wanted')} 
            className="btn btn-success"
            disabled={!newSkill.wanted.trim()}
          >
            Add
          </button>
        </div>
        <div>
          {formData.skillsWanted.map((skill, index) => (
            <span key={index} className="skill-tag">
              {skill}
              <button
                onClick={() => removeSkill('wanted', skill)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#dc3545', 
                  marginLeft: '5px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile; 
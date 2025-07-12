import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { SKILL_LIST } from '../skills';

const BrowseUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState({
    weekdays: false,
    weekends: false,
    evenings: false,
    mornings: false
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchUsers();
  }, [page]); // Re-fetch when page changes

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let url = '/api/users/browse';
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('skill', searchTerm);
      if (locationFilter) params.append('location', locationFilter);
      Object.entries(availabilityFilter).forEach(([key, value]) => {
        if (value) params.append('availability', key);
      });
      params.append('page', page);
      params.append('limit', limit);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url);
      setUsers(response.data.users);
      setTotal(response.data.total);
    } catch (error) {
      setError('Failed to load users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset page to 1 when new search
    fetchUsers();
  };

  const handleClear = () => {
    setSearchTerm('');
    setLocationFilter('');
    setAvailabilityFilter({ weekdays: false, weekends: false, evenings: false, mornings: false });
    setPage(1); // Reset page to 1 when clear
    fetchUsers();
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      <h2 className="text-center mb-20">Browse Users</h2>
      
      <div className="card mb-20">
        <form onSubmit={handleSearch} className="flex" style={{ gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="form-control"
            style={{ flex: '1', minWidth: '200px' }}
          >
            <option value="">Search by skill</option>
            {SKILL_LIST.map(skill => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Filter by location"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="form-control"
            style={{ flex: '1', minWidth: '200px' }}
          />
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label>Availability:</label>
            {Object.entries(availabilityFilter).map(([key, value]) => (
              <label key={key} style={{ marginRight: '8px' }}>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={e => setAvailabilityFilter(prev => ({ ...prev, [key]: e.target.checked }))}
                />
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
            ))}
          </div>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
          <button type="button" onClick={handleClear} className="btn btn-secondary">
            Clear
          </button>
        </form>
      </div>

      {users.length === 0 ? (
        <div className="text-center">
          <p>No users found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {users.map(user => (
            <div key={user._id} className="user-card">
              <div className="text-center">
                {user.profilePhoto ? (
                  <img 
                    src={user.profilePhoto} 
                    alt={user.name} 
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
                    display: user.profilePhoto ? 'none' : 'block',
                    backgroundColor: '#e9ecef',
                    color: '#495057',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    lineHeight: '80px'
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                
                <h3>{user.name}</h3>
                {user.location && <p style={{ color: '#666', marginBottom: '10px' }}>{user.location}</p>}
                
                {user.totalRatings === 0 ? (
                  <div className="rating mb-20">
                    {'★'.repeat(4)}{'☆'}
                    <span style={{ color: '#666', marginLeft: '5px' }}>(3.5)</span>
                  </div>
                ) : user.rating > 0 ? (
                  <div className="rating mb-20">
                    {'★'.repeat(Math.round(user.rating))}
                    {'☆'.repeat(5 - Math.round(user.rating))}
                    <span style={{ color: '#666', marginLeft: '5px' }}>({user.rating.toFixed(1)})</span>
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
                  {user.skillsOffered.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="skills-section">
                <h4>Skills Wanted:</h4>
                <div>
                  {user.skillsWanted.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <Link to={`/user/${user._id}`} className="btn btn-primary">
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add pagination controls below the user grid: */}
      <div className="pagination-controls">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
        <span>Page {page} of {Math.ceil(total / limit)}</span>
        <button onClick={() => setPage(p => (p * limit < total ? p + 1 : p))} disabled={page * limit >= total}>Next</button>
      </div>
    </div>
  );
};

export default BrowseUsers; 
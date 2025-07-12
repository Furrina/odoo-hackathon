import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BrowseUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let url = '/api/users/browse';
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('skill', searchTerm);
      if (locationFilter) params.append('location', locationFilter);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url);
      setUsers(response.data);
    } catch (error) {
      setError('Failed to load users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleClear = () => {
    setSearchTerm('');
    setLocationFilter('');
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
          <input
            type="text"
            placeholder="Search by skill (e.g., Photoshop, Excel)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
            style={{ flex: '1', minWidth: '200px' }}
          />
          <input
            type="text"
            placeholder="Filter by location"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="form-control"
            style={{ flex: '1', minWidth: '200px' }}
          />
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
                
                {user.rating > 0 && (
                  <div className="rating mb-20">
                    {'★'.repeat(Math.round(user.rating))}
                    {'☆'.repeat(5 - Math.round(user.rating))}
                    <span style={{ color: '#666', marginLeft: '5px' }}>
                      ({user.rating.toFixed(1)})
                    </span>
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
    </div>
  );
};

export default BrowseUsers; 
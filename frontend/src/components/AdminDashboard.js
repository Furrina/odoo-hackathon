import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('stats');
  const [newMessage, setNewMessage] = useState({
    title: '',
    content: '',
    type: 'info'
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/stats');
      setStats(response.data);
    } catch (error) {
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      setError('Failed to load users');
    }
  };

  const fetchSwaps = async () => {
    try {
      const response = await axios.get('/api/admin/swaps');
      setSwaps(response.data);
    } catch (error) {
      setError('Failed to load swaps');
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get('/api/admin/messages');
      setMessages(response.data);
    } catch (error) {
      setError('Failed to load messages');
    }
  };

  const handleBanUser = async (userId, isBanned) => {
    try {
      await axios.put(`/api/admin/users/${userId}/ban`, { isBanned });
      fetchUsers();
      fetchStats();
    } catch (error) {
      setError('Failed to update user status');
    }
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/messages', newMessage);
      setNewMessage({ title: '', content: '', type: 'info' });
      fetchMessages();
    } catch (error) {
      setError('Failed to create message');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    
    switch (tab) {
      case 'users':
        fetchUsers();
        break;
      case 'swaps':
        fetchSwaps();
        break;
      case 'messages':
        fetchMessages();
        break;
      default:
        break;
    }
  };

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  return (
    <div>
      <h2 className="text-center mb-20">Admin Dashboard</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Navigation Tabs */}
      <div className="flex" style={{ marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
        <button
          onClick={() => handleTabChange('stats')}
          className={`btn ${activeTab === 'stats' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ marginRight: '10px' }}
        >
          Statistics
        </button>
        <button
          onClick={() => handleTabChange('users')}
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ marginRight: '10px' }}
        >
          Users
        </button>
        <button
          onClick={() => handleTabChange('swaps')}
          className={`btn ${activeTab === 'swaps' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ marginRight: '10px' }}
        >
          Swaps
        </button>
        <button
          onClick={() => handleTabChange('messages')}
          className={`btn ${activeTab === 'messages' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Messages
        </button>
      </div>

      {/* Statistics Tab */}
      {activeTab === 'stats' && stats && (
        <div>
          <div className="admin-stats">
            <div className="stat-card">
              <div className="stat-number">{stats.totalUsers}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.totalSwaps}</div>
              <div className="stat-label">Total Swaps</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.pendingSwaps}</div>
              <div className="stat-label">Pending Swaps</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.completedSwaps}</div>
              <div className="stat-label">Completed Swaps</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.bannedUsers}</div>
              <div className="stat-label">Banned Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.completionRate}%</div>
              <div className="stat-label">Completion Rate</div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <h3>User Management</h3>
          <div className="card">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Location</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>{user.name}</td>
                    <td style={{ padding: '10px' }}>{user.email}</td>
                    <td style={{ padding: '10px' }}>{user.location || 'N/A'}</td>
                    <td style={{ padding: '10px' }}>
                      <span className={`status-badge ${user.isBanned ? 'status-rejected' : 'status-accepted'}`}>
                        {user.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <button
                        onClick={() => handleBanUser(user._id, !user.isBanned)}
                        className={`btn ${user.isBanned ? 'btn-success' : 'btn-danger'}`}
                        style={{ fontSize: '12px', padding: '5px 10px' }}
                      >
                        {user.isBanned ? 'Unban' : 'Ban'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Swaps Tab */}
      {activeTab === 'swaps' && (
        <div>
          <h3>Swap Management</h3>
          <div className="card">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Requester</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Recipient</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Skills</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {swaps.map(swap => (
                  <tr key={swap._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>{swap.requester.name}</td>
                    <td style={{ padding: '10px' }}>{swap.recipient.name}</td>
                    <td style={{ padding: '10px' }}>
                      <div>
                        <strong>Offered:</strong> {swap.skillOffered}
                      </div>
                      <div>
                        <strong>Requested:</strong> {swap.skillRequested}
                      </div>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span className={`status-badge ${getStatusColor(swap.status)}`}>
                        {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      {new Date(swap.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div>
          <h3>Platform Messages</h3>
          
          {/* Create New Message */}
          <div className="card mb-20">
            <h4>Create New Message</h4>
            <form onSubmit={handleMessageSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  className="form-control"
                  value={newMessage.title}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="content">Content</label>
                <textarea
                  id="content"
                  className="form-control"
                  rows="4"
                  value={newMessage.content}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="type">Type</label>
                <select
                  id="type"
                  className="form-control"
                  value={newMessage.type}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="alert">Alert</option>
                  <option value="update">Update</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">
                Create Message
              </button>
            </form>
          </div>

          {/* Existing Messages */}
          <div className="card">
            <h4>Existing Messages</h4>
            {messages.map(message => (
              <div key={message._id} className="card" style={{ marginBottom: '15px' }}>
                <div className="flex flex-between">
                  <h5>{message.title}</h5>
                  <span className={`status-badge ${message.isActive ? 'status-accepted' : 'status-cancelled'}`}>
                    {message.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p>{message.content}</p>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Type: {message.type} | Created: {new Date(message.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'status-pending';
    case 'accepted': return 'status-accepted';
    case 'completed': return 'status-completed';
    case 'rejected': return 'status-rejected';
    case 'cancelled': return 'status-cancelled';
    default: return '';
  }
};

export default AdminDashboard; 
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const MySwaps = () => {
  const { user } = useAuth();
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('received');
  const [ratingForm, setRatingForm] = useState({
    swapId: '',
    rating: 5,
    comment: '',
    forRole: ''
  });

  useEffect(() => {
    fetchSwaps();
  }, []);

  const fetchSwaps = async () => {
    try {
      const response = await axios.get('/api/swaps/my-swaps');
      setSwaps(response.data);
    } catch (error) {
      setError('Failed to load swaps');
    } finally {
      setLoading(false);
    }
  };

  const handleSwapAction = async (swapId, action) => {
    try {
      await axios.put(`/api/swaps/${swapId}/${action}`);
      fetchSwaps();
    } catch (error) {
      setError(error.response?.data?.message || `Failed to ${action} swap`);
    }
  };

  const handleDeleteSwap = async (swapId) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        await axios.put(`/api/swaps/${swapId}/cancel`);
        fetchSwaps();
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete request');
      }
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/swaps/${ratingForm.swapId}/rate`, {
        rating: ratingForm.rating,
        comment: ratingForm.comment,
        forRole: ratingForm.forRole
      });
      setRatingForm({ swapId: '', rating: 5, comment: '', forRole: '' });
      fetchSwaps();
    } catch (error) {
      setError('Failed to submit rating');
    }
  };

  const showRatingForm = (swapId, forRole) => {
    setRatingForm({ swapId, rating: 5, comment: '', forRole });
  };

  const cancelRating = () => {
    setRatingForm({ swapId: '', rating: 5, comment: '', forRole: '' });
  };

  const handleMarkCompleted = async (swapId) => {
    try {
      await axios.put(`/api/swaps/${swapId}/complete`);
      fetchSwaps();
    } catch (error) {
      setError('Failed to mark swap as completed');
    }
  };

  // Helper function to display user rating
  const displayUserRating = (user) => {
    if ((user.totalRatings || 0) === 0) {
      return (
        <div className="rating">
          {'★'.repeat(4)}{'☆'}
          <span style={{ color: '#666', marginLeft: '5px' }}>(3.5)</span>
        </div>
      );
    } else if (user.rating > 0) {
      return (
        <div className="rating">
          {'★'.repeat(Math.round(user.rating))}
          {'☆'.repeat(5 - Math.round(user.rating))}
          <span style={{ color: '#666', marginLeft: '5px' }}>({user.rating.toFixed(1)})</span>
        </div>
      );
    } else {
      return <div style={{ color: '#999', fontSize: '14px' }}>Unrated</div>;
    }
  };

  // Helper function to check if user can rate a swap
  const canRateSwap = (swap, currentUserId) => {
    if (swap.status !== 'completed') return false;
    
    const isRequester = swap.requester._id === currentUserId;
    const isRecipient = swap.recipient._id === currentUserId;
    
    if (isRequester && !swap.requesterRating) return true;
    if (isRecipient && !swap.recipientRating) return true;
    
    return false;
  };

  // Helper function to get the role for rating
  const getRatingRole = (swap, currentUserId) => {
    if (swap.requester._id === currentUserId) return 'recipient';
    if (swap.recipient._id === currentUserId) return 'requester';
    return '';
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

  // Filter swaps based on current user's role
  const sentSwaps = swaps.filter(swap => swap.requester._id === user._id);
  const receivedSwaps = swaps.filter(swap => swap.recipient._id === user._id);

  // Group received swaps by status
  const pendingReceived = receivedSwaps.filter(swap => swap.status === 'pending');
  const otherReceived = receivedSwaps.filter(swap => swap.status !== 'pending');

  if (loading) {
    return <div className="loading">Loading your swaps...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      <h2 className="text-center mb-20">My Skill Swaps</h2>

      {/* Tab Navigation */}
      <div className="flex" style={{ marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
        <button
          onClick={() => setActiveTab('received')}
          className={`btn ${activeTab === 'received' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ marginRight: '10px' }}
        >
          Received ({receivedSwaps.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`btn ${activeTab === 'sent' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Sent ({sentSwaps.length})
        </button>
      </div>

      {/* Received Swaps Tab */}
      {activeTab === 'received' && (
        <div>
          {receivedSwaps.length === 0 ? (
            <div className="text-center">
              <p>You haven't received any swap requests yet.</p>
            </div>
          ) : (
            <div>
              {/* Pending Requests - Actions Section */}
              {pendingReceived.length > 0 && (
                <div className="card mb-20">
                  <h3>Actions Required ({pendingReceived.length})</h3>
                  <div className="grid grid-2">
                    {pendingReceived.map(swap => (
                      <div key={swap._id} className="swap-card pending">
                        <div className="flex" style={{ alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                          {swap.requester.profilePhoto ? (
                            <img 
                              src={swap.requester.profilePhoto} 
                              alt={swap.requester.name}
                              style={{ width: '60px', height: '60px', borderRadius: '50%' }}
                            />
                          ) : (
                            <div 
                              style={{ 
                                width: '60px', 
                                height: '60px', 
                                borderRadius: '50%',
                                backgroundColor: '#e9ecef',
                                color: '#495057',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '20px'
                              }}
                            >
                              {swap.requester.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h4>{swap.requester.name}</h4>
                            {displayUserRating(swap.requester)}
                            <span className={`status-badge ${getStatusColor(swap.status)}`}>
                              {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                            </span>
                          </div>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                          <p><strong>Wants to learn:</strong> {swap.skillOffered}</p>
                          <p><strong>Can teach you:</strong> {swap.skillRequested}</p>
                          {swap.message && (
                            <p><strong>Message:</strong> "{swap.message}"</p>
                          )}
                        </div>

                        <div className="flex" style={{ gap: '10px' }}>
                          <button 
                            onClick={() => handleSwapAction(swap._id, 'accept')}
                            className="btn btn-success"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleSwapAction(swap._id, 'reject')}
                            className="btn btn-danger"
                          >
                            Reject
                          </button>
                        </div>
                        {swap.status === 'completed' && canRateSwap(swap, user._id) && (
                          <div className="rating-form">
                            <button 
                              onClick={() => showRatingForm(swap._id, getRatingRole(swap, user._id))}
                              className="btn btn-secondary"
                            >
                              Rate this swap
                            </button>
                          </div>
                        )}

                        {swap.status === 'completed' && (
                          <div className="swap-ratings">
                            {swap.requesterRating && (
                              <div>
                                <strong>Your rating:</strong> {swap.requesterRating.rating}/5
                                {swap.requesterRating.comment && <p>"{swap.requesterRating.comment}"</p>}
                              </div>
                            )}
                            {swap.recipientRating && (
                              <div>
                                <strong>Their rating:</strong> {swap.recipientRating.rating}/5
                                {swap.recipientRating.comment && <p>"{swap.recipientRating.comment}"</p>}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Other Received Requests - Log Section */}
              {otherReceived.length > 0 && (
                <div className="card">
                  <h3>Request Log</h3>
                  <div className="grid grid-2">
                    {otherReceived.map(swap => (
                      <div key={swap._id} className={`swap-card ${swap.status}`}>
                        <div className="flex" style={{ alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                          {swap.requester.profilePhoto ? (
                            <img 
                              src={swap.requester.profilePhoto} 
                              alt={swap.requester.name}
                              style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                            />
                          ) : (
                            <div 
                              style={{ 
                                width: '50px', 
                                height: '50px', 
                                borderRadius: '50%',
                                backgroundColor: '#e9ecef',
                                color: '#495057',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold'
                              }}
                            >
                              {swap.requester.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h4>{swap.requester.name}</h4>
                            <span className={`status-badge ${getStatusColor(swap.status)}`}>
                              {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                            </span>
                          </div>
                        </div>

                        <div>
                          <p><strong>Wanted to learn:</strong> {swap.skillOffered}</p>
                          <p><strong>Could teach you:</strong> {swap.skillRequested}</p>
                          {swap.message && (
                            <p><strong>Message:</strong> "{swap.message}"</p>
                          )}
                          <p><strong>Date:</strong> {new Date(swap.createdAt).toLocaleDateString()}</p>
                        </div>
                        {swap.status === 'accepted' && (swap.requester._id === user._id || swap.recipient._id === user._id) && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleMarkCompleted(swap._id)}
                            style={{ marginTop: '8px' }}
                          >
                            Mark as Completed
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sent Swaps Tab */}
      {activeTab === 'sent' && (
        <div>
          {sentSwaps.length === 0 ? (
            <div className="text-center">
              <p>You haven't sent any swap requests yet.</p>
              <p>Start by browsing users and proposing skill swaps!</p>
            </div>
          ) : (
            <div className="grid grid-2">
              {sentSwaps.map(swap => (
                <div key={swap._id} className={`swap-card ${swap.status}`}>
                  <div className="flex" style={{ alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    {swap.recipient.profilePhoto ? (
                      <img 
                        src={swap.recipient.profilePhoto} 
                        alt={swap.recipient.name}
                        style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                      />
                    ) : (
                      <div 
                        style={{ 
                          width: '50px', 
                          height: '50px', 
                          borderRadius: '50%',
                          backgroundColor: '#e9ecef',
                          color: '#495057',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold'
                        }}
                      >
                        {swap.recipient.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4>{swap.recipient.name}</h4>
                      <span className={`status-badge ${getStatusColor(swap.status)}`}>
                        {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <p><strong>You offered:</strong> {swap.skillOffered}</p>
                    <p><strong>You want to learn:</strong> {swap.skillRequested}</p>
                    {swap.message && (
                      <p><strong>Your message:</strong> "{swap.message}"</p>
                    )}
                    <p><strong>Date:</strong> {new Date(swap.createdAt).toLocaleDateString()}</p>
                  </div>

                  {swap.status === 'pending' && (
                    <button 
                      onClick={() => handleDeleteSwap(swap._id)}
                      className="btn btn-danger"
                    >
                      Delete Request
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {ratingForm.swapId && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Rate this swap</h3>
            <form onSubmit={handleRatingSubmit}>
              <div className="form-group">
                <label>Rating:</label>
                <select 
                  value={ratingForm.rating} 
                  onChange={e => setRatingForm(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                  className="form-control"
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Very Good</option>
                  <option value={3}>3 - Good</option>
                  <option value={2}>2 - Fair</option>
                  <option value={1}>1 - Poor</option>
                </select>
              </div>
              <div className="form-group">
                <label>Comment (optional):</label>
                <textarea 
                  value={ratingForm.comment}
                  onChange={e => setRatingForm(prev => ({ ...prev, comment: e.target.value }))}
                  className="form-control"
                  rows="3"
                />
              </div>
              <div className="flex" style={{ gap: '10px' }}>
                <button type="submit" className="btn btn-primary">Submit Rating</button>
                <button type="button" onClick={cancelRating} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySwaps; 
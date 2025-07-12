import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const MySwaps = () => {
  const { user } = useAuth();
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ratingForm, setRatingForm] = useState({
    swapId: '',
    rating: 5,
    comment: ''
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

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/swaps/${ratingForm.swapId}/rate`, {
        rating: ratingForm.rating,
        comment: ratingForm.comment
      });
      setRatingForm({ swapId: '', rating: 5, comment: '' });
      fetchSwaps();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit rating');
    }
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

  const canRate = (swap) => {
    return swap.status === 'completed' && 
           !swap.requesterRating?.rating && 
           !swap.recipientRating?.rating;
  };

  if (loading) {
    return <div className="loading">Loading your swaps...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      <h2 className="text-center mb-20">My Skill Swaps</h2>

      {swaps.length === 0 ? (
        <div className="text-center">
          <p>You don't have any swaps yet.</p>
          <p>Start by browsing users and proposing skill swaps!</p>
        </div>
      ) : (
        <div>
          {swaps.map(swap => {
            const isRequester = swap.requester._id === user._id;
            const otherUser = isRequester ? swap.recipient : swap.requester;
            
            return (
              <div key={swap._id} className={`swap-card ${swap.status}`}>
                <div className="flex flex-between mb-20">
                  <h3>
                    {isRequester ? 'You offered' : 'You received'} a swap request
                  </h3>
                  <span className={`status-badge ${getStatusColor(swap.status)}`}>
                    {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-2">
                  <div>
                    <h4>Swap Details</h4>
                    <p><strong>You offer:</strong> {swap.skillOffered}</p>
                    <p><strong>You receive:</strong> {swap.skillRequested}</p>
                    {swap.message && (
                      <p><strong>Message:</strong> {swap.message}</p>
                    )}
                    <p><strong>Date:</strong> {new Date(swap.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div>
                    <h4>Other User</h4>
                    <div className="flex" style={{ alignItems: 'center', gap: '10px' }}>
                      {otherUser.profilePhoto ? (
                        <img 
                          src={otherUser.profilePhoto} 
                          alt={otherUser.name}
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
                          {otherUser.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p><strong>{otherUser.name}</strong></p>
                        {otherUser.rating > 0 && (
                          <div className="rating">
                            {'★'.repeat(Math.round(otherUser.rating))}
                            {'☆'.repeat(5 - Math.round(otherUser.rating))}
                            <span style={{ color: '#666', marginLeft: '5px' }}>
                              ({otherUser.rating.toFixed(1)})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {swap.status === 'pending' && (
                  <div className="flex" style={{ gap: '10px', marginTop: '15px' }}>
                    {!isRequester && (
                      <>
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
                      </>
                    )}
                    {isRequester && (
                      <button 
                        onClick={() => handleSwapAction(swap._id, 'cancel')}
                        className="btn btn-warning"
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>
                )}

                {swap.status === 'accepted' && (
                  <div className="flex" style={{ gap: '10px', marginTop: '15px' }}>
                    <button 
                      onClick={() => handleSwapAction(swap._id, 'complete')}
                      className="btn btn-success"
                    >
                      Mark as Completed
                    </button>
                  </div>
                )}

                {/* Rating Section */}
                {canRate(swap) && (
                  <div className="card" style={{ marginTop: '15px' }}>
                    <h4>Rate this swap</h4>
                    <form onSubmit={handleRatingSubmit}>
                      <div className="form-group">
                        <label>Rating:</label>
                        <select
                          value={ratingForm.rating}
                          onChange={(e) => setRatingForm(prev => ({ 
                            ...prev, 
                            rating: parseInt(e.target.value),
                            swapId: swap._id 
                          }))}
                          className="form-control"
                          style={{ width: '100px' }}
                        >
                          {[5, 4, 3, 2, 1].map(num => (
                            <option key={num} value={num}>
                              {num} {num === 1 ? 'Star' : 'Stars'}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Comment:</label>
                        <textarea
                          value={ratingForm.comment}
                          onChange={(e) => setRatingForm(prev => ({ 
                            ...prev, 
                            comment: e.target.value 
                          }))}
                          className="form-control"
                          rows="3"
                          placeholder="Share your experience..."
                        />
                      </div>
                      <button type="submit" className="btn btn-primary">
                        Submit Rating
                      </button>
                    </form>
                  </div>
                )}

                {/* Show existing ratings */}
                {(swap.requesterRating?.rating || swap.recipientRating?.rating) && (
                  <div className="card" style={{ marginTop: '15px' }}>
                    <h4>Ratings</h4>
                    {swap.requesterRating?.rating && (
                      <div>
                        <p><strong>{swap.requester.name}'s rating:</strong></p>
                        <div className="rating">
                          {'★'.repeat(swap.requesterRating.rating)}
                          {'☆'.repeat(5 - swap.requesterRating.rating)}
                        </div>
                        {swap.requesterRating.comment && (
                          <p><em>"{swap.requesterRating.comment}"</em></p>
                        )}
                      </div>
                    )}
                    {swap.recipientRating?.rating && (
                      <div>
                        <p><strong>{swap.recipient.name}'s rating:</strong></p>
                        <div className="rating">
                          {'★'.repeat(swap.recipientRating.rating)}
                          {'☆'.repeat(5 - swap.recipientRating.rating)}
                        </div>
                        {swap.recipientRating.comment && (
                          <p><em>"{swap.recipientRating.comment}"</em></p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MySwaps; 
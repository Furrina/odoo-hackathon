import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div>
      <div className="hero">
        <h1>Welcome to Skill Swap</h1>
        <p>Exchange your skills with others and learn something new in return</p>
        {!user ? (
          <div>
            <Link to="/register" className="btn btn-primary" style={{ marginRight: '10px' }}>
              Get Started
            </Link>
            <Link to="/browse" className="btn btn-secondary">
              Browse Users
            </Link>
          </div>
        ) : (
          <div>
            <Link to="/browse" className="btn btn-primary" style={{ marginRight: '10px' }}>
              Find Skills
            </Link>
            <Link to="/profile" className="btn btn-secondary">
              My Profile
            </Link>
          </div>
        )}
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

      {!user && (
        <div className="text-center">
          <h2>Ready to start swapping skills?</h2>
          <p>Join our community and start learning from others while sharing your expertise.</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Create Account
          </Link>
        </div>
      )}

      {user && (
        <div className="text-center">
          <h2>What would you like to do today?</h2>
          <div className="grid grid-3" style={{ marginTop: '30px' }}>
            <Link to="/browse" className="btn btn-primary" style={{ padding: '20px', fontSize: '16px' }}>
              Browse Available Skills
            </Link>
            <Link to="/profile" className="btn btn-secondary" style={{ padding: '20px', fontSize: '16px' }}>
              Update My Profile
            </Link>
            <Link to="/my-swaps" className="btn btn-success" style={{ padding: '20px', fontSize: '16px' }}>
              View My Swaps
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home; 
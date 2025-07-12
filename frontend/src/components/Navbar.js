import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="container flex flex-between">
        <Link to="/" className="navbar-brand">
          Skill Swap
        </Link>
        
        <ul className="navbar-nav">
          <li>
            <Link to="/" className={isActive('/')}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/browse" className={isActive('/browse')}>
              Browse Users
            </Link>
          </li>
          
          {user ? (
            <>
              <li>
                <Link to="/my-swaps" className={isActive('/my-swaps')}>
                  My Swaps
                </Link>
              </li>
              <li>
                <Link to="/profile" className={isActive('/profile')}>
                  Profile
                </Link>
              </li>
              {user.role === 'admin' && (
                <li>
                  <Link to="/admin" className={isActive('/admin')}>
                    Admin
                  </Link>
                </li>
              )}
              <li>
                <button 
                  onClick={logout}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'white', 
                    cursor: 'pointer',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className={isActive('/login')}>
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className={isActive('/register')}>
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar; 
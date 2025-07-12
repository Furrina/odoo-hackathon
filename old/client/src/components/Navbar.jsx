import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { darkMode, toggleDarkMode } = useTheme()

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <span className="text-2xl font-bold bg-gradient-to-r from-gradient-1 to-gradient-2 bg-clip-text text-transparent">
                SkillSwap
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link to="/" className="dark:text-white hover:text-gradient-1">Home</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="dark:text-white hover:text-gradient-1">Profile</Link>
                  <Link to="/swap-request" className="dark:text-white hover:text-gradient-1">Swap Request</Link>
                  <Link to="/requests" className="dark:text-white hover:text-gradient-1">My Requests</Link>
                  <button onClick={handleLogout} className="dark:text-white hover:text-gradient-1">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="dark:text-white hover:text-gradient-1">Login</Link>
                  <Link to="/signup" className="dark:text-white hover:text-gradient-1">Sign Up</Link>
                </>
              )}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
              >
                {darkMode ? '🌞' : '🌙'}
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md dark:text-white"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block dark:text-white hover:text-gradient-1 py-2">Home</Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="block dark:text-white hover:text-gradient-1 py-2">Profile</Link>
                <Link to="/swap-request" className="block dark:text-white hover:text-gradient-1 py-2">Swap Request</Link>
                <Link to="/requests" className="block dark:text-white hover:text-gradient-1 py-2">My Requests</Link>
                <button onClick={handleLogout} className="block w-full text-left dark:text-white hover:text-gradient-1 py-2">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block dark:text-white hover:text-gradient-1 py-2">Login</Link>
                <Link to="/signup" className="block dark:text-white hover:text-gradient-1 py-2">Sign Up</Link>
              </>
            )}
            <button
              onClick={toggleDarkMode}
              className="block w-full text-left py-2 dark:text-white hover:text-gradient-1"
            >
              {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar

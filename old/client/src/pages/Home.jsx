import { useState } from 'react'
import { Link } from 'react-router-dom'

const Home = ({ isAuthenticated }) => {
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data - replace with actual API calls
  const publicProfiles = [
    {
      id: 1,
      name: "John Doe",
      location: "New York",
      rating: 4.5,
      skillsOffered: ["JavaScript", "React", "Node.js"],
      skillsWanted: ["Python", "UI Design"],
      availability: "Weekends"
    },
    // Add more mock profiles...
  ]

  const filteredProfiles = publicProfiles.filter(profile =>
    profile.skillsOffered.some(skill =>
      skill.toLowerCase().includes(searchQuery.toLowerCase())
    ) ||
    profile.skillsWanted.some(skill =>
      skill.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gradient-1 to-gradient-2 bg-clip-text text-transparent mb-4">
          Welcome to SkillSwap
        </h1>
        <p className="text-lg dark:text-gray-300">
          Connect, Learn, and Share Skills with Amazing People
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search by skills..."
          className="w-full p-4 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfiles.map(profile => (
          <div key={profile.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold dark:text-white">{profile.name}</h3>
              <span className="bg-gradient-to-r from-gradient-1 to-gradient-2 text-white px-3 py-1 rounded-full text-sm">
                ⭐ {profile.rating}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">📍 {profile.location}</p>
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gradient-1 mb-2">Skills Offered</h4>
              <div className="flex flex-wrap gap-2">
                {profile.skillsOffered.map(skill => (
                  <span key={skill} className="bg-gradient-1 bg-opacity-10 text-gradient-1 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gradient-2 mb-2">Skills Wanted</h4>
              <div className="flex flex-wrap gap-2">
                {profile.skillsWanted.map(skill => (
                  <span key={skill} className="bg-gradient-2 bg-opacity-10 text-gradient-2 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            {isAuthenticated ? (
              <Link
                to={`/profile/${profile.id}`}
                className="block w-full text-center bg-gradient-to-r from-gradient-1 to-gradient-2 text-white py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                View Profile & Request Swap
              </Link>
            ) : (
              <Link
                to="/login"
                className="block w-full text-center bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-2 rounded-lg"
              >
                Login to Request Swap
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home

import { useState } from 'react'
import Button from '../components/shared/Button'

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    location: 'New York',
    availability: 'Weekends',
    isPublic: true,
    avatar: null,
    rating: 4.5,
    skillsOffered: ['JavaScript', 'React', 'Node.js'],
    skillsWanted: ['Python', 'UI Design']
  })

  const [newSkillOffered, setNewSkillOffered] = useState('')
  const [newSkillWanted, setNewSkillWanted] = useState('')

  const handleAddSkillOffered = () => {
    if (newSkillOffered.trim()) {
      setProfile(prev => ({
        ...prev,
        skillsOffered: [...prev.skillsOffered, newSkillOffered.trim()]
      }))
      setNewSkillOffered('')
    }
  }

  const handleAddSkillWanted = () => {
    if (newSkillWanted.trim()) {
      setProfile(prev => ({
        ...prev,
        skillsWanted: [...prev.skillsWanted, newSkillWanted.trim()]
      }))
      setNewSkillWanted('')
    }
  }

  const handleRemoveSkill = (type, skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      [type]: prev[type].filter(skill => skill !== skillToRemove)
    }))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gradient-1 to-gradient-2 bg-clip-text text-transparent">
            My Profile
          </h2>
          <Button onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Profile Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">Name</label>
              <input
                type="text"
                value={profile.name}
                disabled={!isEditing}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">Location</label>
              <input
                type="text"
                value={profile.location}
                disabled={!isEditing}
                onChange={(e) => setProfile({...profile, location: e.target.value})}
                className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">Availability</label>
              <select
                value={profile.availability}
                disabled={!isEditing}
                onChange={(e) => setProfile({...profile, availability: e.target.value})}
                className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="weekends">Weekends</option>
                <option value="evenings">Evenings</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={profile.isPublic}
                disabled={!isEditing}
                onChange={(e) => setProfile({...profile, isPublic: e.target.checked})}
                className="rounded dark:bg-gray-700"
              />
              <label htmlFor="isPublic" className="text-sm font-medium dark:text-white">
                Public Profile
              </label>
            </div>
          </div>

          {/* Skills Management */}
          <div className="space-y-6">
            {/* Skills Offered */}
            <div>
              <h3 className="text-lg font-semibold text-gradient-1 mb-2">Skills Offered</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {profile.skillsOffered.map(skill => (
                  <span
                    key={skill}
                    className="bg-gradient-1 bg-opacity-10 text-gradient-1 px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {skill}
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveSkill('skillsOffered', skill)}
                        className="ml-2 text-red-500"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {isEditing && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillOffered}
                    onChange={(e) => setNewSkillOffered(e.target.value)}
                    placeholder="Add new skill"
                    className="flex-1 p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <Button onClick={handleAddSkillOffered}>Add</Button>
                </div>
              )}
            </div>

            {/* Skills Wanted */}
            <div>
              <h3 className="text-lg font-semibold text-gradient-2 mb-2">Skills Wanted</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {profile.skillsWanted.map(skill => (
                  <span
                    key={skill}
                    className="bg-gradient-2 bg-opacity-10 text-gradient-2 px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {skill}
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveSkill('skillsWanted', skill)}
                        className="ml-2 text-red-500"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {isEditing && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillWanted}
                    onChange={(e) => setNewSkillWanted(e.target.value)}
                    placeholder="Add new skill"
                    className="flex-1 p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <Button onClick={handleAddSkillWanted}>Add</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile

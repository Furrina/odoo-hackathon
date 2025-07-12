import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '../components/shared/Button'

const PublicProfile = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [requestForm, setRequestForm] = useState({
    offeredSkill: '',
    message: ''
  })

  // Mock data - replace with API call
  useEffect(() => {
    // Simulate API fetch
    setProfile({
      id: userId,
      name: "Jane Smith",
      location: "San Francisco",
      availability: "Evenings",
      rating: 4.8,
      totalSwaps: 15,
      skillsOffered: ["Python", "Data Science", "Machine Learning"],
      skillsWanted: ["React", "JavaScript", "UI Design"],
      reviews: [
        { id: 1, rating: 5, comment: "Great teacher, very patient!", author: "John D." },
        { id: 2, rating: 4.5, comment: "Very knowledgeable", author: "Sarah M." }
      ]
    })
  }, [userId])

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gradient-1">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gradient-1 to-gradient-2 bg-clip-text text-transparent">
              {profile.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              📍 {profile.location} • 🕒 Available: {profile.availability}
            </p>
          </div>
          <div className="text-right">
            <div className="bg-gradient-to-r from-gradient-1 to-gradient-2 text-white px-4 py-2 rounded-full">
              ⭐ {profile.rating} ({profile.totalSwaps} swaps)
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-gradient-1 mb-3">Skills Offered</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skillsOffered.map(skill => (
                <span key={skill} className="bg-gradient-1 bg-opacity-10 text-gradient-1 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gradient-2 mb-3">Skills Wanted</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skillsWanted.map(skill => (
                <span key={skill} className="bg-gradient-2 bg-opacity-10 text-gradient-2 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold dark:text-white mb-4">Reviews</h3>
          <div className="space-y-4">
            {profile.reviews.map(review => (
              <div key={review.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium dark:text-white">{review.author}</span>
                  <span className="text-yellow-500">{"⭐".repeat(Math.floor(review.rating))}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Request Swap Button */}
        <Button
          onClick={() => setIsRequestModalOpen(true)}
          className="w-full"
        >
          Request Skill Swap
        </Button>
      </div>

      {/* Request Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gradient-1 mb-4">Request Skill Swap</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              // Add request creation logic here
              setIsRequestModalOpen(false)
              navigate('/requests')
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium dark:text-white mb-2">
                    Select Skill to Offer
                  </label>
                  <select
                    className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={requestForm.offeredSkill}
                    onChange={(e) => setRequestForm({...requestForm, offeredSkill: e.target.value})}
                    required
                  >
                    <option value="">Choose a skill</option>
                    {profile.skillsWanted.map(skill => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-white mb-2">
                    Message
                  </label>
                  <textarea
                    className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[100px]"
                    value={requestForm.message}
                    onChange={(e) => setRequestForm({...requestForm, message: e.target.value})}
                    placeholder="Introduce yourself and explain what you'd like to learn..."
                    required
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-1/2"
                  onClick={() => setIsRequestModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-1/2">
                  Send Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PublicProfile

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/shared/Button'

const SwapRequest = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    offeredSkill: '',
    wantedSkill: '',
    message: ''
  })

  // Mock data - replace with API call to get user's skills
  const mySkills = {
    offered: ['JavaScript', 'React', 'Node.js'],
    wanted: ['Python', 'UI Design', 'DevOps']
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Add swap request creation logic here
    console.log('Swap request created:', formData)
    navigate('/requests')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-gradient-1 to-gradient-2 bg-clip-text text-transparent">
          Create Swap Request
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium dark:text-white mb-2">
              Select Skill to Offer
            </label>
            <select
              className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.offeredSkill}
              onChange={(e) => setFormData({...formData, offeredSkill: e.target.value})}
              required
            >
              <option value="">Choose a skill to offer</option>
              {mySkills.offered.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium dark:text-white mb-2">
              Select Skill You Want
            </label>
            <select
              className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.wantedSkill}
              onChange={(e) => setFormData({...formData, wantedSkill: e.target.value})}
              required
            >
              <option value="">Choose a skill you want</option>
              {mySkills.wanted.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium dark:text-white mb-2">
              Additional Message
            </label>
            <textarea
              className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[120px]"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              placeholder="Add any additional details or preferences..."
              required
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              className="w-1/2"
              onClick={() => navigate(-1)}
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
  )
}

export default SwapRequest

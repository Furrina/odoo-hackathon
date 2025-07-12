import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/shared/Button'

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    availability: '',
    isPublic: true
  })
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    // Add signup logic here
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-[480px]">
        <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-gradient-1 to-gradient-2 bg-clip-text text-transparent">
          Create Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium dark:text-white">Name</label>
              <input
                type="text"
                className="mt-1 w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-white">Email</label>
              <input
                type="email"
                className="mt-1 w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-white">Password</label>
              <input
                type="password"
                className="mt-1 w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-white">Location (Optional)</label>
              <input
                type="text"
                className="mt-1 w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-white">Availability</label>
              <select
                className="mt-1 w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={formData.availability}
                onChange={(e) => setFormData({...formData, availability: e.target.value})}
                required
              >
                <option value="">Select availability</option>
                <option value="weekends">Weekends</option>
                <option value="evenings">Evenings</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                className="rounded dark:bg-gray-700"
              />
              <label htmlFor="isPublic" className="text-sm font-medium dark:text-white">
                Make profile public
              </label>
            </div>
          </div>
          <Button type="submit" className="w-full mt-6">Sign Up</Button>
        </form>
        <p className="mt-4 text-center dark:text-white">
          Already have an account? {' '}
          <Link to="/login" className="text-gradient-1 hover:text-gradient-2">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default Signup

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/shared/Button'

const Login = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    // Add login logic here
    setIsAuthenticated(true)
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-gradient-1 to-gradient-2 bg-clip-text text-transparent">
          Welcome Back
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
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
          <Button type="submit" className="w-full">Login</Button>
        </form>
        <p className="mt-4 text-center dark:text-white">
          Don't have an account? {' '}
          <Link to="/signup" className="text-gradient-1 hover:text-gradient-2">Sign up</Link>
        </p>
      </div>
    </div>
  )
}

export default Login

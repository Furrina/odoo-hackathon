import { useState } from 'react'
import Button from '../components/shared/Button'

const RequestsManager = () => {
  const [activeTab, setActiveTab] = useState('received')

  // Mock data - replace with API calls
  const mockRequests = {
    received: [
      {
        id: 1,
        from: 'Jane Smith',
        skillOffered: 'Python',
        skillWanted: 'React',
        status: 'pending',
        message: 'I would love to learn React from you!',
        rating: 4.8
      },
      {
        id: 2,
        from: 'Mike Johnson',
        skillOffered: 'UI Design',
        skillWanted: 'JavaScript',
        status: 'accepted',
        message: 'Looking forward to our skill exchange!',
        rating: 4.5
      }
    ],
    sent: [
      {
        id: 3,
        to: 'Alex Brown',
        skillOffered: 'Node.js',
        skillWanted: 'DevOps',
        status: 'pending',
        message: 'Would love to learn DevOps from you.',
      }
    ]
  }

  const getStatusBadgeClass = (status) => {
    const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium'
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`
      case 'accepted':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`
      default:
        return baseClasses
    }
  }

  const handleAction = (requestId, action) => {
    console.log(`Request ${requestId} ${action}`)
    // Add request action logic here
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-gradient-1 to-gradient-2 bg-clip-text text-transparent">
        Swap Requests
      </h2>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'received'
              ? 'bg-gradient-to-r from-gradient-1 to-gradient-2 text-white'
              : 'text-gray-600 dark:text-gray-300'
          }`}
          onClick={() => setActiveTab('received')}
        >
          Received Requests
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'sent'
              ? 'bg-gradient-to-r from-gradient-1 to-gradient-2 text-white'
              : 'text-gray-600 dark:text-gray-300'
          }`}
          onClick={() => setActiveTab('sent')}
        >
          Sent Requests
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {mockRequests[activeTab].map(request => (
          <div key={request.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold dark:text-white mb-2">
                  {activeTab === 'received' ? `From: ${request.from}` : `To: ${request.to}`}
                </h3>
                {request.rating && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ⭐ {request.rating}
                  </span>
                )}
              </div>
              <span className={getStatusBadgeClass(request.status)}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-gradient-1">Skill Offered</p>
                <p className="dark:text-white">{request.skillOffered}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gradient-2">Skill Wanted</p>
                <p className="dark:text-white">{request.skillWanted}</p>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-4">{request.message}</p>

            {activeTab === 'received' && request.status === 'pending' && (
              <div className="flex space-x-4">
                <Button
                  onClick={() => handleAction(request.id, 'accept')}
                  className="w-1/2"
                >
                  Accept
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleAction(request.id, 'reject')}
                  className="w-1/2"
                >
                  Reject
                </Button>
              </div>
            )}

            {activeTab === 'sent' && request.status === 'pending' && (
              <Button
                variant="secondary"
                onClick={() => handleAction(request.id, 'cancel')}
                className="w-full"
              >
                Cancel Request
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default RequestsManager

import { RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

export default function Header() {
  const queryClient = useQueryClient()

  const handleRefresh = () => {
    queryClient.invalidateQueries()
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-primary-700">
            IT Dashboard
          </h1>
          <span className="text-sm text-gray-500">Action & Success</span>
        </div>
        <button
          onClick={handleRefresh}
          className="btn btn-secondary flex items-center space-x-2"
          title="Refresh data"
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>
    </header>
  )
}

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to the first puzzle (index 0)
    navigate('/0', { replace: true })
  }, [navigate])

  return (
    <div className="h-dvh w-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-zinc-600">Loading puzzle...</p>
      </div>
    </div>
  )
}

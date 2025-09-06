import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to the levels page
    navigate('/levels', { replace: true })
  }, [navigate])

  return (
    <div className="h-dvh w-screen flex items-center justify-center p-4 bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted">Loading...</p>
      </div>
    </div>
  )
}

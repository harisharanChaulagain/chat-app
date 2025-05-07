import { useEffect, useState } from 'react'

export default function useUserInteracted(): boolean {
  const [interacted, setInteracted] = useState(false)

  useEffect(() => {
    const handleInteraction = () => {
      setInteracted(true)
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('keydown', handleInteraction)
    }

    document.addEventListener('click', handleInteraction)
    document.addEventListener('keydown', handleInteraction)

    return () => {
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('keydown', handleInteraction)
    }
  }, [])

  return interacted
}

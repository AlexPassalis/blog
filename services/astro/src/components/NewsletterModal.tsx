import { useEffect, useState } from 'react'

export function NewsletterModal() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  console.info(isModalOpen)
  useEffect(() => {
    const timer = setTimeout(() => setIsModalOpen(true), 10000) // 10 sec
    return () => clearTimeout(timer)
  }, [])

  return <h1>Hello from modal</h1>
}

'use client'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import KarimChat from './KarimChat'

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname.startsWith('/dashboard')

  if (isDashboard) return <>{children}</>

  return (
    <>
      <Navbar />
      {children}
      <KarimChat />
    </>
  )
}

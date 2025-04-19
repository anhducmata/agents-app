"use client"

import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in")
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
} 
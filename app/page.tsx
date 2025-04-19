"use client"

import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import React from "react"

export default function Home() {
  const { isSignedIn } = useAuth()
  const router = useRouter()

  const handleGoToBuild = () => {
    if (isSignedIn) {
      router.push("/dashboard")
    } else {
      router.push("/sign-in")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Voice Assistant Dashboard
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Build and manage your voice assistant with powerful tools and analytics
          </p>
          <div className="space-y-4">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
              onClick={handleGoToBuild}
            >
              Go to Build
            </Button>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Powerful Tools</h3>
              <p className="text-gray-600">
                Access a suite of tools to build and customize your voice assistant
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Analytics</h3>
              <p className="text-gray-600">
                Track performance and get insights into your assistant's usage
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Easy Integration</h3>
              <p className="text-gray-600">
                Seamlessly integrate with your existing systems and workflows
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
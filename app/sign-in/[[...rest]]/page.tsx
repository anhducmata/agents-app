import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Voice Assistant Dashboard</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg rounded-lg border border-gray-200",
              headerTitle: "text-xl font-semibold text-center",
              headerSubtitle: "text-center",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  )
} 
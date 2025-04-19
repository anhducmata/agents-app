import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Voice Assistant Dashboard</h1>
          <p className="mt-2 text-gray-600">Create your account</p>
        </div>
        <SignUp
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
          path="/sign-up"
          signInUrl="/sign-in"
          redirectUrl="/"
        />
      </div>
    </div>
  )
}

// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Create a matcher for public routes
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/forgot-password(.*)",
  "/sso-callback(.*)",
  "/api/webhook(.*)",
  "/api/clerk(.*)",
  "/_next(.*)",
  "/favicon.ico",
  "/assets(.*)",
])

export default clerkMiddleware((auth, req) => {
  // Allow access to public routes
  if (isPublicRoute(req)) {
    return
  }

  // Protect all other routes
  auth.protect()
})

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
    "/(_next|_static|_vercel|[\\w-]+\\.\\w+)(.*)"
  ],
}


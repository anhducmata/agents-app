// middleware.ts
import { clerkMiddleware, getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const customMiddleware = (auth: ReturnType<typeof getAuth>, req: NextRequest) => {
  const { userId } = auth
  const path = req.nextUrl.pathname

  const publicRoutes = ["/sign-in", "/sign-up"]

  if (publicRoutes.includes(path)) {
    if (userId) {
      return NextResponse.redirect(new URL("/", req.url))
    }
    return NextResponse.next()
  }

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url))
  }

  return NextResponse.next()
}

export default clerkMiddleware(customMiddleware)

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}

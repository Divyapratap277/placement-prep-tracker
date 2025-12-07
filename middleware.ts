import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",   // redirect unauthorized users here
  },
})

export const config = {
  matcher: ["/dashboard/:path*", "/companies/:path*", "/tasks/:path*"],
}


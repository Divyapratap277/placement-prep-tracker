import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: { signIn: "/auth/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email" },
        password: { label: "Password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })
        if (!user) return null
        const ok = await bcrypt.compare(credentials.password as string, user.password)
        if (!ok) return null
        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
})

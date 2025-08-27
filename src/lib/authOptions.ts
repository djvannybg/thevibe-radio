import type { NextAuthOptions, User } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        const email = credentials?.email?.toString().trim()
        const password = credentials?.password?.toString() ?? ""
        if (!email || !password) return null

        // ✅ без generic; подаваме where + select
        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, password: true, role: true },
        })
        if (!user) return null

        const ok = await bcrypt.compare(password, user.password)
        if (!ok) return null

        // Благодарение на тип аугментацията: връщаме валиден User
        return { id: user.id, email: user.email, role: user.role }
      },
    }),
  ],
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? ""
        session.user.role = token.role ?? ""
        // email вече е вътре от NextAuth; ако искаш да подсигуриш:
        if (!session.user.email && typeof token.email === "string") {
          session.user.email = token.email
        }
      }
      return session
    },
  },
}

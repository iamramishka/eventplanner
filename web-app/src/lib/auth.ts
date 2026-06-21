import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { dbSelect } from "./supabase-db"
import bcrypt from "bcrypt"
import type { Role } from "@prisma/client"

interface DbUser {
  id: string;
  email: string;
  name: string | null;
  password: string | null;
  role: string;
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const rows = await dbSelect<DbUser>(
          'User',
          { 'email': `eq.${credentials.email}` },
          'id,email,name,password,role',
          1,
        );
        const user = rows[0];
        if (!user || !user.password) return null;

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) return null;

        return { id: user.id, email: user.email, name: user.name ?? '', role: user.role as Role };
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = String(token.id || "")
        if (token.role) session.user.role = token.role
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    }
  }
}

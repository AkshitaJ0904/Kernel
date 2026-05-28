import type { NextAuthOptions } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
import axios from 'axios'

// Server-side (authorize/refresh) must reach the backend over the internal
// Docker network; the browser-facing NEXT_PUBLIC_API_URL points at localhost.
const API_URL =
  process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const res = await axios.post(`${API_URL}/api/v1/auth/token/refresh/`, {
      refresh: token.refreshToken,
    })
    return {
      ...token,
      accessToken: res.data.access,
      refreshToken: res.data.refresh ?? token.refreshToken,
      accessTokenExpires: Date.now() + 55 * 60 * 1000,
    }
  } catch {
    return { ...token, error: 'RefreshAccessTokenError' }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'email', type: 'email' },
        password: { label: 'password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          const res = await axios.post(`${API_URL}/api/v1/auth/login/`, {
            email: credentials.email,
            password: credentials.password,
          })
          const { user, access, refresh } = res.data
          return { ...user, accessToken: access, refreshToken: refresh }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = ((user as unknown) as Record<string, unknown>).accessToken as string
        token.refreshToken = ((user as unknown) as Record<string, unknown>).refreshToken as string
        token.accessTokenExpires = Date.now() + 55 * 60 * 1000
        token.user = user
        return token
      }
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token
      }
      return refreshAccessToken(token)
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.user = token.user as typeof session.user
      if (token.error) {
        ((session as unknown) as Record<string, unknown>).error = token.error
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
}

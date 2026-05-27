import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    accessToken: string
    user: {
      id: number
      username: string
      email: string
      college: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string
    refreshToken: string
    accessTokenExpires: number
    user: unknown
    error?: string
  }
}

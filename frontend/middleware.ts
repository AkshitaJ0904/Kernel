export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/arena/:path*',
    '/workshop/:path*',
    '/warroom/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/activity/:path*',
    '/roadmap/:path*',
  ],
}

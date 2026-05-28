import axios from 'axios'
import { getSession } from 'next-auth/react'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
})

api.interceptors.request.use(async (config) => {
  const session = await getSession()
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      // let next-auth handle token refresh
    }
    return Promise.reject(error)
  }
)

export default api

export const endpoints = {
  auth: {
    login: '/api/v1/auth/login/',
    register: '/api/v1/auth/register/',
    logout: '/api/v1/auth/logout/',
    refresh: '/api/v1/auth/token/refresh/',
    me: '/api/v1/auth/me/',
  },
  dashboard: '/api/v1/dashboard/',
  publicStats: '/api/v1/public/stats/',
  activity: '/api/v1/activity/',
  notifications: '/api/v1/notifications/',
  notificationsReadAll: '/api/v1/notifications/read-all/',
  notificationRead: (pk: number) => `/api/v1/notifications/${pk}/read/`,
  arena: {
    problems: '/api/v1/arena/problems/',
    patterns: '/api/v1/arena/patterns/',
    daily: '/api/v1/arena/daily/',
    contests: '/api/v1/arena/contests/',
    problem: (slug: string) => `/api/v1/arena/problems/${slug}/`,
    submit: (slug: string) => `/api/v1/arena/problems/${slug}/submit/`,
    joinContest: (slug: string) => `/api/v1/arena/contests/${slug}/join/`,
  },
  workshop: {
    tracks: '/api/v1/workshop/tracks/',
    track: (name: string) => `/api/v1/workshop/tracks/${name}/`,
    modules: (name: string) => `/api/v1/workshop/tracks/${name}/modules/`,
    module: (name: string, slug: string) => `/api/v1/workshop/tracks/${name}/modules/${slug}/`,
    progress: '/api/v1/workshop/progress/',
  },
  warroom: {
    programs: '/api/v1/warroom/programs/',
    program: (name: string) => `/api/v1/warroom/programs/${name}/`,
    contest: (name: string) => `/api/v1/warroom/contests/${name}/`,
    video: (name: string, topic: string, video: string) =>
      `/api/v1/warroom/contests/${name}/videos/${topic}/${video}/`,
    videoProgress: (pk: number) => `/api/v1/warroom/videos/${pk}/progress/`,
    videoNotes: (pk: number) => `/api/v1/warroom/videos/${pk}/notes/`,
    videoNote: (pk: number) => `/api/v1/warroom/notes/${pk}/`,
    orgs: '/api/v1/warroom/orgs/',
    tracking: '/api/v1/warroom/tracking/',
    proposals: '/api/v1/warroom/proposals/',
    proposal: (pk: number) => `/api/v1/warroom/proposals/${pk}/`,
    roadmap: '/api/v1/warroom/roadmap/',
  },
} as const

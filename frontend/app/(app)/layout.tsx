import Sidebar from '@/components/layout/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {children}
      </main>
    </div>
  )
}

import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import AdminSidebar from './AdminSidebar'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[#F9FAFB]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col">
        <AdminSidebar />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 w-60 md:hidden transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center gap-3 h-14 px-4 bg-white border-b border-[#E5E7EB] shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 text-[#6B7280] hover:text-[#111827] transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-[#111827] tracking-tight">
            Mini<span className="text-[#F9A8C9]">Moda</span>
            <span className="ml-1.5 text-xs font-medium text-[#9CA3AF]">Admin</span>
          </span>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

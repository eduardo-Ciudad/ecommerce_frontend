import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, Tag, ShoppingBag, ArrowLeft, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/products', label: 'Produtos', icon: Package, exact: false },
  { to: '/admin/categories', label: 'Categorias', icon: Tag, exact: false },
  { to: '/admin/orders', label: 'Pedidos', icon: ShoppingBag, exact: false },
]

export default function AdminSidebar({ onClose }) {
  const { pathname } = useLocation()

  const isActive = (to, exact) => {
    if (exact) return pathname === to
    return pathname === to || pathname.startsWith(to + '/')
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-[#E5E7EB]">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-[#E5E7EB] shrink-0">
        <span className="text-sm font-semibold text-[#111827] tracking-tight">
          Mini<span className="text-[#F9A8C9]">Moda</span>
          <span className="ml-1.5 text-xs font-medium text-[#9CA3AF]">Admin</span>
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-[#9CA3AF] hover:text-[#111827] transition-colors md:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, exact }) => {
          const active = isActive(to, exact)
          return (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-[#FDF2F8] text-[#F9A8C9]'
                  : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-[#E5E7EB] shrink-0">
        <Link
          to="/"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Voltar à loja
        </Link>
      </div>
    </div>
  )
}

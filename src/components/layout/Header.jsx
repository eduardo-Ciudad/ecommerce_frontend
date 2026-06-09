import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Menu, X, User, ChevronDown } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E5E7EB] bg-white/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-xl font-semibold text-[#111827] tracking-tight">
              Mini<span className="text-[#F9A8C9]">Moda</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors">
              Início
            </Link>
            <Link to="/products" className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors">
              Produtos
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Cart icon */}
            <Link to="/cart" className="relative p-2 text-[#6B7280] hover:text-[#111827] transition-colors">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#F9A8C9] text-[10px] font-semibold text-[#111827]">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* Auth buttons */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden md:flex items-center gap-1.5 text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors focus:outline-none">
                    <User className="h-4 w-4" />
                    <span className="max-w-[120px] truncate">{user?.name || user?.email}</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/orders">Meus pedidos</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:bg-red-50 focus:bg-red-50">
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Cadastrar</Link>
                </Button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-[#6B7280] hover:text-[#111827] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#E5E7EB] py-4 flex flex-col gap-2">
            <Link
              to="/"
              className="px-2 py-2 text-sm font-medium text-[#6B7280] hover:text-[#111827]"
              onClick={() => setMobileOpen(false)}
            >
              Início
            </Link>
            <Link
              to="/products"
              className="px-2 py-2 text-sm font-medium text-[#6B7280] hover:text-[#111827]"
              onClick={() => setMobileOpen(false)}
            >
              Produtos
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/orders"
                  className="px-2 py-2 text-sm font-medium text-[#6B7280] hover:text-[#111827]"
                  onClick={() => setMobileOpen(false)}
                >
                  Meus pedidos
                </Link>
                <button
                  className="px-2 py-2 text-sm font-medium text-red-600 text-left"
                  onClick={() => { handleLogout(); setMobileOpen(false) }}
                >
                  Sair
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link to="/login" onClick={() => setMobileOpen(false)}>Entrar</Link>
                </Button>
                <Button size="sm" asChild className="flex-1">
                  <Link to="/register" onClick={() => setMobileOpen(false)}>Cadastrar</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

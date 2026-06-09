import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-[#E5E7EB] bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <span className="text-lg font-semibold text-[#111827]">
              Mini<span className="text-[#F9A8C9]">Moda</span>
            </span>
            <p className="mt-2 text-sm text-[#6B7280] max-w-xs">
              Moda infantil com estilo, qualidade e conforto para os pequenos.
            </p>
          </div>
          <nav className="flex flex-col sm:flex-row gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-[#111827] uppercase tracking-wide">Loja</span>
              <Link to="/products" className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors">Produtos</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-[#111827] uppercase tracking-wide">Conta</span>
              <Link to="/orders" className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors">Meus pedidos</Link>
              <Link to="/login" className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors">Entrar</Link>
            </div>
          </nav>
        </div>
        <div className="mt-10 pt-6 border-t border-[#E5E7EB]">
          <p className="text-xs text-[#9CA3AF] text-center">
            © {new Date().getFullYear()} MiniModa. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

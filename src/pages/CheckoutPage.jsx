import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { orderService } from '@/services/orderService'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import ErrorMessage from '@/components/common/ErrorMessage'
import { formatCurrency } from '@/utils/formatCurrency'

export default function CheckoutPage() {
  const { cart, clearCart } = useCart()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const items = cart?.items || []
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleConfirm = async () => {
    setError('')
    setIsLoading(true)
    try {
      await orderService.createOrder()
      clearCart()
      navigate('/orders', { state: { success: true } })
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Erro ao criar pedido. Tente novamente.'
      setError(typeof msg === 'string' ? msg : 'Erro ao criar pedido. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <p className="text-[#6B7280]">Nenhum item no carrinho.</p>
          <Button asChild>
            <Link to="/products">Ver produtos</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-semibold text-[#111827] mb-8">Finalizar compra</h1>

      {/* Items summary */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-sm font-semibold text-[#111827] uppercase tracking-wide">Itens do pedido</h2>
        </div>
        <ul className="divide-y divide-[#E5E7EB]">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 px-6 py-4">
              <div className="h-12 w-10 rounded-lg bg-[#F9FAFB] shrink-0 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-[#D1D5DB]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#111827] line-clamp-1">{item.productName}</p>
                <p className="text-xs text-[#6B7280]">Tam. {item.size} · Qtd. {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-[#111827] shrink-0">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
        <div className="px-6 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
          <div className="flex justify-between font-semibold text-[#111827]">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} className="mb-6" />}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" asChild className="flex-1">
          <Link to="/cart">Voltar ao carrinho</Link>
        </Button>
        <Button className="flex-1" size="lg" onClick={handleConfirm} disabled={isLoading}>
          {isLoading ? 'Processando...' : 'Confirmar pedido'}
        </Button>
      </div>
    </div>
  )
}

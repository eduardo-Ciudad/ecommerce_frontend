import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import { formatCurrency } from '@/utils/formatCurrency'

export default function CartPage() {
  const { cart, isLoading, removeFromCart, updateQuantity } = useCart()
  const navigate = useNavigate()
  const [removingId, setRemovingId] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [error, setError] = useState('')

  const items = cart?.items || []
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleRemove = async (itemId) => {
    setError('')
    setRemovingId(itemId)
    try {
      await removeFromCart(itemId)
    } catch {
      setError('Não foi possível remover o item.')
    } finally {
      setRemovingId(null)
    }
  }

  const handleUpdate = async (item, delta) => {
    const newQty = item.quantity + delta
    if (newQty < 1) return
    setError('')
    setUpdatingId(item.id)
    try {
      await updateQuantity(item.id, item.variantId, newQty)
    } catch {
      setError('Não foi possível atualizar a quantidade.')
    } finally {
      setUpdatingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LoadingSpinner className="py-20" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-semibold text-[#111827] mb-8">Carrinho</h1>

      {error && <ErrorMessage message={error} className="mb-6" />}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
          <div className="h-20 w-20 rounded-full bg-[#F9FAFB] flex items-center justify-center">
            <ShoppingBag className="h-10 w-10 text-[#D1D5DB]" />
          </div>
          <div>
            <p className="text-lg font-medium text-[#111827]">Seu carrinho está vazio</p>
            <p className="text-sm text-[#6B7280] mt-1">Explore nossa coleção e adicione produtos</p>
          </div>
          <Button asChild>
            <Link to="/products">Ver produtos</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 rounded-xl border border-[#E5E7EB] bg-white"
              >
                <div className="h-24 w-18 rounded-lg bg-[#F9FAFB] shrink-0 flex items-center justify-center" style={{ width: '72px' }}>
                  <ShoppingBag className="h-6 w-6 text-[#D1D5DB]" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#111827] line-clamp-1">{item.productName}</p>
                  <p className="text-sm text-[#6B7280] mt-0.5">Tamanho: {item.size}</p>
                  <p className="text-sm font-medium text-[#111827] mt-1">{formatCurrency(item.price)}</p>

                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-[#E5E7EB] rounded-lg overflow-hidden">
                      <button
                        className="h-8 w-8 flex items-center justify-center hover:bg-[#F9FAFB] transition-colors disabled:opacity-40"
                        onClick={() => handleUpdate(item, -1)}
                        disabled={item.quantity <= 1 || updatingId === item.id}
                        aria-label="Diminuir"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="h-8 w-8 flex items-center justify-center text-sm font-medium border-x border-[#E5E7EB]">
                        {updatingId === item.id ? '…' : item.quantity}
                      </span>
                      <button
                        className="h-8 w-8 flex items-center justify-center hover:bg-[#F9FAFB] transition-colors disabled:opacity-40"
                        onClick={() => handleUpdate(item, 1)}
                        disabled={updatingId === item.id}
                        aria-label="Aumentar"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <button
                      className="p-1.5 text-[#9CA3AF] hover:text-red-500 transition-colors disabled:opacity-40"
                      onClick={() => handleRemove(item.id)}
                      disabled={removingId === item.id}
                      aria-label="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-semibold text-[#111827]">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-[#111827] mb-4">Resumo do pedido</h2>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between text-[#6B7280]">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="h-px bg-[#E5E7EB] my-1" />
                <div className="flex justify-between font-semibold text-[#111827] text-base">
                  <span>Total</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
              </div>
              <Button className="w-full mt-6" size="lg" onClick={() => navigate('/checkout')}>
                Finalizar compra
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

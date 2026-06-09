import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/utils/formatCurrency'

export default function CartDrawer({ trigger }) {
  const { cart, itemCount } = useCart()
  const { isAuthenticated } = useAuth()

  const total = cart?.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Carrinho ({itemCount})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto mt-6">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <p className="text-sm text-[#6B7280]">Faça login para ver seu carrinho</p>
              <Button asChild size="sm">
                <Link to="/login">Entrar</Link>
              </Button>
            </div>
          ) : !cart?.items?.length ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag className="h-12 w-12 text-[#D1D5DB]" />
              <p className="text-sm text-[#6B7280]">Seu carrinho está vazio</p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/products">Ver produtos</Link>
              </Button>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {cart.items.map((item) => (
                <li key={item.id} className="flex gap-3 pb-4 border-b border-[#E5E7EB] last:border-0">
                  <div className="h-16 w-12 rounded-lg bg-[#F9FAFB] shrink-0 flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-[#D1D5DB]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111827] line-clamp-1">{item.productName}</p>
                    <p className="text-xs text-[#6B7280]">Tam. {item.size} · Qtd. {item.quantity}</p>
                    <p className="text-sm font-semibold text-[#111827] mt-1">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {isAuthenticated && cart?.items?.length > 0 && (
          <div className="border-t border-[#E5E7EB] pt-4 mt-4 flex flex-col gap-3">
            <div className="flex justify-between text-sm font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <Button asChild className="w-full">
              <Link to="/checkout">Finalizar compra</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/cart">Ver carrinho</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

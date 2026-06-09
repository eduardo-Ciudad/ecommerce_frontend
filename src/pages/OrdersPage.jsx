import { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, Package } from 'lucide-react'
import { orderService } from '@/services/orderService'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'

const STATUS_CONFIG = {
  PENDING: { label: 'Pendente', variant: 'warning' },
  PAID: { label: 'Pago', variant: 'info' },
  SHIPPED: { label: 'Enviado', variant: 'purple' },
  DELIVERED: { label: 'Entregue', variant: 'success' },
  CANCELLED: { label: 'Cancelado', variant: 'destructive' },
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false)
  const status = STATUS_CONFIG[order.status] || { label: order.status, variant: 'secondary' }
  const shortId = order.id.slice(-8).toUpperCase()

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#F9FAFB] transition-colors text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-10 w-10 rounded-full bg-[#F9FAFB] items-center justify-center shrink-0">
            <Package className="h-5 w-5 text-[#9CA3AF]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#111827]">Pedido #{shortId}</p>
            <p className="text-xs text-[#6B7280] mt-0.5">{formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={status.variant}>{status.label}</Badge>
          <span className="text-sm font-semibold text-[#111827] hidden sm:block">{formatCurrency(order.total)}</span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-[#9CA3AF]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#9CA3AF]" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[#E5E7EB]">
          <ul className="divide-y divide-[#F3F4F6]">
            {order.items?.map((item) => (
              <li key={item.id} className="flex justify-between items-center px-6 py-3 text-sm">
                <div>
                  <p className="font-medium text-[#111827]">{item.productName}</p>
                  <p className="text-xs text-[#6B7280]">Tam. {item.size} · Qtd. {item.quantity}</p>
                </div>
                <p className="font-medium text-[#111827] shrink-0 ml-4">
                  {formatCurrency(item.unitPrice * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-center px-6 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
            <span className="text-sm font-semibold text-[#111827]">Total</span>
            <span className="text-sm font-semibold text-[#111827]">{formatCurrency(order.total)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function OrdersPage() {
  const location = useLocation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const successMessage = location.state?.success

  useEffect(() => {
    orderService.getOrders()
      .then(setOrders)
      .catch(() => setError('Não foi possível carregar seus pedidos.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-semibold text-[#111827] mb-8">Meus pedidos</h1>

      {successMessage && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-medium">
          ✓ Pedido realizado com sucesso!
        </div>
      )}

      {error && <ErrorMessage message={error} className="mb-6" />}

      {loading ? (
        <LoadingSpinner className="py-20" />
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
          <div className="h-20 w-20 rounded-full bg-[#F9FAFB] flex items-center justify-center">
            <Package className="h-10 w-10 text-[#D1D5DB]" />
          </div>
          <div>
            <p className="text-lg font-medium text-[#111827]">Nenhum pedido ainda</p>
            <p className="text-sm text-[#6B7280] mt-1">Explore nossa coleção e faça seu primeiro pedido</p>
          </div>
          <Button asChild>
            <Link to="/products">Ver produtos</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}

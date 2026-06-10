import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { adminOrderService } from '@/services/adminOrderService'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import ErrorMessage from '@/components/common/ErrorMessage'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'

const STATUS_CONFIG = {
  PENDING:   { label: 'Pendente',  variant: 'warning'     },
  PAID:      { label: 'Pago',      variant: 'info'        },
  SHIPPED:   { label: 'Enviado',   variant: 'purple'      },
  DELIVERED: { label: 'Entregue',  variant: 'success'     },
  CANCELLED: { label: 'Cancelado', variant: 'destructive' },
}

const STATUS_TRANSITIONS = {
  PENDING:   ['PAID', 'CANCELLED'],
  PAID:      ['SHIPPED', 'CANCELLED'],
  SHIPPED:   ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

function OrderRow({ order }) {
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus] = useState(order.status)
  const [isUpdating, setIsUpdating] = useState(false)
  const [rowError, setRowError] = useState('')

  const shortId = order.id.slice(-8).toUpperCase()
  const statusCfg = STATUS_CONFIG[status] || { label: status, variant: 'secondary' }
  const transitions = STATUS_TRANSITIONS[status] || []

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value
    if (!newStatus) return
    setRowError('')
    setIsUpdating(true)
    try {
      await adminOrderService.updateStatus(order.id, newStatus)
      setStatus(newStatus)
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Erro ao atualizar status'
      setRowError(typeof msg === 'string' ? msg : 'Erro ao atualizar status')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <tr className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB]/50 transition-colors">
        {/* Order ID + expand */}
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpanded(v => !v)}
              className="text-[#9CA3AF] hover:text-[#111827] transition-colors"
              aria-label={expanded ? 'Recolher itens' : 'Ver itens'}
            >
              {expanded
                ? <ChevronUp className="h-3.5 w-3.5" />
                : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            <span className="font-mono text-sm font-medium text-[#111827]">#{shortId}</span>
          </div>
        </td>

        <td className="px-5 py-3.5 text-sm text-[#6B7280] hidden sm:table-cell">
          {formatDate(order.createdAt)}
        </td>

        <td className="px-5 py-3.5 text-sm font-medium text-[#111827] hidden md:table-cell">
          {formatCurrency(order.total)}
        </td>

        <td className="px-5 py-3.5">
          <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
        </td>

        <td className="px-5 py-3.5">
          {transitions.length > 0 ? (
            <select
              value=""
              onChange={handleStatusChange}
              disabled={isUpdating}
              className={[
                'text-xs rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1.5',
                'text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#F9A8C9]',
                'cursor-pointer transition-colors disabled:opacity-50',
              ].join(' ')}
              aria-label="Alterar status"
            >
              <option value="" disabled>
                {isUpdating ? 'Atualizando...' : 'Alterar...'}
              </option>
              {transitions.map(s => (
                <option key={s} value={s}>
                  → {STATUS_CONFIG[s]?.label ?? s}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-[#D1D5DB]">—</span>
          )}
        </td>
      </tr>

      {/* Error row */}
      {rowError && (
        <tr className="border-b border-[#E5E7EB]">
          <td colSpan={5} className="px-5 py-2">
            <p className="text-xs text-red-600">{rowError}</p>
          </td>
        </tr>
      )}

      {/* Expanded items */}
      {expanded && (
        <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
          <td colSpan={5} className="px-5 py-3">
            {order.items?.length ? (
              <ul className="flex flex-col gap-1.5">
                {order.items.map(item => (
                  <li key={item.id} className="flex items-center justify-between text-xs text-[#6B7280]">
                    <span>
                      <span className="font-medium text-[#111827]">{item.productName}</span>
                      {' · '}Tam. {item.size}
                      {' · '}Qtd. {item.quantity}
                    </span>
                    <span className="font-medium text-[#111827] ml-4">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#9CA3AF]">Sem itens.</p>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    adminOrderService.getAll()
      .then(setOrders)
      .catch(() => setError('Não foi possível carregar os pedidos.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#111827]">Pedidos</h1>
        {!loading && (
          <p className="mt-1 text-sm text-[#6B7280]">
            {orders.length} pedido{orders.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {error && <ErrorMessage message={error} className="mb-6" />}

      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        {loading ? (
          <div className="p-4 flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#6B7280]">
            Nenhum pedido encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                    Pedido
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide hidden sm:table-cell">
                    Data
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide hidden md:table-cell">
                    Total
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

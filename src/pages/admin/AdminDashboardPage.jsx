import { useEffect, useState } from 'react'
import { Package, Tag, ShoppingBag } from 'lucide-react'
import { adminProductService } from '@/services/adminProductService'
import { adminCategoryService } from '@/services/adminCategoryService'
import { adminOrderService } from '@/services/adminOrderService'
import { Skeleton } from '@/components/ui/skeleton'
import ErrorMessage from '@/components/common/ErrorMessage'

function StatCard({ icon: Icon, label, value, loading, iconBg }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-[#6B7280]">{label}</p>
          {loading ? (
            <Skeleton className="h-9 w-20 mt-2" />
          ) : (
            <p className="text-3xl font-semibold text-[#111827] mt-1 tabular-nums">{value}</p>
          )}
        </div>
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [data, setData] = useState({ products: [], categories: [], orders: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      adminProductService.getAll(),
      adminCategoryService.getAll(),
      adminOrderService.getAll(),
    ])
      .then(([products, categories, orders]) => setData({ products, categories, orders }))
      .catch(() => setError('Não foi possível carregar os dados do painel.'))
      .finally(() => setLoading(false))
  }, [])

  const activeProducts = data.products.filter(p => p.active).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#111827]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#6B7280]">Visão geral do e-commerce</p>
      </div>

      {error && <ErrorMessage message={error} className="mb-6" />}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          icon={Package}
          label="Produtos ativos"
          value={activeProducts}
          loading={loading}
          iconBg="bg-[#FDF2F8] text-[#F9A8C9]"
        />
        <StatCard
          icon={Tag}
          label="Categorias"
          value={data.categories.length}
          loading={loading}
          iconBg="bg-blue-50 text-blue-500"
        />
        <StatCard
          icon={ShoppingBag}
          label="Total de pedidos"
          value={data.orders.length}
          loading={loading}
          iconBg="bg-green-50 text-green-600"
        />
      </div>

      {!loading && !error && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h2 className="text-sm font-semibold text-[#111827] mb-4">Status dos produtos</h2>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Ativos</span>
                <span className="font-medium text-green-600">{activeProducts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Inativos</span>
                <span className="font-medium text-red-500">{data.products.length - activeProducts}</span>
              </div>
              <div className="flex justify-between border-t border-[#E5E7EB] pt-3">
                <span className="text-[#6B7280]">Total</span>
                <span className="font-semibold text-[#111827]">{data.products.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h2 className="text-sm font-semibold text-[#111827] mb-4">Status dos pedidos</h2>
            <div className="flex flex-col gap-3 text-sm">
              {['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(status => {
                const count = data.orders.filter(o => o.status === status).length
                if (count === 0) return null
                const labels = { PENDING: 'Pendente', PAID: 'Pago', SHIPPED: 'Enviado', DELIVERED: 'Entregue', CANCELLED: 'Cancelado' }
                return (
                  <div key={status} className="flex justify-between">
                    <span className="text-[#6B7280]">{labels[status]}</span>
                    <span className="font-medium text-[#111827]">{count}</span>
                  </div>
                )
              })}
              {data.orders.length === 0 && (
                <p className="text-[#9CA3AF]">Nenhum pedido ainda.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

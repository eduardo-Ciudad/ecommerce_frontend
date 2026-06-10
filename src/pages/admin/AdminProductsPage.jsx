import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, PowerOff } from 'lucide-react'
import { adminProductService } from '@/services/adminProductService'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import ErrorMessage from '@/components/common/ErrorMessage'

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deactivatingId, setDeactivatingId] = useState(null)

  useEffect(() => {
    adminProductService.getAll()
      .then(setProducts)
      .catch(() => setError('Não foi possível carregar os produtos.'))
      .finally(() => setLoading(false))
  }, [])

  const handleDeactivate = async (product) => {
    if (!window.confirm(`Desativar o produto "${product.name}"?\nEle ficará invisível na loja, mas não será excluído.`)) return
    setError('')
    setDeactivatingId(product.id)
    try {
      await adminProductService.delete(product.id)
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, active: false } : p))
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Erro ao desativar produto'
      setError(typeof msg === 'string' ? msg : 'Erro ao desativar produto')
    } finally {
      setDeactivatingId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#111827]">Produtos</h1>
          {!loading && (
            <p className="mt-1 text-sm text-[#6B7280]">
              {products.length} produto{products.length !== 1 ? 's' : ''} cadastrado{products.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Button asChild>
          <Link to="/admin/products/new">
            <Plus className="h-4 w-4 mr-1.5" />
            Novo produto
          </Link>
        </Button>
      </div>

      {error && <ErrorMessage message={error} className="mb-6" />}

      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        {loading ? (
          <div className="p-4 flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-[#6B7280]">Nenhum produto cadastrado.</p>
            <Button asChild size="sm" className="mt-4">
              <Link to="/admin/products/new">Criar primeiro produto</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                    Nome
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide hidden sm:table-cell">
                    Categoria
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide hidden md:table-cell">
                    Variantes
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB]/50 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium text-[#111827]">
                      {product.name}
                    </td>
                    <td className="px-5 py-3.5 text-[#6B7280] hidden sm:table-cell">
                      {product.categoryName || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-[#6B7280] hidden md:table-cell">
                      {product.variants?.length ?? 0}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={product.active ? 'success' : 'destructive'}>
                        {product.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/admin/products/${product.id}/edit`}>
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            Editar
                          </Link>
                        </Button>
                        {product.active && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeactivate(product)}
                            disabled={deactivatingId === product.id}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 focus-visible:ring-red-300"
                          >
                            <PowerOff className="h-3.5 w-3.5 mr-1" />
                            {deactivatingId === product.id ? 'Desativando...' : 'Desativar'}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import ProductCard from '@/components/common/ProductCard'
import ErrorMessage from '@/components/common/ErrorMessage'

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const selectedCategory = searchParams.get('category') || ''

  useEffect(() => {
    Promise.all([productService.getAll(), categoryService.getAll()])
      .then(([prods, cats]) => {
        setProducts(prods)
        setCategories(cats)
      })
      .catch(() => setError('Não foi possível carregar os produtos. Tente novamente.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!selectedCategory) return products
    return products.filter((p) => String(p.categoryId) === String(selectedCategory))
  }, [products, selectedCategory])

  const handleCategoryChange = (id) => {
    if (String(id) === String(selectedCategory)) {
      setSearchParams({})
    } else {
      setSearchParams({ category: id })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#111827]">Produtos</h1>
        {!loading && (
          <p className="mt-1 text-sm text-[#6B7280]">{filtered.length} produto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</p>
        )}
      </div>

      {error && <ErrorMessage message={error} className="mb-6" />}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="w-full lg:w-56 shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal className="h-4 w-4 text-[#6B7280]" />
            <span className="text-sm font-medium text-[#111827]">Categorias</span>
          </div>
          <div className="flex flex-row lg:flex-col flex-wrap gap-2">
            <Button
              variant={!selectedCategory ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchParams({})}
              className="text-xs"
            >
              Todas
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={String(cat.id) === String(selectedCategory) ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryChange(cat.id)}
                className="text-xs"
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <Skeleton className="rounded-xl" style={{ aspectRatio: '3/4' }} />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <div className="h-16 w-16 rounded-full bg-[#F9FAFB] flex items-center justify-center">
                <span className="text-2xl">🔍</span>
              </div>
              <p className="text-[#6B7280]">Nenhum produto encontrado nesta categoria.</p>
              <Button variant="outline" onClick={() => setSearchParams({})}>Ver todos os produtos</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

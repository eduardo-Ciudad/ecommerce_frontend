import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { productService } from '@/services/productService'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import ErrorMessage from '@/components/common/ErrorMessage'
import { formatCurrency } from '@/utils/formatCurrency'

function StockLabel({ stock }) {
  if (stock <= 0) return <span className="text-xs font-medium text-red-600">Esgotado</span>
  if (stock <= 3) return <span className="text-xs font-medium text-orange-500">Últimas unidades</span>
  return <span className="text-xs font-medium text-green-600">Disponível</span>
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [adding, setAdding] = useState(false)
  const [addedFeedback, setAddedFeedback] = useState(false)
  const [cartError, setCartError] = useState('')

  useEffect(() => {
    productService.getById(id)
      .then((data) => {
        setProduct(data)
      })
      .catch(() => setError('Produto não encontrado.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    if (!selectedVariant) return
    setCartError('')
    setAdding(true)
    try {
      await addToCart(selectedVariant.id, 1)
      setAddedFeedback(true)
      setTimeout(() => setAddedFeedback(false), 2000)
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Erro ao adicionar ao carrinho'
      setCartError(typeof msg === 'string' ? msg : 'Erro ao adicionar ao carrinho')
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Skeleton className="h-4 w-32 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="rounded-2xl" style={{ aspectRatio: '3/4' }} />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorMessage message={error || 'Produto não encontrado.'} />
        <Button variant="outline" asChild className="mt-4">
          <Link to="/products">Voltar aos produtos</Link>
        </Button>
      </div>
    )
  }

  const canAdd = !!selectedVariant && selectedVariant.stock > 0
  const displayPrice = selectedVariant
    ? selectedVariant.price
    : product.variants?.length
      ? Math.min(...product.variants.map((v) => v.price))
      : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <Link to="/products" className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827] transition-colors mb-8">
        <ArrowLeft className="h-3.5 w-3.5" />
        Voltar aos produtos
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="rounded-2xl overflow-hidden bg-[#F9FAFB] border border-[#E5E7EB]" style={{ aspectRatio: '3/4' }}>
          <div className="h-full flex items-center justify-center">
            <svg className="h-24 w-24 text-[#D1D5DB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col">
          {product.categoryName && (
            <Badge variant="secondary" className="self-start mb-3">{product.categoryName}</Badge>
          )}
          <h1 className="text-2xl md:text-3xl font-semibold text-[#111827] leading-tight">{product.name}</h1>

          {displayPrice !== null && (
            <p className="mt-4 text-2xl font-semibold text-[#111827]">
              {selectedVariant ? formatCurrency(displayPrice) : `A partir de ${formatCurrency(displayPrice)}`}
            </p>
          )}

          {product.description && (
            <p className="mt-4 text-sm text-[#6B7280] leading-relaxed">{product.description}</p>
          )}

          {/* Sizes */}
          {product.variants?.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-[#111827]">Tamanho</span>
                {selectedVariant && <StockLabel stock={selectedVariant.stock} />}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    disabled={variant.stock <= 0}
                    className={[
                      'h-10 min-w-[2.5rem] px-3 rounded-lg border text-sm font-medium transition-all',
                      variant.stock <= 0
                        ? 'border-[#E5E7EB] text-[#D1D5DB] cursor-not-allowed line-through'
                        : selectedVariant?.id === variant.id
                          ? 'border-[#111827] bg-[#111827] text-white'
                          : 'border-[#E5E7EB] text-[#111827] hover:border-[#111827]',
                    ].join(' ')}
                  >
                    {variant.size}
                  </button>
                ))}
              </div>
              {!selectedVariant && (
                <p className="mt-2 text-xs text-[#9CA3AF]">Selecione um tamanho</p>
              )}
            </div>
          )}

          {cartError && <ErrorMessage message={cartError} className="mt-4" />}

          <div className="mt-8 flex flex-col gap-3">
            {!isAuthenticated ? (
              <Button size="lg" asChild>
                <Link to="/login">Entrar para comprar</Link>
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={!canAdd || adding}
                className="w-full"
              >
                {adding ? (
                  'Adicionando...'
                ) : addedFeedback ? (
                  <>✓ Adicionado ao carrinho</>
                ) : (
                  <>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Adicionar ao carrinho
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

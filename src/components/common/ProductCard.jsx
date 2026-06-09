import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/utils/formatCurrency'

export default function ProductCard({ product }) {
  const minPrice = product.variants?.length
    ? Math.min(...product.variants.map((v) => v.price))
    : null

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col bg-white rounded-xl overflow-hidden border border-[#E5E7EB] hover:shadow-md transition-all duration-200"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-[#F9FAFB]" style={{ aspectRatio: '3/4' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="h-16 w-16 text-[#D1D5DB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-300 bg-gradient-to-b from-transparent to-black/5" />
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-4">
        {product.categoryName && (
          <Badge variant="secondary" className="self-start text-xs">
            {product.categoryName}
          </Badge>
        )}
        <h3 className="text-sm font-medium text-[#111827] line-clamp-2 leading-snug">
          {product.name}
        </h3>
        {minPrice !== null && (
          <p className="text-sm font-semibold text-[#111827]">
            A partir de {formatCurrency(minPrice)}
          </p>
        )}
      </div>
    </Link>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import ProductCard from '@/components/common/ProductCard'

function CategoryCard({ category }) {
  return (
    <Link
      to={`/products?category=${category.id}`}
      className="group flex flex-col items-center justify-center gap-3 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] p-8 hover:bg-[#FDF2F8] hover:border-[#F9A8C9] transition-all duration-200"
    >
      <div className="h-12 w-12 rounded-full bg-[#F9A8C9]/20 flex items-center justify-center">
        <span className="text-xl">👕</span>
      </div>
      <span className="text-sm font-medium text-[#111827] text-center">{category.name}</span>
    </Link>
  )
}

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)

  useEffect(() => {
    productService.getAll()
      .then((data) => setProducts(data.slice(0, 8)))
      .catch(() => {})
      .finally(() => setLoadingProducts(false))

    categoryService.getAll()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoadingCategories(false))
  }, [])

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FDF2F8] via-white to-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#111827] leading-tight tracking-tight">
              Moda infantil com<br />
              <span className="text-[#F9A8C9]">estilo e conforto</span>
            </h1>
            <p className="mt-6 text-lg text-[#6B7280] leading-relaxed max-w-lg">
              Peças cuidadosamente selecionadas para os pequenos. Qualidade, durabilidade e muito charme em cada item.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/products">
                  Ver coleção
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-[#F9A8C9]/10 pointer-events-none" />
        <div className="absolute top-1/2 -right-10 h-48 w-48 rounded-full bg-[#F9A8C9]/10 pointer-events-none" />
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-[#111827]">Categorias em destaque</h2>
            <p className="mt-1 text-sm text-[#6B7280]">Encontre o que você procura</p>
          </div>
        </div>

        {loadingCategories ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-sm text-[#6B7280]">Nenhuma categoria disponível.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        )}
      </section>

      {/* New arrivals */}
      <section className="bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-[#111827]">Novidades</h2>
              <p className="mt-1 text-sm text-[#6B7280]">Os itens mais recentes da coleção</p>
            </div>
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
              <Link to="/products">
                Ver todos
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <Skeleton className="rounded-xl" style={{ aspectRatio: '3/4' }} />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="text-sm text-[#6B7280]">Nenhum produto disponível.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-10 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link to="/products">Ver todos os produtos</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

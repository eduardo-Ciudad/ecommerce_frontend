import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { adminProductService } from '@/services/adminProductService'
import { adminCategoryService } from '@/services/adminCategoryService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import ErrorMessage from '@/components/common/ErrorMessage'
import { formatCurrency } from '@/utils/formatCurrency'

const emptyVariantForm = { size: '', price: '', stock: '' }

function validateProduct(form) {
  const e = {}
  if (!form.name.trim()) e.name = 'Nome obrigatório'
  else if (form.name.length > 150) e.name = 'Máximo 150 caracteres'
  if (!form.categoryId) e.categoryId = 'Categoria obrigatória'
  return e
}

function validateVariant(v) {
  const e = {}
  if (!v.size.trim()) e.size = 'Tamanho obrigatório'
  if (!v.price || isNaN(Number(v.price)) || Number(v.price) < 0.01) e.price = 'Preço mínimo R$ 0,01'
  if (v.stock === '' || isNaN(Number(v.stock)) || Number(v.stock) < 0) e.stock = 'Mínimo 0'
  return e
}

export default function AdminProductFormPage() {
  const { id } = useParams()
  const isEditMode = !!id
  const navigate = useNavigate()

  // Product form
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ name: '', categoryId: '', description: '' })
  const [formErrors, setFormErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(isEditMode)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Variants
  const [variants, setVariants] = useState([])
  const [variantForm, setVariantForm] = useState(emptyVariantForm)
  const [variantFormErrors, setVariantFormErrors] = useState({})
  const [isSavingVariant, setIsSavingVariant] = useState(false)
  const [variantError, setVariantError] = useState('')
  const [editingVariant, setEditingVariant] = useState(null)
  const [deletingVariantId, setDeletingVariantId] = useState(null)

  // Load categories
  useEffect(() => {
    adminCategoryService.getAll().then(setCategories).catch(() => {})
  }, [])

  // Load product (edit mode only)
  useEffect(() => {
    if (!isEditMode) return
    adminProductService.getById(id)
      .then((product) => {
        setForm({
          name: product.name,
          categoryId: String(product.categoryId),
          description: product.description || '',
        })
        setVariants(product.variants || [])
      })
      .catch(() => setApiError('Não foi possível carregar o produto.'))
      .finally(() => setLoadingProduct(false))
  }, [id, isEditMode])

  // --- Product save ---

  const handleSaveProduct = async (e) => {
    e.preventDefault()
    const errors = validateProduct(form)
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return }
    setFormErrors({})
    setApiError('')
    setSaveSuccess(false)
    setIsSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        categoryId: form.categoryId,
        description: form.description.trim() || null,
      }
      if (isEditMode) {
        await adminProductService.update(id, payload)
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 2500)
      } else {
        const created = await adminProductService.create(payload)
        // Navigate to edit mode — component remounts, loads product, shows variants section
        navigate(`/admin/products/${created.id}/edit`, { replace: true })
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Erro ao salvar produto'
      setApiError(typeof msg === 'string' ? msg : 'Erro ao salvar produto')
    } finally {
      setIsSaving(false)
    }
  }

  // --- Variant add ---

  const handleAddVariant = async (e) => {
    e.preventDefault()
    const errors = validateVariant(variantForm)
    if (Object.keys(errors).length > 0) { setVariantFormErrors(errors); return }
    setVariantFormErrors({})
    setVariantError('')
    setIsSavingVariant(true)
    try {
      const payload = {
        size: variantForm.size.trim(),
        price: Number(variantForm.price),
        stock: Number(variantForm.stock),
      }
      const created = await adminProductService.createVariant(id, payload)
      // API may return variant or full product — handle both
      if (created && typeof created.id !== 'undefined' && !created.variants) {
        setVariants(prev => [...prev, created])
      } else if (created?.variants) {
        setVariants(created.variants)
      } else {
        setVariants(prev => [...prev, { ...payload, id: Date.now(), createdAt: new Date().toISOString() }])
      }
      setVariantForm(emptyVariantForm)
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Erro ao adicionar variante'
      setVariantError(typeof msg === 'string' ? msg : 'Erro ao adicionar variante')
    } finally {
      setIsSavingVariant(false)
    }
  }

  // --- Variant edit ---

  const startEditVariant = (variant) => {
    setEditingVariant({ ...variant, price: String(variant.price), stock: String(variant.stock) })
    setVariantFormErrors({})
  }

  const handleUpdateVariant = async () => {
    const errors = validateVariant(editingVariant)
    if (Object.keys(errors).length > 0) { setVariantFormErrors(errors); return }
    setVariantFormErrors({})
    setVariantError('')
    setIsSavingVariant(true)
    try {
      const payload = {
        size: editingVariant.size.trim(),
        price: Number(editingVariant.price),
        stock: Number(editingVariant.stock),
      }
      await adminProductService.updateVariant(editingVariant.id, payload)
      // Update locally regardless of API response shape
      setVariants(prev => prev.map(v =>
        v.id === editingVariant.id ? { ...v, ...payload } : v
      ))
      setEditingVariant(null)
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Erro ao atualizar variante'
      setVariantError(typeof msg === 'string' ? msg : 'Erro ao atualizar variante')
    } finally {
      setIsSavingVariant(false)
    }
  }

  const cancelEditVariant = () => {
    setEditingVariant(null)
    setVariantFormErrors({})
  }

  // --- Variant delete ---

  const handleDeleteVariant = async (variantId) => {
    if (!window.confirm('Excluir esta variante? A ação não pode ser desfeita.')) return
    setDeletingVariantId(variantId)
    setVariantError('')
    try {
      await adminProductService.deleteVariant(variantId)
      setVariants(prev => prev.filter(v => v.id !== variantId))
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Erro ao excluir variante'
      setVariantError(typeof msg === 'string' ? msg : 'Erro ao excluir variante')
    } finally {
      setDeletingVariantId(null)
    }
  }

  // --- Render ---

  if (loadingProduct) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-4 w-36 mb-6" />
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 flex flex-col gap-5">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827] transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Voltar a produtos
      </Link>

      <h1 className="text-2xl font-semibold text-[#111827] mb-8">
        {isEditMode ? 'Editar produto' : 'Novo produto'}
      </h1>

      {/* ── Section 1: Product data ── */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 mb-6">
        <h2 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-6">
          Dados do produto
        </h2>

        {apiError && <ErrorMessage message={apiError} className="mb-5" />}

        {saveSuccess && (
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
            <Check className="h-4 w-4 text-green-600 shrink-0" />
            <p className="text-sm text-green-700 font-medium">Produto salvo com sucesso.</p>
          </div>
        )}

        <form onSubmit={handleSaveProduct} className="flex flex-col gap-5">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Nome do produto"
              maxLength={150}
              className={formErrors.name ? 'border-red-400 focus:ring-red-400' : ''}
            />
            {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="categoryId">Categoria *</Label>
            <select
              id="categoryId"
              value={form.categoryId}
              onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}
              className={[
                'flex h-10 w-full rounded-lg border px-3 py-2 text-sm text-[#111827] bg-white',
                'focus:outline-none focus:ring-2 focus:ring-[#F9A8C9] focus:border-transparent transition-colors',
                formErrors.categoryId ? 'border-red-400' : 'border-[#E5E7EB]',
              ].join(' ')}
            >
              <option value="">Selecione uma categoria</option>
              {categories.map(cat => (
                <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
              ))}
            </select>
            {formErrors.categoryId && <p className="text-xs text-red-500">{formErrors.categoryId}</p>}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descrição</Label>
            <textarea
              id="description"
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Descrição do produto (opcional)"
              rows={3}
              className="flex w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F9A8C9] focus:border-transparent resize-none transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Salvando...' : isEditMode ? 'Salvar alterações' : 'Criar produto'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/products')}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>

      {/* ── Section 2: Variants (only in edit mode) ── */}
      {isEditMode && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <h2 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-6">
            Variantes (tamanhos)
          </h2>

          {variantError && <ErrorMessage message={variantError} className="mb-4" />}

          {/* Existing variants */}
          {variants.length > 0 && (
            <div className="mb-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    <th className="pb-2.5 pr-3 text-left text-xs font-semibold text-[#6B7280] uppercase">Tamanho</th>
                    <th className="pb-2.5 pr-3 text-left text-xs font-semibold text-[#6B7280] uppercase">Preço</th>
                    <th className="pb-2.5 pr-3 text-left text-xs font-semibold text-[#6B7280] uppercase">Estoque</th>
                    <th className="pb-2.5 text-right text-xs font-semibold text-[#6B7280] uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map(variant => (
                    <tr key={variant.id} className="border-b border-[#E5E7EB] last:border-0">
                      {editingVariant?.id === variant.id ? (
                        /* Inline edit row */
                        <>
                          <td className="py-2 pr-2">
                            <Input
                              value={editingVariant.size}
                              onChange={e => setEditingVariant(p => ({ ...p, size: e.target.value }))}
                              className={`h-8 text-xs ${variantFormErrors.size ? 'border-red-400' : ''}`}
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <Input
                              type="number"
                              step="0.01"
                              min="0.01"
                              value={editingVariant.price}
                              onChange={e => setEditingVariant(p => ({ ...p, price: e.target.value }))}
                              className={`h-8 text-xs ${variantFormErrors.price ? 'border-red-400' : ''}`}
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              value={editingVariant.stock}
                              onChange={e => setEditingVariant(p => ({ ...p, stock: e.target.value }))}
                              className={`h-8 text-xs ${variantFormErrors.stock ? 'border-red-400' : ''}`}
                            />
                          </td>
                          <td className="py-2">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleUpdateVariant}
                                disabled={isSavingVariant}
                                className="h-7 w-7 text-green-600 hover:bg-green-50"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={cancelEditVariant}
                                className="h-7 w-7 text-[#6B7280]"
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </>
                      ) : (
                        /* Display row */
                        <>
                          <td className="py-3 pr-3 font-medium text-[#111827]">{variant.size}</td>
                          <td className="py-3 pr-3 text-[#111827]">{formatCurrency(variant.price)}</td>
                          <td className="py-3 pr-3 text-[#6B7280]">{variant.stock}</td>
                          <td className="py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => startEditVariant(variant)}
                                className="h-7 w-7 text-[#6B7280] hover:text-[#111827]"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteVariant(variant.id)}
                                disabled={deletingVariantId === variant.id}
                                className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {variants.length === 0 && !variantError && (
            <p className="text-sm text-[#9CA3AF] mb-5">Nenhuma variante cadastrada ainda.</p>
          )}

          {/* Add variant form */}
          <div className="border-t border-[#E5E7EB] pt-5">
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">
              Adicionar variante
            </p>
            <form onSubmit={handleAddVariant}>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Tamanho (P, M, G…)"
                    value={variantForm.size}
                    onChange={e => setVariantForm(p => ({ ...p, size: e.target.value }))}
                    className={variantFormErrors.size ? 'border-red-400' : ''}
                  />
                  {variantFormErrors.size && (
                    <p className="text-xs text-red-500 mt-1">{variantFormErrors.size}</p>
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Preço (R$)"
                    value={variantForm.price}
                    onChange={e => setVariantForm(p => ({ ...p, price: e.target.value }))}
                    className={variantFormErrors.price ? 'border-red-400' : ''}
                  />
                  {variantFormErrors.price && (
                    <p className="text-xs text-red-500 mt-1">{variantFormErrors.price}</p>
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Estoque"
                    value={variantForm.stock}
                    onChange={e => setVariantForm(p => ({ ...p, stock: e.target.value }))}
                    className={variantFormErrors.stock ? 'border-red-400' : ''}
                  />
                  {variantFormErrors.stock && (
                    <p className="text-xs text-red-500 mt-1">{variantFormErrors.stock}</p>
                  )}
                </div>
                <Button type="submit" disabled={isSavingVariant} className="shrink-0">
                  {isSavingVariant ? 'Adicionando...' : (
                    <>
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hint for new mode */}
      {!isEditMode && (
        <p className="text-xs text-[#9CA3AF] mt-4 text-center">
          Após criar o produto você poderá adicionar tamanhos e preços.
        </p>
      )}
    </div>
  )
}

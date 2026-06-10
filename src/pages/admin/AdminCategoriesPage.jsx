import { useEffect, useState } from 'react'
import { Trash2, Tag } from 'lucide-react'
import { adminCategoryService } from '@/services/adminCategoryService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import ErrorMessage from '@/components/common/ErrorMessage'
import { formatDate } from '@/utils/formatDate'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')

  const [newName, setNewName] = useState('')
  const [nameError, setNameError] = useState('')
  const [createError, setCreateError] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    adminCategoryService.getAll()
      .then(setCategories)
      .catch(() => setListError('Não foi possível carregar as categorias.'))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) { setNameError('Nome obrigatório'); return }
    setNameError('')
    setCreateError('')
    setIsCreating(true)
    try {
      const created = await adminCategoryService.create({ name: newName.trim() })
      setCategories(prev => [...prev, created])
      setNewName('')
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Erro ao criar categoria'
      setCreateError(typeof msg === 'string' ? msg : 'Erro ao criar categoria')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (category) => {
    if (!window.confirm(
      `Excluir a categoria "${category.name}"?\nProdutos vinculados podem ser afetados.`
    )) return
    setListError('')
    setDeletingId(category.id)
    try {
      await adminCategoryService.delete(category.id)
      setCategories(prev => prev.filter(c => c.id !== category.id))
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Erro ao excluir categoria'
      setListError(typeof msg === 'string' ? msg : 'Erro ao excluir categoria')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#111827]">Categorias</h1>
        {!loading && (
          <p className="mt-1 text-sm text-[#6B7280]">
            {categories.length} categoria{categories.length !== 1 ? 's' : ''} cadastrada{categories.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Create form */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 mb-6">
        <h2 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-4">
          Nova categoria
        </h2>

        {createError && <ErrorMessage message={createError} className="mb-4" />}

        <form onSubmit={handleCreate}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                value={newName}
                onChange={e => { setNewName(e.target.value); setNameError('') }}
                placeholder="Nome da categoria"
                className={nameError ? 'border-red-400' : ''}
              />
              {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
            </div>
            <Button type="submit" disabled={isCreating} className="shrink-0">
              {isCreating ? 'Criando...' : 'Criar categoria'}
            </Button>
          </div>
        </form>
      </div>

      {listError && <ErrorMessage message={listError} className="mb-6" />}

      {/* List */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        {loading ? (
          <div className="p-4 flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-[#F9FAFB] flex items-center justify-center">
              <Tag className="h-5 w-5 text-[#D1D5DB]" />
            </div>
            <p className="text-sm text-[#6B7280]">Nenhuma categoria cadastrada.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                  Nome
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide hidden sm:table-cell">
                  Criada em
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB]/50 transition-colors"
                >
                  <td className="px-5 py-3.5 font-medium text-[#111827]">{cat.name}</td>
                  <td className="px-5 py-3.5 text-[#6B7280] hidden sm:table-cell">
                    {cat.createdAt ? formatDate(cat.createdAt) : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(cat)}
                      disabled={deletingId === cat.id}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      {deletingId === cat.id ? 'Excluindo...' : 'Excluir'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

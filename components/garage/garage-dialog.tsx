'use client'

import { useState, useRef } from 'react'
import {
  Bike,
  Plus,
  Check,
  Camera,
  Upload,
  Pencil,
  Trash2,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { compressImage } from '@/lib/image-utils'
import type { Moto, Fueling } from '@/app/actions'

interface GarageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  motos: Moto[]
  activeMotoId: number
  onSelectMoto: (motoId: number) => void
  onAddMoto: (motoData: {
    name: string
    model: string
    plate: string
    year: string
    photoUrl: string
  }) => Promise<void>
  onUpdateMoto: (
    motoId: number,
    motoData: {
      name: string
      model: string
      plate: string
      year: string
      photoUrl: string
    }
  ) => Promise<void>
  onDeleteMoto: (motoId: number) => Promise<void>
  fuelings: Fueling[]
}

export function GarageDialog({
  open,
  onOpenChange,
  motos,
  activeMotoId,
  onSelectMoto,
  onAddMoto,
  onUpdateMoto,
  onDeleteMoto,
  fuelings
}: GarageDialogProps) {
  // Mode: 'list' | 'add' | 'edit'
  const [viewMode, setViewMode] = useState<'list' | 'add' | 'edit'>('list')
  const [editingMotoId, setEditingMotoId] = useState<number | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    plate: '',
    year: '2024',
    photoUrl: ''
  })
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const openAddForm = () => {
    setFormData({
      name: 'Minha Moto',
      model: '',
      plate: '',
      year: new Date().getFullYear().toString(),
      photoUrl: ''
    })
    setViewMode('add')
  }

  const openEditForm = (moto: Moto) => {
    setEditingMotoId(moto.id)
    setFormData({
      name: moto.name || 'Minha Moto',
      model: moto.model || '',
      plate: moto.plate || '',
      year: moto.year || '2024',
      photoUrl: moto.photoUrl || ''
    })
    setViewMode('edit')
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Selecione um arquivo de imagem válido.')
      return
    }

    setIsCompressingPhoto(true)
    try {
      const compressed = await compressImage(file, 1000, 1000, 0.82)
      setFormData(prev => ({ ...prev, photoUrl: compressed }))
    } catch (err) {
      console.error('Erro ao comprimir foto:', err)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }))
      }
      reader.readAsDataURL(file)
    } finally {
      setIsCompressingPhoto(false)
      if (e.target) e.target.value = ''
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.model.trim()) {
      alert('Por favor, informe o modelo da moto.')
      return
    }

    setIsSubmitting(true)
    try {
      if (viewMode === 'add') {
        await onAddMoto(formData)
      } else if (viewMode === 'edit' && editingMotoId) {
        await onUpdateMoto(editingMotoId, formData)
      }
      setViewMode('list')
    } catch (err) {
      console.error('Erro ao salvar moto:', err)
      alert('Ocorreu um erro ao salvar o veículo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (motoId: number) => {
    setIsSubmitting(true)
    try {
      await onDeleteMoto(motoId)
      setDeleteConfirmId(null)
    } catch (err) {
      console.error('Erro ao excluir moto:', err)
      alert('Falha ao excluir o veículo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto p-0 border-border bg-card text-card-foreground">
        <DialogHeader className="p-6 pb-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-xs">
                <Bike className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle className="text-base font-bold">
                  {viewMode === 'list'
                    ? 'Minha Garagem'
                    : viewMode === 'add'
                    ? 'Cadastrar Novo Veículo'
                    : 'Editar Veículo'}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {viewMode === 'list'
                    ? 'Gerencie seus veículos e escolha qual está ativo no dashboard.'
                    : 'Preencha as informações do veículo e envie sua foto.'}
                </DialogDescription>
              </div>
            </div>

            {viewMode === 'list' && (
              <Button
                size="sm"
                onClick={openAddForm}
                className="text-xs h-8 px-2.5 sm:px-3 gap-1.5 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Adicionar Moto</span>
                <span className="sm:hidden">Nova Moto</span>
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="p-6">
          {/* ================= VIEW: LIST MOTOS ================= */}
          {viewMode === 'list' && (
            <div className="space-y-3">
              {motos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground space-y-2">
                  <Bike className="h-10 w-10 mx-auto opacity-30" />
                  <p className="text-xs">Nenhum veículo cadastrado ainda.</p>
                  <Button size="sm" onClick={openAddForm} className="text-xs mt-2">
                    Cadastrar Primeira Moto
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3">
                  {motos.map(m => {
                    const isActive = m.id === activeMotoId
                    const motoFuelingsCount = fuelings.filter(f => f.motoId === m.id).length

                    return (
                      <Card
                        key={m.id}
                        className={`transition-all border overflow-hidden ${
                          isActive
                            ? 'border-primary/70 bg-primary/5 shadow-xs ring-1 ring-primary/40'
                            : 'border-border/80 hover:border-primary/40 bg-card'
                        }`}
                      >
                        <CardContent className="p-3.5 flex items-center gap-3.5">
                          {/* Moto Photo Thumbnail */}
                          <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-border bg-muted/60">
                            {m.photoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={m.photoUrl}
                                alt={m.model}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                <Bike className="h-6 w-6 opacity-40" />
                              </div>
                            )}
                            {isActive && (
                              <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-card" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-foreground truncate">
                                {m.model || m.name}
                              </h4>
                              {isActive && (
                                <Badge className="text-[10px] py-0 px-1.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                  Ativa
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              {m.plate && (
                                <span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-[10px] text-foreground font-semibold">
                                  {m.plate}
                                </span>
                              )}
                              <span>{m.year || 'Ano N/D'}</span>
                              <span>•</span>
                              <span>{motoFuelingsCount} abastecimentos</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {!isActive ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onSelectMoto(m.id)}
                                className="text-xs h-8 gap-1 cursor-pointer border-border hover:border-primary/50"
                              >
                                <Check className="h-3.5 w-3.5 text-primary" />
                                Selecionar
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled
                                className="text-xs h-8 gap-1 text-emerald-600 dark:text-emerald-400 font-semibold"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Em Uso
                              </Button>
                            )}

                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEditForm(m)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Editar dados da moto"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>

                            {motos.length > 1 && (
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setDeleteConfirmId(m.id)}
                                className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                title="Excluir moto"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </CardContent>

                        {/* Confirmation dialog for deletion */}
                        {deleteConfirmId === m.id && (
                          <div className="p-3 bg-destructive/10 border-t border-destructive/20 flex items-center justify-between text-xs animate-in fade-in duration-150">
                            <span className="flex items-center gap-1.5 text-destructive font-medium">
                              <AlertCircle className="h-3.5 w-3.5" />
                              Excluir este veículo e seus abastecimentos?
                            </span>
                            <div className="flex gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDeleteConfirmId(null)}
                                className="h-7 text-xs"
                              >
                                Cancelar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={isSubmitting}
                                onClick={() => handleDelete(m.id)}
                                className="h-7 text-xs font-semibold"
                              >
                                {isSubmitting ? 'Excluindo...' : 'Confirmar'}
                              </Button>
                            </div>
                          </div>
                        )}
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= VIEW: ADD / EDIT MOTO ================= */}
          {(viewMode === 'add' || viewMode === 'edit') && (
            <form onSubmit={handleSave} className="space-y-4">
              {/* Photo Upload with auto-compression */}
              <div className="flex flex-col items-center gap-2.5 pb-2">
                <div className="relative group w-28 h-28 rounded-2xl overflow-hidden border border-border bg-muted/30 flex items-center justify-center shadow-inner">
                  {isCompressingPhoto ? (
                    <div className="flex flex-col items-center justify-center text-muted-foreground p-2 text-center gap-1">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-[10px] font-medium">Otimizando foto...</span>
                    </div>
                  ) : formData.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={formData.photoUrl}
                      alt="Foto da Moto"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground p-2 text-center">
                      <Bike className="h-8 w-8 mb-1 opacity-40" />
                      <span className="text-[10px]">Sem foto</span>
                    </div>
                  )}

                  {!isCompressingPhoto && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200 text-xs gap-1 cursor-pointer"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Alterar</span>
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isCompressingPhoto || isSubmitting}
                    className="text-xs h-7 gap-1.5 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isCompressingPhoto ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" /> Otimizando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-3 w-3" />
                        {formData.photoUrl ? 'Trocar foto' : 'Enviar foto'}
                      </>
                    )}
                  </Button>
                  {formData.photoUrl && !isCompressingPhoto && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 text-destructive hover:bg-destructive/10 cursor-pointer"
                      onClick={() => setFormData(prev => ({ ...prev, photoUrl: '' }))}
                    >
                      Remover
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="moto-model-input" className="text-xs font-semibold">
                    Modelo da Moto *
                  </Label>
                  <Input
                    id="moto-model-input"
                    value={formData.model}
                    onChange={e => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="Ex: Yamaha MT-03, Honda CB 300F, Fazer 250"
                    required
                    className="text-xs"
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="moto-name-input" className="text-xs font-semibold">
                    Apelido / Identificação
                  </Label>
                  <Input
                    id="moto-name-input"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Minha Nave, Moto do Trabalho"
                    className="text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="moto-year-input" className="text-xs font-semibold">
                      Ano de Fabricação
                    </Label>
                    <Input
                      id="moto-year-input"
                      value={formData.year}
                      onChange={e => setFormData(prev => ({ ...prev, year: e.target.value }))}
                      placeholder="Ex: 2024"
                      className="text-xs"
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="moto-plate-input" className="text-xs font-semibold">
                      Placa (Opcional)
                    </Label>
                    <Input
                      id="moto-plate-input"
                      value={formData.plate}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, plate: e.target.value.toUpperCase() }))
                      }
                      placeholder="Ex: BRA-2E19"
                      className="text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => setViewMode('list')}
                  className="flex-1 text-xs cursor-pointer"
                >
                  Voltar para Garagem
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || isCompressingPhoto}
                  className="flex-1 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      {viewMode === 'add' ? 'Cadastrar Veículo' : 'Atualizar Dados'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

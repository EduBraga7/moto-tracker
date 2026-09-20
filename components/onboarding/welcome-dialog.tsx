'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bike,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Navigation,
  PackageCheck,
  Code2,
  Palette,
  Gauge,
  ShieldCheck,
  TrendingUp
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
import { type AccentColor, ACCENT_CONFIG } from '@/components/accent-picker'

export type UsageProfile = 'daily' | 'delivery' | 'trips' | 'tech_recruiter'

export interface OnboardingData {
  usageProfile: UsageProfile
  motoName: string
  motoBrand: string
  motoModel: string
  motoPlate: string
  motoYear: string
  currentOdometer?: number
  preferredColor: AccentColor
}

interface WelcomeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName: string
  userAvatar?: string
  initialMotoModel?: string
  onComplete: (data: OnboardingData) => Promise<void> | void
}

const POPULAR_BRANDS = [
  'Honda',
  'Yamaha',
  'BMW',
  'Kawasaki',
  'Suzuki',
  'Royal Enfield',
  'Triumph',
  'Haojue'
]

const BRAND_MODELS: Record<string, string[]> = {
  Honda: ['Bros 160', 'CG 160 Titan', 'CB 300F Twister', 'XRE 300 / Sahara', 'Biz 125', 'Pop 110i'],
  Yamaha: ['Fazer FZ25', 'Fator 150', 'Crosser 150', 'MT-03', 'Lander 250', 'NMAX 160'],
  BMW: ['G 310 GS', 'F 850 GS', 'R 1250 GS', 'S 1000 RR'],
  Kawasaki: ['Ninja 400', 'Z400', 'Versys 300', 'Z900'],
  Suzuki: ['V-Strom 650', 'GSX-S750', 'Hayabusa', 'Burgman'],
  'Royal Enfield': ['Hunter 350', 'Classic 350', 'Meteor 350', 'Himalayan 411/450']
}

export function WelcomeDialog({
  open,
  onOpenChange,
  userName,
  userAvatar,
  initialMotoModel,
  onComplete
}: WelcomeDialogProps) {
  const [step, setStep] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Parse initial brand/model if provided
  const parsedInitial = (() => {
    if (!initialMotoModel) return { brand: 'Honda', model: 'CB 300F Twister' }
    const parts = initialMotoModel.trim().split(' ')
    const firstWord = parts[0]
    const matchedBrand = POPULAR_BRANDS.find(b => b.toLowerCase() === firstWord.toLowerCase())
    if (matchedBrand) {
      return { brand: matchedBrand, model: parts.slice(1).join(' ') || 'Bros 160' }
    }
    return { brand: 'Honda', model: initialMotoModel }
  })()

  // Form State
  const [usageProfile, setUsageProfile] = useState<UsageProfile>('daily')
  const [motoName, setMotoName] = useState('Minha Moto')
  const [motoBrand, setMotoBrand] = useState(parsedInitial.brand)
  const [motoModel, setMotoModel] = useState(parsedInitial.model)
  const [motoYear, setMotoYear] = useState('2024')
  const [motoPlate, setMotoPlate] = useState('BRA-2E19')
  const [currentOdometer, setCurrentOdometer] = useState<string>('12500')
  const [preferredColor, setPreferredColor] = useState<AccentColor>('red')

  const firstName = userName?.trim().split(' ')[0] || ''

  const handleNext = () => {
    setStep(prev => Math.min(prev + 1, 4))
  }

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 0))
  }

  const handleFinish = async () => {
    setIsSubmitting(true)
    try {
      await onComplete({
        usageProfile,
        motoName: motoName.trim() || 'Minha Moto',
        motoBrand: motoBrand.trim() || 'Honda',
        motoModel: motoModel.trim() || 'Bros 160',
        motoPlate: motoPlate.trim().toUpperCase(),
        motoYear: motoYear.trim() || '2024',
        currentOdometer: currentOdometer ? Number(currentOdometer) : undefined,
        preferredColor
      })
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = async () => {
    setIsSubmitting(true)
    try {
      await onComplete({
        usageProfile: 'daily',
        motoName: 'Minha Moto',
        motoBrand: 'Honda',
        motoModel: 'Bros 160',
        motoPlate: 'BRA-2E19',
        motoYear: '2024',
        preferredColor: 'red'
      })
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const stepsList = [
    { title: 'Boas-vindas', desc: 'Introdução' },
    { title: 'Perfil de Uso', desc: 'Objetivo' },
    { title: 'Sua Moto', desc: 'Marca & Modelo' },
    { title: 'Cores', desc: 'Identidade Visual' },
    { title: 'Pronto!', desc: 'Conclusão' }
  ]

  const suggestedModels = BRAND_MODELS[motoBrand] || BRAND_MODELS['Honda']

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[92vh] overflow-y-auto p-0 border-border bg-card text-card-foreground shadow-2xl rounded-2xl">
        {/* Progress Bar & Header */}
        <div className="bg-muted/40 border-b border-border/80 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4 text-primary" />
              </span>
              <div>
                <DialogTitle className="text-sm font-semibold tracking-tight">
                  Configuração Inicial do Moto Tracker
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Passo {step + 1} de {stepsList.length}: {stepsList[step].title}
                </DialogDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
              Etapa {step + 1}/5
            </Badge>
          </div>

          {/* Stepper Dots */}
          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {stepsList.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i <= step ? 'bg-primary' : 'bg-muted-foreground/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 min-h-[340px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {/* STEP 0: BOAS-VINDAS */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-primary/5 border border-primary/15">
                  <div className="relative">
                    {userAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={userAvatar}
                        alt={userName}
                        className="h-12 w-12 rounded-full object-cover border-2 border-primary/30"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-base">
                        {firstName.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-card" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      Bem-vindo, {firstName}! 👋
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Sua conta está conectada e pronta para registrar sua garagem.
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    O que o Moto Tracker PRO faz por você:
                  </h4>
                  <div className="grid gap-2 text-xs">
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border/70 bg-muted/20">
                      <Gauge className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">Cálculo Ponderado de Consumo (km/L)</p>
                        <p className="text-muted-foreground text-[11px]">
                          Médias matemáticas precisas com tratamento de tanques cheios e parciais.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border/70 bg-muted/20">
                      <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">Custo Real por Quilômetro (R$/KM)</p>
                        <p className="text-muted-foreground text-[11px]">
                          Saiba exatamente quanto custa rodar cada quilômetro com a sua moto.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border/70 bg-muted/20">
                      <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">Isolamento Completo da Garagem</p>
                        <p className="text-muted-foreground text-[11px]">
                          Cadastre múltiplas motos com dados e telemetrias 100% independentes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 1: PERFIL DE USO */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Qual é o seu objetivo principal com o app?
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Isso personaliza o perfil da sua garagem e os destaques do painel.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* Daily */}
                  <button
                    type="button"
                    onClick={() => setUsageProfile('daily')}
                    className={`flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      usageProfile === 'daily'
                        ? 'border-primary bg-primary/10 shadow-xs'
                        : 'border-border/80 hover:border-primary/50 bg-muted/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Navigation className="h-4 w-4 text-primary" />
                      {usageProfile === 'daily' && <Check className="h-3.5 w-3.5 text-primary" />}
                    </div>
                    <span className="text-xs font-semibold text-foreground">Dia a Dia & Mobilidade</span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">
                      Deslocamento diário para trabalho, faculdade e trânsito urbano.
                    </span>
                  </button>

                  {/* Delivery */}
                  <button
                    type="button"
                    onClick={() => setUsageProfile('delivery')}
                    className={`flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      usageProfile === 'delivery'
                        ? 'border-primary bg-primary/10 shadow-xs'
                        : 'border-border/80 hover:border-primary/50 bg-muted/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <PackageCheck className="h-4 w-4 text-amber-500" />
                      {usageProfile === 'delivery' && <Check className="h-3.5 w-3.5 text-primary" />}
                    </div>
                    <span className="text-xs font-semibold text-foreground">Trabalho & Entregas</span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">
                      iFood, Loggi ou motoboy. Foco total em custo/km e rendimento diário.
                    </span>
                  </button>

                  {/* Trips */}
                  <button
                    type="button"
                    onClick={() => setUsageProfile('trips')}
                    className={`flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      usageProfile === 'trips'
                        ? 'border-primary bg-primary/10 shadow-xs'
                        : 'border-border/80 hover:border-primary/50 bg-muted/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Bike className="h-4 w-4 text-emerald-500" />
                      {usageProfile === 'trips' && <Check className="h-3.5 w-3.5 text-primary" />}
                    </div>
                    <span className="text-xs font-semibold text-foreground">Viagens & Fim de Semana</span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">
                      Passeios de fim de semana, viagens em rodovias e encontros de moto.
                    </span>
                  </button>

                  {/* Tech Recruiter */}
                  <button
                    type="button"
                    onClick={() => setUsageProfile('tech_recruiter')}
                    className={`flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      usageProfile === 'tech_recruiter'
                        ? 'border-primary bg-primary/10 shadow-xs'
                        : 'border-border/80 hover:border-primary/50 bg-muted/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Code2 className="h-4 w-4 text-indigo-500" />
                      {usageProfile === 'tech_recruiter' && <Check className="h-3.5 w-3.5 text-primary" />}
                    </div>
                    <span className="text-xs font-semibold text-foreground">Recrutador / Avaliador Tech</span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">
                      Avaliando a arquitetura (Next.js 16, Neon Postgres, Turbopack, Vitest).
                    </span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: DADOS DA MOTO (MARCA E MODELO SEPARADOS) */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3.5"
              >
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Qual moto você quer monitorar?
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Informe a marca e o modelo separadamente para calibrar sua garagem.
                  </p>
                </div>

                {/* Quick Brand Pills */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-muted-foreground">Selecione a Marca:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_BRANDS.map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => {
                          setMotoBrand(b)
                          const models = BRAND_MODELS[b]
                          if (models && models.length > 0) {
                            setMotoModel(models[0])
                          }
                        }}
                        className={`text-[11px] px-2 py-1 rounded-md border transition-all cursor-pointer font-medium ${
                          motoBrand.toLowerCase() === b.toLowerCase()
                            ? 'bg-primary text-primary-foreground border-primary shadow-2xs font-semibold'
                            : 'bg-muted/30 text-muted-foreground hover:text-foreground border-border hover:bg-muted/60'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 pt-1">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Marca Input */}
                    <div className="grid gap-1.5">
                      <Label htmlFor="onboarding-brand" className="text-xs font-semibold">
                        Marca *
                      </Label>
                      <Input
                        id="onboarding-brand"
                        value={motoBrand}
                        onChange={e => setMotoBrand(e.target.value)}
                        placeholder="Ex: Honda, Yamaha"
                        required
                        className="text-xs"
                      />
                    </div>

                    {/* Modelo Input */}
                    <div className="grid gap-1.5">
                      <Label htmlFor="onboarding-model" className="text-xs font-semibold">
                        Modelo *
                      </Label>
                      <Input
                        id="onboarding-model"
                        value={motoModel}
                        onChange={e => setMotoModel(e.target.value)}
                        placeholder="Ex: Bros 160, Titan 160"
                        required
                        className="text-xs"
                      />
                    </div>
                  </div>

                  {/* Quick Model Suggestions */}
                  {suggestedModels && suggestedModels.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground">Modelos sugeridos da {motoBrand}:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestedModels.map(m => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setMotoModel(m)}
                            className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                              motoModel === m
                                ? 'bg-primary/20 text-primary border-primary/40 font-semibold'
                                : 'bg-muted/20 text-muted-foreground hover:text-foreground border-border'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="onboarding-year" className="text-xs font-semibold">
                        Ano de Fabricação
                      </Label>
                      <Input
                        id="onboarding-year"
                        value={motoYear}
                        onChange={e => setMotoYear(e.target.value)}
                        placeholder="Ex: 2024"
                        className="text-xs"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="onboarding-plate" className="text-xs font-semibold">
                        Placa (Opcional)
                      </Label>
                      <Input
                        id="onboarding-plate"
                        value={motoPlate}
                        onChange={e => setMotoPlate(e.target.value.toUpperCase())}
                        placeholder="Ex: BRA-2E19"
                        className="text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="onboarding-odo" className="text-xs font-semibold">
                        Quilometragem Atual (Odômetro)
                      </Label>
                      <span className="text-[10px] text-muted-foreground">Ponto de partida do painel</span>
                    </div>
                    <Input
                      id="onboarding-odo"
                      type="number"
                      value={currentOdometer}
                      onChange={e => setCurrentOdometer(e.target.value)}
                      placeholder="Ex: 12500"
                      className="text-xs font-mono"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: PREFERÊNCIA DE CORES (IDENTIDADE VISUAL MOTORSPORT) */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3.5"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">
                      Qual é a cor ou estilo da sua moto?
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Selecione a identidade visual que mais combina com seu estilo e montadora.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {(Object.keys(ACCENT_CONFIG) as AccentColor[]).map(color => {
                    const cfg = ACCENT_CONFIG[color]
                    const isSelected = preferredColor === color

                    return (
                      <div
                        key={color}
                        onClick={() => setPreferredColor(color)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40'
                            : 'border-border/80 bg-card hover:bg-muted/40 hover:border-border'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`h-6 w-6 rounded-full shadow-xs flex-shrink-0 ${cfg.bgClass}`}
                          />
                          <div>
                            <p className="text-xs font-semibold text-foreground leading-tight">
                              {cfg.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              {cfg.brand}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                    )
                  })}
                </div>

                <p className="text-[11px] text-muted-foreground text-center pt-1">
                  Você poderá alterar essa cor a qualquer momento na aba <strong>Configurações</strong>.
                </p>
              </motion.div>
            )}

            {/* STEP 4: SUCESSO & CONCLUSÃO */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 text-center py-2"
              >
                <div className="flex justify-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm">
                    <CheckCircle2 className="h-7 w-7" />
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Tudo pronto para rodar, {firstName}! 🏍️
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Sua moto foi cadastrada com sucesso e o painel já está personalizado com as suas preferências.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-3.5 text-xs space-y-2 text-left max-w-md mx-auto font-mono">
                  <div className="flex justify-between items-center border-b border-border/60 pb-1.5">
                    <span className="text-muted-foreground">Veículo Cadastrado:</span>
                    <span className="font-semibold text-foreground">
                      {motoBrand} • {motoModel} ({motoYear})
                    </span>
                  </div>

                  {motoPlate && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Placa:</span>
                      <span className="font-semibold text-foreground">{motoPlate}</span>
                    </div>
                  )}

                  {currentOdometer && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Odômetro Inicial:</span>
                      <span className="font-semibold text-foreground">
                        {Number(currentOdometer).toLocaleString('pt-BR')} km
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Perfil de Uso:</span>
                    <span className="font-semibold text-foreground">
                      {usageProfile === 'delivery'
                        ? 'Trabalho / Entregas'
                        : usageProfile === 'trips'
                        ? 'Viagens & Passeios'
                        : usageProfile === 'tech_recruiter'
                        ? 'Avaliador Tech'
                        : 'Dia a Dia'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-0.5">
                    <span className="text-muted-foreground">Identidade Visual:</span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-3 w-3 rounded-full ${ACCENT_CONFIG[preferredColor].bgClass}`}
                      />
                      <span className="font-semibold text-primary">
                        {ACCENT_CONFIG[preferredColor].name}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Navigation Buttons */}
          <div className="flex items-center justify-between pt-5 mt-3 border-t border-border/80">
            <div>
              {step > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="text-xs gap-1 cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Voltar
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  disabled={isSubmitting}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Pular tour
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {step < 4 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleNext}
                  className="text-xs gap-1.5 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                >
                  {step === 0 ? 'Iniciar Configuração' : 'Continuar'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleFinish}
                  disabled={isSubmitting}
                  className="text-xs gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {isSubmitting ? 'Configurando...' : 'Entrar no Dashboard'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

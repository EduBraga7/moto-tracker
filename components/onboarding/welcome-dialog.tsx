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
  Briefcase,
  Navigation,
  PackageCheck,
  Code2,
  Fuel,
  Gauge,
  ShieldCheck,
  Zap,
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

export type UsageProfile = 'daily' | 'delivery' | 'trips' | 'tech_recruiter'

export interface OnboardingData {
  usageProfile: UsageProfile
  motoName: string
  motoModel: string
  motoPlate: string
  motoYear: string
  currentOdometer?: number
  preferredFuel: 'gasoline' | 'premium' | 'ethanol'
  consumptionTarget: number
}

interface WelcomeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName: string
  userAvatar?: string
  initialMotoModel?: string
  onComplete: (data: OnboardingData) => Promise<void> | void
}

const POPULAR_MOTOS = [
  'Honda CB 300F Twister',
  'Yamaha Fazer FZ25',
  'Honda CG 160 Titan',
  'Yamaha MT-03',
  'Honda Bros 160',
  'Honda XRE 300 / Sahara',
  'Royal Enfield Hunter 350'
]

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

  // Form State
  const [usageProfile, setUsageProfile] = useState<UsageProfile>('daily')
  const [motoName, setMotoName] = useState('Minha Moto')
  const [motoModel, setMotoModel] = useState(initialMotoModel || 'Honda CB 300F Twister')
  const [motoYear, setMotoYear] = useState('2024')
  const [motoPlate, setMotoPlate] = useState('BRA-2E19')
  const [currentOdometer, setCurrentOdometer] = useState<string>('12500')
  const [preferredFuel, setPreferredFuel] = useState<'gasoline' | 'premium' | 'ethanol'>('gasoline')
  const [consumptionTarget, setConsumptionTarget] = useState<number>(35)

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
        motoModel: motoModel.trim() || 'Honda CB 300F Twister',
        motoPlate: motoPlate.trim().toUpperCase(),
        motoYear: motoYear.trim() || '2024',
        currentOdometer: currentOdometer ? Number(currentOdometer) : undefined,
        preferredFuel,
        consumptionTarget
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
        motoModel: initialMotoModel || 'Honda CB 300F Twister',
        motoPlate: 'BRA-2E19',
        motoYear: '2024',
        preferredFuel: 'gasoline',
        consumptionTarget: 35
      })
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const stepsList = [
    { title: 'Boas-vindas', desc: 'Introdução' },
    { title: 'Perfil de Uso', desc: 'Objetivo' },
    { title: 'Sua Moto', desc: 'Dados técnicos' },
    { title: 'Metas', desc: 'Consumo' },
    { title: 'Pronto!', desc: 'Conclusão' }
  ]

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
                      Sua conta já está autenticada e conectada ao banco Neon Postgres.
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
                        <p className="font-semibold text-foreground">Cálculo Preciso de KM/L</p>
                        <p className="text-muted-foreground text-[11px]">
                          Médias reais tanque-cheio a cada abastecimento com odômetro calibrado.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border/70 bg-muted/20">
                      <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">Custo por Quilômetro (R$/KM)</p>
                        <p className="text-muted-foreground text-[11px]">
                          Saiba exatamente quanto custa rodar cada quilômetro com a sua moto.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border/70 bg-muted/20">
                      <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">Sincronização Segura na Nuvem</p>
                        <p className="text-muted-foreground text-[11px]">
                          Seus registros salvos em tempo real com segurança e sem perda de dados.
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
                    Isso personaliza os alertas e indicadores de consumo do seu painel.
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
                      Deslocamento diário para trabalho, faculdade e trânsito da cidade.
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
                      iFood, Rappi, Loggi ou motoboy. Foco total em custo/km e margem de lucro.
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
                      Passeios na estrada, viagens e autonomia do tanque em rodovias.
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
                      Conhecendo o projeto (Next.js 16, Neon Postgres, Clerk, Turbopack).
                    </span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: DADOS DA MOTO */}
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
                    Preencha os dados da sua moto atual para personalizar as métricas.
                  </p>
                </div>

                {/* Quick Model Selector */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-muted-foreground">Modelos populares rápidos:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_MOTOS.slice(0, 4).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMotoModel(m)}
                        className={`text-[11px] px-2 py-1 rounded-md border transition-colors cursor-pointer ${
                          motoModel === m
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted/30 text-muted-foreground hover:text-foreground border-border'
                        }`}
                      >
                        {m.split(' ')[1]} {m.split(' ')[2] || ''}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 pt-1">
                  <div className="grid gap-1.5">
                    <Label htmlFor="onboarding-model" className="text-xs font-semibold">
                      Modelo da Moto *
                    </Label>
                    <Input
                      id="onboarding-model"
                      value={motoModel}
                      onChange={e => setMotoModel(e.target.value)}
                      placeholder="Ex: Honda CB 300F Twister"
                      required
                      className="text-xs"
                    />
                  </div>

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
                      <span className="text-[10px] text-muted-foreground">Ponto de partida</span>
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

            {/* STEP 3: PREFERÊNCIAS & META */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Combustível e Meta de Consumo
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Defina o combustível habitual e a média que você deseja alcançar.
                  </p>
                </div>

                {/* Combustível Habitual */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Combustível Habitual</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'gasoline', label: 'Gasolina Comum', desc: 'Mais usual' },
                      { id: 'premium', label: 'Aditivada', desc: 'Limpeza do motor' },
                      { id: 'ethanol', label: 'Etanol / Álcool', desc: 'Mais ecológico' }
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setPreferredFuel(f.id as any)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          preferredFuel === f.id
                            ? 'border-primary bg-primary/10 font-semibold text-primary'
                            : 'border-border hover:border-primary/40 text-muted-foreground'
                        }`}
                      >
                        <Fuel className="h-4 w-4 mx-auto mb-1 opacity-80" />
                        <span className="text-xs block">{f.label}</span>
                        <span className="text-[10px] opacity-70 block">{f.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Meta de Consumo */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Meta de Consumo Médio</Label>
                    <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                      {consumptionTarget} km/l
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {[28, 32, 35, 40, 45].map(target => (
                      <button
                        key={target}
                        type="button"
                        onClick={() => setConsumptionTarget(target)}
                        className={`flex-1 py-1.5 text-xs rounded-lg border font-mono transition-colors cursor-pointer ${
                          consumptionTarget === target
                            ? 'bg-primary text-primary-foreground border-primary font-bold'
                            : 'bg-muted/20 text-muted-foreground hover:text-foreground border-border'
                        }`}
                      >
                        {target}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    O painel comparará seus abastecimentos reais contra a meta de <strong>{consumptionTarget} km/l</strong>.
                  </p>
                </div>
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
                    Suas configurações foram preparadas e sincronizadas. Agora você tem controle absoluto da sua moto.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs space-y-1.5 text-left max-w-md mx-auto font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Moto:</span>
                    <span className="font-semibold text-foreground">{motoModel} ({motoYear})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Perfil:</span>
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
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Meta de Consumo:</span>
                    <span className="font-semibold text-primary">{consumptionTarget} km/l</span>
                  </div>
                  {currentOdometer && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Odômetro Inicial:</span>
                      <span className="font-semibold text-foreground">{Number(currentOdometer).toLocaleString('pt-BR')} km</span>
                    </div>
                  )}
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

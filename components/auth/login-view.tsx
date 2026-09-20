'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bike,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Fuel,
  Gauge,
  Wallet,
  Calendar,
  KeyRound,
  Shield,
  Check,
  Droplet
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  loginAction,
  registerAction,
  quickDemoLoginAction,
  type AuthUser
} from '@/app/actions'

interface LoginViewProps {
  onLogin: (user: AuthUser) => void
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState<string>('')

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSubmitted, setForgotSubmitted] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Password strength calculation
  const passwordStrength = () => {
    if (!password) return { score: 0, label: 'Vazia', color: 'bg-zinc-700' }
    let score = 0
    if (password.length >= 6) score += 1
    if (password.length >= 10) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    if (score <= 1) return { score: 1, label: 'Fraca', color: 'bg-red-500' }
    if (score === 2) return { score: 2, label: 'Média', color: 'bg-amber-500' }
    if (score === 3) return { score: 3, label: 'Boa', color: 'bg-blue-500' }
    return { score: 4, label: 'Excelente', color: 'bg-emerald-500' }
  }

  // Smooth auth sequence
  // Standard form submit with Neon database authentication
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Por favor, informe seu e-mail e sua senha.')
      return
    }

    if (mode === 'signup' && !name.trim()) {
      setError('Por favor, informe seu nome completo.')
      return
    }

    setLoading(true)
    setLoadingStep(
      mode === 'signin'
        ? 'Consultando credenciais no Neon Postgres...'
        : 'Criando sua conta e garagem no Neon Postgres...'
    )

    try {
      if (mode === 'signin') {
        const res = await loginAction(email, password)
        if (!res.success || !res.user) {
          setError(res.error || 'Falha ao autenticar. Verifique seus dados.')
          setLoading(false)
          return
        }

        setLoadingStep('Credenciais autenticadas! Carregando telemetria...')
        setTimeout(() => {
          setLoading(false)
          onLogin(res.user!)
        }, 400)
      } else {
        const res = await registerAction(name, email, password)
        if (!res.success || !res.user) {
          setError(res.error || 'Falha ao criar conta. Tente novamente.')
          setLoading(false)
          return
        }

        setLoadingStep('Conta criada com sucesso! Inicializando sua garagem...')
        setTimeout(() => {
          setLoading(false)
          onLogin(res.user!)
        }, 400)
      }
    } catch (err) {
      console.error('Erro na autenticação:', err)
      setError('Erro de comunicação com o servidor Neon. Tente novamente.')
      setLoading(false)
    }
  }

  // Quick 1-Click Recruiter/Demo Access
  const handleDemoAccess = async () => {
    setLoading(true)
    setError(null)
    setLoadingStep('Conectando ao perfil de demonstração no Neon...')

    try {
      const res = await quickDemoLoginAction('recruiter')
      if (res.user) {
        setEmail(res.user.email)
        setPassword('demo-portfolio-2026')
        setLoadingStep('Acesso autorizado! Carregando painel do avaliador...')
        setTimeout(() => {
          setLoading(false)
          onLogin(res.user!)
        }, 400)
      }
    } catch {
      setLoading(false)
      onLogin({
        id: 2,
        name: 'Avaliador / Recrutador',
        email: 'recrutador@tech-review.com',
        role: 'Avaliador Convidado (Acesso Completo)'
      })
    }
  }

  // Handle forgot password request
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail) return
    setForgotLoading(true)
    setTimeout(() => {
      setForgotLoading(false)
      setForgotSubmitted(true)
    }, 650)
  }

  const strength = passwordStrength()

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-background text-foreground selection:bg-primary/20 overflow-hidden">
      
      {/* ========================================================================= */}
      {/* ================= LEFT SHOWCASE: REALISTIC APP PREVIEW ================== */}
      {/* ========================================================================= */}
      <div className="relative hidden lg:flex lg:w-7/12 flex-col justify-between p-6 xl:p-10 bg-zinc-950 text-white overflow-hidden border-r border-zinc-800/80 h-full">
        
        {/* Subtle Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />

        {/* Subtle Grid Background Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '28px 28px'
          }}
        />

        {/* Top Header Bar */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-red-700 text-white shadow-md shadow-primary/25 ring-1 ring-white/20">
              <Bike className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white">Moto Tracker</span>
              <p className="text-[11px] text-zinc-400 font-mono">
                Gestão de Combustível & Quilometragem
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 px-2.5 py-0.5 text-[11px] font-mono text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sincronização em Nuvem</span>
          </div>
        </div>

        {/* Center Presentation: Realistic App Summary Card */}
        <div className="relative z-10 max-w-lg xl:max-w-xl my-auto space-y-3.5 xl:space-y-4 py-2">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/90 px-2.5 py-0.5 text-[11px] text-zinc-300 backdrop-blur-md">
              <Fuel className="h-3 w-3 text-primary" />
              <span>Controle Inteligente de Despesas</span>
            </div>
            <h1 className="text-2xl xl:text-3xl font-black tracking-tight text-white leading-tight">
              Controle simples e preciso do consumo <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-amber-300">
                e dos gastos com a sua moto.
              </span>
            </h1>
            <p className="text-xs xl:text-sm text-zinc-400 leading-relaxed max-w-lg">
              Registre abastecimentos em segundos, acompanhe o rendimento real em km/L
              sem distorções em tanques parciais e tenha clareza do seu custo por quilômetro rodado.
            </p>
          </div>

          {/* ================= REALISTIC FUEL DASHBOARD CARD ================= */}
          <div className="rounded-xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900/95 to-zinc-950/95 p-4 xl:p-5 backdrop-blur-2xl shadow-xl space-y-3.5 relative overflow-hidden">
            
            {/* Header: Vehicle & Odometer */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-zinc-800/90 border border-zinc-700/60 text-primary shadow-inner">
                  <Bike className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs xl:text-sm font-bold text-white">Honda CB 300F Twister</p>
                    <Badge variant="outline" className="border-zinc-700 text-zinc-300 text-[9px] font-mono px-1.5 py-0">
                      BRA-2E19
                    </Badge>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
                    <Gauge className="h-3 w-3 text-primary" />
                    Odômetro Atual: <strong className="text-zinc-200">14.850 km</strong>
                  </p>
                </div>
              </div>

              <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Ativo
              </span>
            </div>

            {/* Metric KPI Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Average Consumption */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-2.5 xl:p-3 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                  <Fuel className="h-3 w-3 text-primary" /> Média Real
                </span>
                <div className="mt-1.5">
                  <p className="text-xl xl:text-2xl font-black font-mono text-white tracking-tight">
                    29,4 <span className="text-[10px] font-normal text-zinc-400">km/L</span>
                  </p>
                  <span className="text-[9px] text-emerald-400 font-medium">+1.2 km/L no mês</span>
                </div>
              </div>

              {/* Cost per Km */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-2.5 xl:p-3 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                  <Wallet className="h-3 w-3 text-amber-400" /> Custo / km
                </span>
                <div className="mt-1.5">
                  <p className="text-xl xl:text-2xl font-black font-mono text-white tracking-tight">
                    R$ 0,20
                  </p>
                  <span className="text-[9px] text-zinc-400 font-mono">gasolina aditivada</span>
                </div>
              </div>

              {/* Range Estimation */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-2.5 xl:p-3 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-400" /> Autonomia
                </span>
                <div className="mt-1.5">
                  <p className="text-xl xl:text-2xl font-black font-mono text-white tracking-tight">
                    ~380 <span className="text-[10px] font-normal text-zinc-400">km</span>
                  </p>
                  <span className="text-[9px] text-zinc-400 font-mono">tanque de 14,1 L</span>
                </div>
              </div>
            </div>

            {/* Last Fueling Detailed Snippet */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-2.5 xl:p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-200 flex items-center gap-1.5 text-[11px]">
                  <Calendar className="h-3 w-3 text-primary" /> Último Abastecimento Registrado
                </span>
                <Badge variant="outline" className="text-[9px] border-primary/30 text-primary bg-primary/10 px-1.5 py-0">
                  Tanque Cheio
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs pt-0.5">
                <div>
                  <span className="text-[9px] text-zinc-400 block">Litros</span>
                  <strong className="text-zinc-200 font-mono text-[11px]">11,20 L</strong>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-400 block">Valor Total</span>
                  <strong className="text-zinc-200 font-mono text-[11px]">R$ 64,96</strong>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-400 block">Preço / Litro</span>
                  <strong className="text-zinc-200 font-mono text-[11px]">R$ 5,80</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Core Value Props */}
          <div className="grid grid-cols-3 gap-2.5 pt-0.5">
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-2.5 flex flex-col gap-0.5">
              <Droplet className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-semibold text-white">Tanques Parciais</span>
              <span className="text-[10px] text-zinc-400 leading-tight">Cálculo correto sem distorcer médias</span>
            </div>
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-2.5 flex flex-col gap-0.5">
              <Wallet className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[11px] font-semibold text-white">Controle de Gastos</span>
              <span className="text-[10px] text-zinc-400 leading-tight">Relatórios mensais de despesas</span>
            </div>
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-2.5 flex flex-col gap-0.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[11px] font-semibold text-white">Histórico Seguro</span>
              <span className="text-[10px] text-zinc-400 leading-tight">Backup automático em nuvem</span>
            </div>
          </div>
        </div>

        {/* Footer: Legal & Product Info */}
        <div className="relative z-10 flex items-center justify-between border-t border-zinc-900 pt-3 text-[11px] text-zinc-500 font-mono">
          <span>© 2026 Moto Tracker</span>
          <div className="flex items-center gap-2.5 text-zinc-400">
            <span>Termos</span>
            <span>•</span>
            <span>Privacidade</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ================= RIGHT AUTH PANEL: CLEAN SAAS FORM ===================== */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-8 lg:p-6 xl:p-10 max-w-md xl:max-w-lg mx-auto w-full h-full overflow-hidden">
        
        {/* Top Header: Brand (Mobile) + Theme Toggle */}
        <div className="flex items-center justify-between pb-2 sm:pb-3">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-xs">
              <Bike className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-xs tracking-tight text-foreground">Moto Tracker</span>
              <p className="text-[9px] text-muted-foreground">Gestão de Combustível</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>

        {/* Center Container: Authentication Form */}
        <div className="my-auto space-y-3.5 xl:space-y-4 w-full">

          {/* Mode Switcher Segmented Tabs */}
          <div className="space-y-3">
            <div className="flex rounded-xl bg-muted/80 p-1 border border-border/80">
              <button
                type="button"
                onClick={() => {
                  setMode('signin')
                  setError(null)
                }}
                className={`relative flex-1 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer ${
                  mode === 'signin'
                    ? 'text-foreground font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {mode === 'signin' && (
                  <motion.div
                    layoutId="auth-tab"
                    className="absolute inset-0 rounded-lg bg-card shadow-xs border border-border/60 -z-10"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                Acessar Conta
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('signup')
                  setError(null)
                }}
                className={`relative flex-1 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'text-foreground font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {mode === 'signup' && (
                  <motion.div
                    layoutId="auth-tab"
                    className="absolute inset-0 rounded-lg bg-card shadow-xs border border-border/60 -z-10"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                Criar Conta
              </button>
            </div>

            <div>
              <h2 className="text-xl xl:text-2xl font-extrabold tracking-tight text-foreground">
                {mode === 'signin' ? 'Acesse sua Conta' : 'Comece a Monitorar sua Moto'}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {mode === 'signin'
                  ? 'Informe seu e-mail e senha para acessar seu histórico de abastecimentos.'
                  : 'Crie sua conta gratuitamente para acompanhar consumo, gastos e autonomia.'}
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive flex items-center gap-2"
            >
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-1 overflow-hidden"
                >
                  <Label htmlFor="auth-name" className="text-xs font-medium">
                    Nome Completo
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="auth-name"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Ex: Eduardo Ramos"
                      className="pl-9 h-9 text-xs"
                      required={mode === 'signup'}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <div className="space-y-1">
              <Label htmlFor="auth-email" className="text-xs font-medium">
                E-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="pl-9 h-9 text-xs"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="auth-password" className="text-xs font-medium">
                  Senha
                </Label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email)
                      setForgotSubmitted(false)
                      setIsForgotModalOpen(true)
                    }}
                    className="text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="pl-9 pr-10 h-9 text-xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-muted-foreground hover:text-foreground cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Strength Meter during Registration */}
              {mode === 'signup' && password.length > 0 && (
                <div className="pt-1 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground font-mono">Segurança da senha:</span>
                    <span className="font-bold font-mono">{strength.label}</span>
                  </div>
                  <div className="h-1 w-full bg-muted rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4].map(step => (
                      <div
                        key={step}
                        className={`flex-1 h-full rounded-full transition-all duration-300 ${
                          step <= strength.score ? strength.color : 'bg-muted-foreground/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Remember Device Checkbox */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 text-[11px] text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-border text-primary accent-primary"
                />
                <span>Lembrar credenciais</span>
              </label>
            </div>

            {/* Auth Progress / Submit Button */}
            {loading ? (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-2.5 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-xs font-mono font-medium text-primary">
                  <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                  <span>{loadingStep}</span>
                </div>
                <div className="h-1 w-full bg-primary/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.95, ease: 'easeInOut' }}
                  />
                </div>
              </div>
            ) : (
              <Button
                type="submit"
                className="w-full h-9.5 font-semibold text-xs gap-2 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-md shadow-primary/20"
              >
                {mode === 'signin' ? (
                  <>
                    <span>Entrar no Painel</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <span>Criar Minha Conta</span>
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </form>

          {/* Social SSO */}
          <div className="space-y-2.5 pt-0.5">
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-border" />
              <span className="bg-background px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                Ou continue com
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={handleDemoAccess}
                className="h-8.5 text-xs gap-2 border-border/80 hover:bg-muted cursor-pointer"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                Google
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={handleDemoAccess}
                className="h-8.5 text-xs gap-2 border-border/80 hover:bg-muted cursor-pointer"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </Button>
            </div>
          </div>

          {/* Quick Demo Access */}
          <div className="rounded-xl border border-border/80 bg-muted/30 p-2.5 flex items-center justify-between gap-2.5">
            <div className="space-y-0.5">
              <p className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" />
                Quer testar antes de cadastrar?
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Acesse uma demonstração com abastecimentos já preenchidos.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDemoAccess}
              disabled={loading}
              className="text-xs font-semibold shrink-0 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors h-7.5 px-2.5"
            >
              Demonstração
            </Button>
          </div>
        </div>

        {/* Bottom Security Note */}
        <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground font-mono">
          <span className="flex items-center gap-1">
            <Shield className="h-3 w-3 text-emerald-500" />
            <span>Criptografia SSL</span>
          </span>
          <span>
            Moto Tracker
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ================= PASSWORD RECOVERY MODAL =============================== */}
      {/* ========================================================================= */}
      <Dialog open={isForgotModalOpen} onOpenChange={setIsForgotModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <KeyRound className="h-4 w-4" />
              </div>
              Recuperação de Senha
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Informe o endereço de e-mail da sua conta para receber o link de redefinição.
            </DialogDescription>
          </DialogHeader>

          {forgotSubmitted ? (
            <div className="py-4 space-y-3 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Check className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">E-mail de recuperação enviado!</p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Se o endereço <strong className="text-foreground">{forgotEmail}</strong> estiver cadastrado, você receberá o link em instantes.
                </p>
              </div>
              <Button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="mt-2 text-xs h-9 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Voltar ao Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="forgot-email-input" className="text-xs font-medium">
                  E-mail cadastrado
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="forgot-email-input"
                    type="email"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="pl-9 h-10 text-xs"
                    required
                  />
                </div>
              </div>

              <DialogFooter className="pt-2 flex sm:justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="text-xs h-9"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={forgotLoading || !forgotEmail}
                  className="text-xs h-9 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {forgotLoading ? 'Enviando...' : 'Enviar Instruções'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

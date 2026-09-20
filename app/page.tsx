'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays,
  Check,
  Droplet,
  Fuel,
  Gauge,
  Plus,
  Route,
  Wallet,
  TrendingUp,
  TrendingDown,
  Zap,
  LayoutDashboard,
  History,
  Bike,
  Camera,
  Pencil,
  Trash2,
  Upload,
  Loader2,
  Menu,
  X,
  ChevronRight,
  Sun,
  Moon,
  BarChart3,
  Sparkles,
  Settings,
  Laptop,
  CheckCircle2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  ChevronsUpDown,
  UserCheck,
  ShieldCheck,
  LogOut
} from 'lucide-react'
import { LoginView } from '@/components/auth/login-view'
import { ClerkAuthSync } from '@/components/auth/clerk-auth-sync'
import { useTheme } from 'next-themes'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import { type AccentColor, ACCENT_CONFIG } from '@/components/accent-picker'
import {
  getMoto,
  getMotos,
  addMotoAction,
  deleteMotoAction,
  updateMotoAction,
  getFuelings,
  addFuelingAction,
  deleteFuelingAction,
  updateUserProfileAction,
  type Fueling,
  type Moto,
  type AuthUser
} from '@/app/actions'
import { compressImage } from '@/lib/image-utils'
import { WelcomeDialog, type OnboardingData } from '@/components/onboarding/welcome-dialog'
import { GarageDialog } from '@/components/garage/garage-dialog'
import { UserProfileDialog } from '@/components/profile/user-profile-dialog'

const defaultMoto: Moto = {
  id: 1,
  name: 'Minha Moto',
  model: 'Honda CB 300F Twister',
  plate: 'BRA-2E19',
  year: '2024',
  photoUrl: ''
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${date}T12:00:00`))

const formatMonth = (dateString: string) => {
  const [year, month] = dateString.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  const formatted = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

const formatMoney = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Page() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [accent, setAccent] = useState<AccentColor>('red')
  const [fuelings, setFuelings] = useState<Fueling[]>([])
  const [motos, setMotos] = useState<Moto[]>([defaultMoto])
  const [selectedMotoId, setSelectedMotoId] = useState<number>(1)
  const [isGarageDialogOpen, setIsGarageDialogOpen] = useState(false)

  const currentMoto = useMemo(() => {
    return motos.find(m => m.id === selectedMotoId) || motos[0] || defaultMoto
  }, [motos, selectedMotoId])

  // Backward-compatible alias
  const moto = currentMoto

  const [loading, setLoading] = useState(true)
  const [savingMoto, setSavingMoto] = useState(false)
  const [savingFueling, setSavingFueling] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isMotoDialogOpen, setIsMotoDialogOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'statistics' | 'history' | 'garage' | 'settings'>('dashboard')
  const [statView, setStatView] = useState<'monthly' | 'yearly'>('monthly')
  const [statYear, setStatYear] = useState<string>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
    try {
      const savedAccent = (localStorage.getItem('moto_tracker_accent') as AccentColor) || 'red'
      setAccent(savedAccent)
      document.documentElement.setAttribute('data-accent', savedAccent)
    } catch {
      document.documentElement.setAttribute('data-accent', 'red')
    }
  }, [])

  const changeAccent = (newAccent: AccentColor) => {
    setAccent(newAccent)
    document.documentElement.setAttribute('data-accent', newAccent)
    try {
      localStorage.setItem('moto_tracker_accent', newAccent)
    } catch {
      // storage unavailable
    }
  }

  // Load backend data scoped by user
  const loadData = async (userId?: number) => {
    try {
      setLoading(true)
      const [loadedMotos, loadedFuelings] = await Promise.all([
        getMotos(userId),
        getFuelings(userId)
      ])
      if (loadedMotos && loadedMotos.length > 0) {
        setMotos(loadedMotos)
        let activeId = loadedMotos[0].id
        if (typeof window !== 'undefined') {
          const savedActiveId = localStorage.getItem(`moto_tracker_active_moto_${userId || 'default'}`)
          if (savedActiveId && loadedMotos.some(m => m.id === Number(savedActiveId))) {
            activeId = Number(savedActiveId)
          }
        }
        setSelectedMotoId(activeId)
      }
      if (loadedFuelings) {
        setFuelings(loadedFuelings)
      }

      // Trigger welcome questionnaire if user hasn't completed it yet
      if (userId && typeof window !== 'undefined') {
        const onboardingDone = localStorage.getItem(`moto_onboarding_completed_${userId}`)
        if (!onboardingDone) {
          setIsWelcomeOpen(true)
        }
      }
    } catch (error) {
      console.error('Falha ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  // Authentication & Session state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false)

  // Connected User State
  const [userProfile, setUserProfile] = useState<AuthUser>({
    id: 1,
    name: 'Eduardo Ramos',
    email: 'eduardo@mototracker.app',
    role: 'Proprietário'
  })
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)

  // Load auth state & user profile from localStorage or OAuth redirect
  useEffect(() => {
    try {
      // Check if redirected from Google/Social OAuth callback
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search)
        const authSuccess = searchParams.get('auth_success')
        const userParam = searchParams.get('user')
        if (authSuccess && userParam) {
          try {
            const user = JSON.parse(decodeURIComponent(userParam)) as AuthUser
            handleLogin(user)
            window.history.replaceState({}, document.title, window.location.pathname)
            return
          } catch (e) {
            console.error('Failed to parse OAuth user param:', e)
          }
        }
      }

      const savedAuth = localStorage.getItem('moto_tracker_auth')
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth)
        if (parsed.authenticated) {
          setIsAuthenticated(true)
          if (parsed.user) {
            const cleanUser = {
              ...parsed.user,
              role: 'Conta Verificada'
            }
            setUserProfile(cleanUser)
            loadData(cleanUser.id)
            return
          }
        }
      }
      // If nothing found in storage, prompt login screen
      setIsAuthenticated(false)
    } catch {
      setIsAuthenticated(false)
    }
  }, [])

  const handleLogin = (user: AuthUser) => {
    setUserProfile(user)
    setIsAuthenticated(true)
    try {
      localStorage.setItem('moto_tracker_auth', JSON.stringify({
        authenticated: true,
        user
      }))
      localStorage.setItem('moto_user_profile', JSON.stringify(user))
    } catch {
      // ignore
    }
    loadData(user.id)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    try {
      localStorage.removeItem('moto_tracker_auth')
    } catch {
      // ignore
    }
    setIsUserDialogOpen(false)
  }

  const handleSaveUserProfile = async (updated: AuthUser) => {
    setUserProfile(updated)
    try {
      localStorage.setItem('moto_user_profile', JSON.stringify(updated))
      const savedAuth = localStorage.getItem('moto_tracker_auth')
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth)
        localStorage.setItem('moto_tracker_auth', JSON.stringify({ ...parsed, user: updated }))
      }
    } catch {
      // ignore
    }
    if (updated.id) {
      await updateUserProfileAction(updated.id, { name: updated.name })
    }
    setIsUserDialogOpen(false)
  }

  const userInitials = useMemo(() => {
    const parts = userProfile.name.trim().split(' ').filter(Boolean)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return (parts[0]?.substring(0, 2) || 'ED').toUpperCase()
  }, [userProfile.name])

  // Moto edit form state
  const [motoForm, setMotoForm] = useState<Moto>(defaultMoto)
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false)

  const openMotoDialog = () => {
    setMotoForm(moto)
    setIsMotoDialogOpen(true)
  }

  const saveMoto = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingMoto(true)
    try {
      const res = await updateMotoAction({
        name: motoForm.name,
        model: motoForm.model,
        plate: motoForm.plate,
        year: motoForm.year,
        photoUrl: motoForm.photoUrl
      }, userProfile.id, currentMoto.id)

      if (res && !res.success) {
        alert('Aviso ao salvar moto: ' + (res.error || 'Erro desconhecido'))
      } else {
        setMotos(prev =>
          prev.map(m => (m.id === currentMoto.id ? { ...m, ...motoForm } : m))
        )
        setIsMotoDialogOpen(false)
      }
    } catch (err) {
      console.error('Erro ao salvar moto:', err)
      alert('Erro de conexão ao salvar moto. Verifique sua conexão e tente novamente.')
    } finally {
      setSavingMoto(false)
    }
  }

  const handleSelectMoto = (motoId: number) => {
    setSelectedMotoId(motoId)
    try {
      localStorage.setItem(`moto_tracker_active_moto_${userProfile.id}`, String(motoId))
    } catch {
      // ignore
    }
  }

  const handleAddMoto = async (motoData: {
    name: string
    model: string
    plate: string
    year: string
    photoUrl: string
  }) => {
    const res = await addMotoAction(motoData, userProfile.id)
    if (res.success && res.moto) {
      const newMoto = res.moto
      setMotos(prev => [...prev, newMoto])
      handleSelectMoto(newMoto.id)
    } else {
      throw new Error(res.error || 'Erro ao adicionar moto')
    }
  }

  const handleUpdateMoto = async (
    motoId: number,
    motoData: {
      name: string
      model: string
      plate: string
      year: string
      photoUrl: string
    }
  ) => {
    const res = await updateMotoAction(motoData, userProfile.id, motoId)
    if (res.success) {
      setMotos(prev =>
        prev.map(m => (m.id === motoId ? { ...m, ...motoData } : m))
      )
    } else {
      throw new Error(res.error || 'Erro ao atualizar moto')
    }
  }

  const handleDeleteMoto = async (motoId: number) => {
    const res = await deleteMotoAction(motoId, userProfile.id)
    if (res.success) {
      setMotos(prev => {
        const next = prev.filter(m => m.id !== motoId)
        if (selectedMotoId === motoId && next.length > 0) {
          handleSelectMoto(next[0].id)
        }
        return next
      })
      setFuelings(prev => prev.filter(f => f.motoId !== motoId))
    } else {
      throw new Error(res.error || 'Erro ao excluir moto')
    }
  }

  const handleCompleteOnboarding = async (data: OnboardingData) => {
    try {
      // 1. Update moto in Neon Postgres
      await updateMotoAction({
        name: data.motoName,
        model: data.motoModel,
        plate: data.motoPlate,
        year: data.motoYear,
        photoUrl: moto.photoUrl || ''
      }, userProfile.id)

      // 2. If odometer was provided, save as baseline for first fueling prompt
      if (data.currentOdometer && typeof window !== 'undefined') {
        localStorage.setItem(`moto_baseline_odometer_${userProfile.id}`, String(data.currentOdometer))
      }

      // 3. Update local moto state
      setMotos(prev =>
        prev.map(m =>
          m.id === currentMoto.id
            ? {
                ...m,
                name: data.motoName,
                model: data.motoModel,
                plate: data.motoPlate,
                year: data.motoYear
              }
            : m
        )
      )

      // 4. Save completion flags in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`moto_onboarding_completed_${userProfile.id}`, 'true')
        localStorage.setItem(`moto_usage_profile_${userProfile.id}`, data.usageProfile)
        localStorage.setItem(`moto_target_consumption_${userProfile.id}`, String(data.consumptionTarget))
      }
    } catch (err) {
      console.error('Erro ao concluir onboarding:', err)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG ou WebP).')
      return
    }

    setIsCompressingPhoto(true)
    try {
      // Comprime automaticamente fotos pesadas de celulares (para max 1000px e ~100KB)
      const compressedUrl = await compressImage(file, 1000, 1000, 0.82)
      setMotoForm(prev => ({ ...prev, photoUrl: compressedUrl }))
    } catch (err) {
      console.error('Erro ao comprimir imagem, usando fallback:', err)
      const reader = new FileReader()
      reader.onloadend = () => {
        setMotoForm(prev => ({ ...prev, photoUrl: reader.result as string }))
      }
      reader.readAsDataURL(file)
    } finally {
      setIsCompressingPhoto(false)
      if (e.target) e.target.value = ''
    }
  }

  // Fuelings scoped to active motorcycle
  const activeMotoFuelings = useMemo(() => {
    return fuelings.filter(f => !f.motoId || f.motoId === currentMoto.id)
  }, [fuelings, currentMoto.id])

  // Extract unique months (YYYY-MM) and years (YYYY) from active fuelings
  const availableMonths = useMemo(() => {
    const months = new Set(activeMotoFuelings.map(f => f.date.substring(0, 7)))
    return Array.from(months).sort().reverse()
  }, [activeMotoFuelings])

  const availableYears = useMemo(() => {
    const years = new Set(activeMotoFuelings.map(f => f.date.substring(0, 4)))
    return Array.from(years).sort().reverse()
  }, [activeMotoFuelings])

  const [selectedMonth, setSelectedMonth] = useState<string>('all')

  const [form, setForm] = useState({
    odometer: '',
    liters: '',
    cost: '',
    date: new Date().toISOString().split('T')[0],
    full: true
  })

  const currentOdometer = useMemo(() => {
    if (activeMotoFuelings.length === 0) return 0
    return Math.max(...activeMotoFuelings.map(f => f.odometer))
  }, [activeMotoFuelings])

  // ================= CALCULATION ENGINE (STANDARDIZED & WEIGHTED) =================
  const computedRows = useMemo(() => {
    if (activeMotoFuelings.length === 0) return []

    // Sort ascending by odometer (chronological sequence)
    const chronological = [...activeMotoFuelings].sort((a, b) => a.odometer - b.odometer)

    let accumulatedDistance = 0
    let accumulatedLiters = 0

    const analyzed = chronological.map((current, index) => {
      if (index === 0) {
        return {
          ...current,
          distance: 0,
          efficiency: 0,
          costPerKm: 0,
          pricePerLiter: current.liters > 0 ? current.cost / current.liters : 0,
          isBase: true
        }
      }

      const previous = chronological[index - 1]
      const tripDistance = Math.max(0, current.odometer - previous.odometer)

      accumulatedDistance += tripDistance
      accumulatedLiters += current.liters

      let efficiency = 0
      let costPerKm = tripDistance > 0 && current.cost > 0 ? current.cost / tripDistance : 0
      const pricePerLiter = current.liters > 0 ? current.cost / current.liters : 0

      // If full tank, resolve efficiency for the accumulated cycle
      if (current.full && accumulatedLiters > 0) {
        efficiency = accumulatedDistance / accumulatedLiters
        accumulatedDistance = 0
        accumulatedLiters = 0
      } else if (!current.full) {
        efficiency = 0
      }

      return {
        ...current,
        distance: tripDistance,
        efficiency,
        costPerKm,
        pricePerLiter,
        isBase: false
      }
    })

    return analyzed.reverse()
  }, [activeMotoFuelings])

  // Dashboard filtered metrics (Weighted Mathematical Means)
  const computed = useMemo(() => {
    const filteredRows = selectedMonth === 'all'
      ? computedRows
      : computedRows.filter(row => row.date.startsWith(selectedMonth))

    const totalDistance = filteredRows.reduce((sum, row) => sum + row.distance, 0)
    const totalSpent = filteredRows.reduce((sum, row) => sum + row.cost, 0)
    const tripsWithDistance = filteredRows.filter(row => row.distance > 0)
    const totalLitersForTrips = tripsWithDistance.reduce((sum, row) => sum + row.liters, 0)

    const weightedAverage = totalDistance > 0 && totalLitersForTrips > 0
      ? totalDistance / totalLitersForTrips
      : 0

    const costPerKm = totalDistance > 0 ? totalSpent / totalDistance : 0

    return {
      rows: computedRows,
      filteredRows,
      average: weightedAverage,
      distance: totalDistance,
      spent: totalSpent,
      costPerKm
    }
  }, [computedRows, selectedMonth])

  // Dashboard chart data
  const chartData = useMemo(() => {
    return [...computed.filteredRows]
      .reverse()
      .filter(row => row.efficiency > 0)
      .map(row => ({
        name: formatDate(row.date).split(' de ')[0],
        consumo: Number(row.efficiency.toFixed(1))
      }))
  }, [computed.filteredRows])

  // ================= ADVANCED STATISTICS AGGREGATION =================
  const statisticsData = useMemo(() => {
    const baseList = statYear === 'all'
      ? computedRows
      : computedRows.filter(row => row.date.startsWith(statYear))

    const monthMap = new Map<string, {
      monthKey: string
      year: string
      fuelingsCount: number
      distance: number
      liters: number
      cost: number
      efficiencies: number[]
    }>()

    const yearMap = new Map<string, {
      yearKey: string
      fuelingsCount: number
      distance: number
      liters: number
      cost: number
      efficiencies: number[]
    }>()

    for (const row of baseList) {
      const monthKey = row.date.substring(0, 7)
      const yearKey = row.date.substring(0, 4)

      // Month
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {
          monthKey,
          year: yearKey,
          fuelingsCount: 0,
          distance: 0,
          liters: 0,
          cost: 0,
          efficiencies: []
        })
      }
      const m = monthMap.get(monthKey)!
      m.fuelingsCount += 1
      m.distance += row.distance
      m.liters += row.liters
      m.cost += row.cost
      if (row.efficiency > 0) m.efficiencies.push(row.efficiency)

      // Year
      if (!yearMap.has(yearKey)) {
        yearMap.set(yearKey, {
          yearKey,
          fuelingsCount: 0,
          distance: 0,
          liters: 0,
          cost: 0,
          efficiencies: []
        })
      }
      const y = yearMap.get(yearKey)!
      y.fuelingsCount += 1
      y.distance += row.distance
      y.liters += row.liters
      y.cost += row.cost
      if (row.efficiency > 0) y.efficiencies.push(row.efficiency)
    }

    const monthlyList = Array.from(monthMap.values())
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
      .map(m => {
        const weightedEff = m.distance > 0 && m.liters > 0 ? m.distance / m.liters : 0
        const weightedPrice = m.liters > 0 ? m.cost / m.liters : 0
        const costPerKm = m.distance > 0 ? m.cost / m.distance : 0

        const [y, mon] = m.monthKey.split('-')
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
        const shortName = `${monthNames[Number(mon) - 1]}/${y.slice(2)}`

        return {
          key: m.monthKey,
          label: shortName,
          fullLabel: formatMonth(m.monthKey),
          distance: m.distance,
          liters: Number(m.liters.toFixed(2)),
          cost: Number(m.cost.toFixed(2)),
          efficiency: Number(weightedEff.toFixed(1)),
          pricePerLiter: Number(weightedPrice.toFixed(2)),
          costPerKm: Number(costPerKm.toFixed(2)),
          fuelingsCount: m.fuelingsCount
        }
      })

    const yearlyList = Array.from(yearMap.values())
      .sort((a, b) => a.yearKey.localeCompare(b.yearKey))
      .map(y => {
        const weightedEff = y.distance > 0 && y.liters > 0 ? y.distance / y.liters : 0
        const weightedPrice = y.liters > 0 ? y.cost / y.liters : 0
        const costPerKm = y.distance > 0 ? y.cost / y.distance : 0

        return {
          key: y.yearKey,
          label: y.yearKey,
          fullLabel: `Ano ${y.yearKey}`,
          distance: y.distance,
          liters: Number(y.liters.toFixed(2)),
          cost: Number(y.cost.toFixed(2)),
          efficiency: Number(weightedEff.toFixed(1)),
          pricePerLiter: Number(weightedPrice.toFixed(2)),
          costPerKm: Number(costPerKm.toFixed(2)),
          fuelingsCount: y.fuelingsCount
        }
      })

    const validEfficiencies = baseList.filter(r => r.efficiency > 0).map(r => r.efficiency)
    const validPrices = baseList.filter(r => r.pricePerLiter > 0).map(r => r.pricePerLiter)
    const totalDistance = baseList.reduce((acc, r) => acc + r.distance, 0)
    const totalSpent = baseList.reduce((acc, r) => acc + r.cost, 0)
    const totalLiters = baseList.reduce((acc, r) => acc + r.liters, 0)

    const overallAvgEff = totalDistance > 0 && totalLiters > 0 ? totalDistance / totalLiters : 0
    const overallAvgPrice = totalLiters > 0 ? totalSpent / totalLiters : 0

    const bestEfficiency = validEfficiencies.length ? Math.max(...validEfficiencies) : 0
    const worstEfficiency = validEfficiencies.length ? Math.min(...validEfficiencies) : 0
    const lowestPrice = validPrices.length ? Math.min(...validPrices) : 0
    const highestPrice = validPrices.length ? Math.max(...validPrices) : 0

    return {
      monthlyList,
      yearlyList,
      activeList: statView === 'monthly' ? monthlyList : yearlyList,
      totalDistance,
      totalSpent,
      totalLiters,
      overallAvgEff,
      overallAvgPrice,
      bestEfficiency,
      worstEfficiency,
      lowestPrice,
      highestPrice
    }
  }, [computedRows, statYear, statView])

  const isDark = mounted && resolvedTheme === 'dark'
  const activeColorHex = isDark ? ACCENT_CONFIG[accent].darkHex : ACCENT_CONFIG[accent].lightHex

  const registerFueling = async (event: React.FormEvent) => {
    event.preventDefault()
    const odometer = Number(form.odometer)
    const liters = Number(form.liters)
    const cost = Number(form.cost)

    if (!odometer || !liters) return

    if (currentOdometer > 0 && odometer <= currentOdometer) {
      alert(`A quilometragem informada (${odometer.toLocaleString('pt-BR')} km) deve ser maior que a última registrada (${currentOdometer.toLocaleString('pt-BR')} km).`)
      return
    }

    setSavingFueling(true)
    try {
      const res = await addFuelingAction({
        motoId: currentMoto.id,
        date: form.date,
        odometer,
        liters,
        cost: cost || 0,
        full: form.full
      }, userProfile.id)

      if (res.success && res.fueling) {
        setFuelings(prev => [res.fueling!, ...prev])
      } else {
        setFuelings(prev => [
          { id: Date.now(), motoId: currentMoto.id, date: form.date, odometer, liters, cost: cost || 0, full: form.full },
          ...prev
        ])
      }

      setForm({ odometer: '', liters: '', cost: '', date: new Date().toISOString().split('T')[0], full: true })
      setIsDialogOpen(false)
    } catch (err) {
      console.error('Erro ao adicionar abastecimento:', err)
    } finally {
      setSavingFueling(false)
    }
  }

  const deleteFueling = async (id: number) => {
    setFuelings(prev => prev.filter(f => f.id !== id))
    try {
      await deleteFuelingAction(id)
    } catch (err) {
      console.error('Erro ao remover abastecimento:', err)
    }
  }

  const pageVariants = {
    initial: { opacity: 0, y: 8 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -8 }
  }

  const navItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'statistics', label: 'Estatísticas', icon: BarChart3 },
    { id: 'history', label: 'Histórico', icon: History, count: activeMotoFuelings.length },
    { id: 'garage', label: 'Minha Garagem', icon: Bike, count: motos.length },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ] as const

  // Dialogs
  const renderNewFuelingDialog = () => (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Abastecimento</DialogTitle>
          <DialogDescription>
            Insira os dados do painel e do cupom fiscal da sua moto.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={registerFueling} className="grid gap-4 py-4">
          <div className="rounded-lg border border-border/80 bg-muted/40 p-2.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Bike className="h-3.5 w-3.5 text-primary" /> Moto Selecionada:
            </span>
            <span className="font-semibold text-foreground truncate max-w-[190px]">
              {currentMoto.model} {currentMoto.plate ? `(${currentMoto.plate})` : ''}
            </span>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="odometer">Quilometragem atual (km)</Label>
            <Input
              id="odometer"
              type="number"
              required
              min={currentOdometer > 0 ? currentOdometer + 1 : 1}
              placeholder={`Ex: ${currentOdometer > 0 ? currentOdometer + 250 : 65320}`}
              value={form.odometer}
              onChange={e => setForm({ ...form, odometer: e.target.value })}
            />
            {currentOdometer > 0 && (
              <span className="text-xs text-muted-foreground">Último odômetro registrado: {currentOdometer.toLocaleString('pt-BR')} km</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="liters">Litros</Label>
              <Input
                id="liters"
                type="number"
                required
                min="0.01"
                step="0.01"
                placeholder="Ex: 8.5"
                value={form.liters}
                onChange={e => setForm({ ...form, liters: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cost">Valor Total (R$)</Label>
              <Input
                id="cost"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ex: 50.00"
                value={form.cost}
                onChange={e => setForm({ ...form, cost: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              required
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div className="space-y-1 mt-1">
            <Label className="text-xs text-muted-foreground">Tipo de Abastecimento</Label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant={form.full ? 'default' : 'outline'}
                size="sm"
                className="flex-1 cursor-pointer"
                onClick={() => setForm({ ...form, full: true })}
              >
                Tanque Cheio
              </Button>
              <Button
                type="button"
                variant={!form.full ? 'default' : 'outline'}
                size="sm"
                className="flex-1 cursor-pointer"
                onClick={() => setForm({ ...form, full: false })}
              >
                Parcial
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground pt-1">
              {form.full
                ? 'Tanque cheio calcula o rendimento exato desde o último abastecimento.'
                : 'Abastecimento parcial acumula os litros até o próximo tanque cheio.'}
            </p>
          </div>
          <Button type="submit" disabled={savingFueling} className="mt-2 w-full gap-2 font-medium bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
            {savingFueling ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> Salvar Registro
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )

  const renderEditMotoDialog = () => (
    <Dialog open={isMotoDialogOpen} onOpenChange={setIsMotoDialogOpen}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bike className="h-5 w-5 text-primary" />
            Cadastrar / Editar Minha Moto
          </DialogTitle>
          <DialogDescription>
            Personalize as informações e a foto da sua moto atual.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={saveMoto} className="grid gap-4 py-3">
          {/* Photo preview and upload */}
          <div className="flex flex-col items-center gap-3 pb-2">
            <div className="relative group w-32 h-32 rounded-2xl overflow-hidden border border-border bg-muted/30 flex items-center justify-center shadow-inner">
              {isCompressingPhoto ? (
                <div className="flex flex-col items-center justify-center text-muted-foreground p-2 text-center gap-1.5">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-[10px] font-medium text-foreground">Otimizando foto...</span>
                </div>
              ) : motoForm.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={motoForm.photoUrl}
                  alt="Foto da Moto"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground p-2 text-center">
                  <Bike className="h-10 w-10 mb-1 opacity-40" />
                  <span className="text-[11px]">Sem foto</span>
                </div>
              )}

              {!isCompressingPhoto && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200 text-xs gap-1 cursor-pointer"
                >
                  <Camera className="h-5 w-5" />
                  <span>Alterar foto</span>
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
                disabled={isCompressingPhoto || savingMoto}
                className="text-xs h-8 gap-1.5 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {isCompressingPhoto ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Otimizando...
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" />
                    {motoForm.photoUrl ? 'Trocar foto' : 'Enviar foto'}
                  </>
                )}
              </Button>
              {motoForm.photoUrl && !isCompressingPhoto && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={savingMoto}
                  className="text-xs h-8 text-destructive hover:bg-destructive/10 cursor-pointer"
                  onClick={() => setMotoForm(prev => ({ ...prev, photoUrl: '' }))}
                >
                  Remover
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="motoName">Apelido / Identificação</Label>
            <Input
              id="motoName"
              placeholder="Ex: Minha Nave, CBzinha, Foguetão"
              value={motoForm.name}
              onChange={e => setMotoForm({ ...motoForm, name: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="motoModel">Modelo da Moto</Label>
            <Input
              id="motoModel"
              placeholder="Ex: Honda CB 300F Twister, Yamaha MT-03, Fazer 250"
              required
              value={motoForm.model}
              onChange={e => setMotoForm({ ...motoForm, model: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="motoPlate">Placa (opcional)</Label>
              <Input
                id="motoPlate"
                placeholder="Ex: BRA2E19"
                value={motoForm.plate}
                onChange={e => setMotoForm({ ...motoForm, plate: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="motoYear">Ano de Fabricação</Label>
              <Input
                id="motoYear"
                placeholder="Ex: 2024"
                value={motoForm.year}
                onChange={e => setMotoForm({ ...motoForm, year: e.target.value })}
              />
            </div>
          </div>

          <Button type="submit" disabled={savingMoto} className="mt-2 w-full gap-2 font-medium bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
            {savingMoto ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> Salvar Dados da Moto
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )



  // Loading state while checking localStorage session
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg animate-pulse">
            <Bike className="h-6 w-6" />
          </div>
          <p className="text-xs text-muted-foreground font-mono">Iniciando Moto Tracker...</p>
        </div>
      </div>
    )
  }

  // Not authenticated: render high-conversion SaaS split-screen Login
  if (!isAuthenticated) {
    return (
      <>
        {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && (
          <ClerkAuthSync onUserSynced={handleLogin} />
        )}
        <LoginView onLogin={handleLogin} />
      </>
    )
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {renderNewFuelingDialog()}
      {renderEditMotoDialog()}
      <UserProfileDialog
        open={isUserDialogOpen}
        onOpenChange={setIsUserDialogOpen}
        userProfile={userProfile}
        onSaveProfile={handleSaveUserProfile}
        onRestartOnboarding={() => setIsWelcomeOpen(true)}
        onLogout={handleLogout}
      />
      <WelcomeDialog
        open={isWelcomeOpen}
        onOpenChange={setIsWelcomeOpen}
        userName={userProfile.name}
        userAvatar={userProfile.avatarUrl}
        initialMotoModel={moto.model}
        onComplete={handleCompleteOnboarding}
      />
      <GarageDialog
        open={isGarageDialogOpen}
        onOpenChange={setIsGarageDialogOpen}
        motos={motos}
        activeMotoId={currentMoto.id}
        onSelectMoto={handleSelectMoto}
        onAddMoto={handleAddMoto}
        onUpdateMoto={handleUpdateMoto}
        onDeleteMoto={handleDeleteMoto}
        fuelings={fuelings}
      />

      {/* Backdrop for mobile drawer */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* ===================== SIDEBAR ===================== */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-xs">
              <Bike className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold tracking-tight text-sm">Moto Tracker</span>
                <span className="rounded-md border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  PRO
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground font-mono">v1.0</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Motorcycle Quick Card in Sidebar */}
        <div className="p-3 border-b border-border">
          <div
            onClick={() => setIsGarageDialogOpen(true)}
            className="group flex items-center gap-3 rounded-xl border border-border/80 bg-muted/40 p-2.5 transition-all hover:bg-muted cursor-pointer hover:border-primary/40"
            title="Minha Garagem - Clique para alternar ou cadastrar veículos"
          >
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-muted/80">
              {moto.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={moto.photoUrl} alt={moto.model} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <Bike className="h-5 w-5" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold truncate text-foreground leading-tight">
                  {moto.model || 'Minha Moto'}
                </p>
                {motos.length > 1 && (
                  <Badge variant="outline" className="text-[9px] px-1 py-0 border-primary/40 text-primary font-mono shrink-0 ml-1">
                    {motos.length} motos
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-mono uppercase text-muted-foreground">
                  {moto.plate || 'SEM PLACA'}
                </span>
                <span className="text-[10px] text-muted-foreground">•</span>
                <span className="text-[10px] text-muted-foreground">
                  {currentOdometer > 0 ? `${currentOdometer.toLocaleString('pt-BR')} km` : '0 km'}
                </span>
              </div>
            </div>
            <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Menu Principal
          </p>
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setSidebarOpen(false)
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {'count' in item && item.count !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
                      isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Sidebar Footer - Usuário Conectado (Padrão SaaS Clássico) */}
        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={() => setIsUserDialogOpen(true)}
            className="group flex items-center justify-between w-full p-2 rounded-xl border border-border/70 bg-card hover:bg-muted/60 hover:border-border transition-all cursor-pointer shadow-2xs text-left"
            title="Gerenciar perfil do usuário conectado"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xs shadow-xs tracking-wider">
                  {userInitials}
                </div>
                {/* Indicador de status online */}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors leading-tight">
                    {userProfile.name}
                  </span>
                  {userProfile.authProvider === 'google' && (
                    <span className="text-[9px] bg-blue-500/10 text-blue-500 font-mono px-1 py-0.2 rounded border border-blue-500/30 shrink-0">Google</span>
                  )}
                  {userProfile.authProvider === 'github' && (
                    <span className="text-[9px] bg-zinc-800 text-zinc-300 font-mono px-1 py-0.2 rounded border border-zinc-700 shrink-0">GitHub</span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground truncate leading-tight font-mono">
                  {userProfile.email}
                </span>
              </div>
            </div>
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground/70 group-hover:text-foreground transition-colors flex-shrink-0 ml-1.5" />
          </button>
        </div>
      </aside>

      {/* ===================== MAIN WRAPPER ===================== */}
      <div className="flex flex-1 flex-col md:pl-64">
        {/* TOP BAR */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 md:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="md:hidden h-9 w-9 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Breadcrumb style title */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground hidden sm:inline">Moto Tracker</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/60 hidden sm:inline" />
              <span className="font-semibold text-foreground">
                {activeTab === 'dashboard' && 'Painel Geral'}
                {activeTab === 'statistics' && 'Estatísticas & Análises'}
                {activeTab === 'history' && 'Histórico de Abastecimentos'}
                {activeTab === 'garage' && 'Minha Garagem'}
                {activeTab === 'settings' && 'Configurações'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Vehicle Switcher on Mobile */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsGarageDialogOpen(true)}
              className="h-8.5 px-2.5 gap-1.5 text-xs md:hidden border-border/80 bg-muted/30 cursor-pointer shadow-2xs"
              title="Alternar veículo ativo"
            >
              <Bike className="h-3.5 w-3.5 text-primary" />
              <span className="font-semibold truncate max-w-[95px]">
                {moto.model.split(' ')[0]} {moto.model.split(' ')[1] || ''}
              </span>
            </Button>

            <ThemeToggle className="hidden sm:inline-flex" />
            <Button
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              className="h-8.5 sm:h-9 px-2.5 sm:px-3 gap-1.5 font-medium shadow-xs cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Novo Abastecimento</span>
              <span className="sm:hidden text-xs">Abastecer</span>
            </Button>
          </div>
        </header>

        {/* MAIN BODY CONTENT */}
        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto space-y-6 pb-28 md:pb-8">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Compact Vehicle Header Card */}
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-4">
                  {/* Motorcycle Photo */}
                  <div
                    onClick={openMotoDialog}
                    className="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-border bg-muted/40 shrink-0 flex items-center justify-center cursor-pointer shadow-xs hover:ring-2 hover:ring-primary/40 transition-all"
                  >
                    {moto.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={moto.photoUrl}
                        alt={moto.model}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground p-2 text-center">
                        <Camera className="h-6 w-6 mb-1 text-primary opacity-80 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-medium">Foto</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium transition-opacity">
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
                    </div>
                  </div>

                  {/* Moto Info & Stats */}
                  <div className="flex-1 flex flex-col justify-between text-center sm:text-left gap-2.5">
                    <div>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                          {moto.name || 'Minha Moto'}
                        </span>
                        {moto.plate && (
                          <Badge variant="outline" className="font-mono text-[11px] tracking-wider uppercase border-border font-semibold">
                            {moto.plate}
                          </Badge>
                        )}
                        {moto.year && (
                          <Badge variant="secondary" className="text-[11px] font-normal">
                            {moto.year}
                          </Badge>
                        )}
                      </div>
                      <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-0.5 text-foreground">
                        {moto.model || 'Defina o modelo da sua moto'}
                      </h1>
                    </div>

                    {/* Status badges */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 border border-border rounded-lg px-2.5 py-1">
                        <Gauge className="h-3.5 w-3.5 text-primary" />
                        <span>Odômetro: <strong className="text-foreground">{currentOdometer.toLocaleString('pt-BR')} km</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 border border-border rounded-lg px-2.5 py-1">
                        <Fuel className="h-3.5 w-3.5 text-primary" />
                        <span>Abastecimentos: <strong className="text-foreground">{activeMotoFuelings.length}</strong></span>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openMotoDialog}
                        className="h-7.5 gap-1 text-xs ml-auto hidden sm:flex cursor-pointer hover:border-primary/40 hover:text-primary"
                      >
                        <Pencil className="h-3 w-3" />
                        Editar Veículo
                      </Button>
                    </div>

                    <div className="flex gap-2 sm:hidden w-full mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openMotoDialog}
                        className="flex-1 h-8 text-xs cursor-pointer"
                      >
                        <Pencil className="h-3 w-3 mr-1" /> Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsGarageDialogOpen(true)}
                        className="flex-1 h-8 text-xs cursor-pointer border-primary/40 text-primary"
                      >
                        <Bike className="h-3 w-3 mr-1" /> Garagem ({motos.length})
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Month Selector Pills */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="space-y-0.5">
                  <h2 className="text-lg font-bold tracking-tight text-foreground">Métricas de Consumo</h2>
                  <p className="text-xs text-muted-foreground">Acompanhamento da eficiência e gastos recentes</p>
                </div>

                <div className="flex overflow-x-auto gap-1.5 py-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <Button
                    variant={selectedMonth === 'all' ? 'default' : 'outline'}
                    className={`rounded-lg text-xs h-8 cursor-pointer font-medium ${
                      selectedMonth === 'all' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''
                    }`}
                    onClick={() => setSelectedMonth('all')}
                    size="sm"
                  >
                    Todo o período
                  </Button>
                  {availableMonths.map(month => (
                    <Button
                      key={month}
                      variant={selectedMonth === month ? 'default' : 'outline'}
                      className={`rounded-lg text-xs h-8 cursor-pointer font-medium ${
                        selectedMonth === month ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''
                      }`}
                      onClick={() => setSelectedMonth(month)}
                      size="sm"
                    >
                      {formatMonth(month)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-border shadow-xs hover:border-primary/40 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Média Ponderada Real</CardTitle>
                    <Gauge className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold tracking-tight text-primary">
                      {computed.average.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">km/L</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {selectedMonth === 'all' ? 'Km total / Litros totais medidos' : `Média ponderada em ${formatMonth(selectedMonth)}`}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border shadow-xs hover:border-primary/40 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Distância Percorrida</CardTitle>
                    <Route className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold tracking-tight text-foreground">
                      {computed.distance.toLocaleString('pt-BR')} <span className="text-sm font-normal text-muted-foreground">km</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {selectedMonth === 'all' ? 'Total rodado registrado' : `Rodados em ${formatMonth(selectedMonth)}`}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border shadow-xs hover:border-primary/40 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Custo por Km</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold tracking-tight text-foreground">
                      {formatMoney(computed.costPerKm)}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {selectedMonth === 'all' ? 'Custo real médio por km' : `Custo em ${formatMonth(selectedMonth)}`}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border shadow-xs hover:border-primary/40 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Total Investido</CardTitle>
                    <Fuel className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold tracking-tight text-foreground">
                      {formatMoney(computed.spent)}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {selectedMonth === 'all' ? 'Combustível no período' : `Combustível em ${formatMonth(selectedMonth)}`}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Chart & Quick Stats Grid */}
              <div className="grid gap-4 md:grid-cols-7">
                <Card className="md:col-span-4 border-border shadow-xs">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">Consumo ao Longo do Tempo</CardTitle>
                    <CardDescription className="text-xs">
                      Evolução da eficiência (km/L) a cada abastecimento registrado
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-1">
                    <ChartContainer config={{ consumo: { label: 'Consumo (km/L)', color: activeColorHex } }} className="h-[250px] w-full">
                      <AreaChart data={chartData} margin={{ left: -20, right: 12, top: 12, bottom: 0 }}>
                        <defs>
                          <linearGradient id="fillConsumption" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={activeColorHex} stopOpacity={0.35} />
                            <stop offset="95%" stopColor={activeColorHex} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={isDark ? '#27272a' : '#e4e4e7'} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} stroke={isDark ? '#a1a1aa' : '#71717a'} />
                        <YAxis domain={['dataMin - 2', 'dataMax + 2']} tickLine={false} axisLine={false} fontSize={12} stroke={isDark ? '#a1a1aa' : '#71717a'} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="consumo"
                          stroke={activeColorHex}
                          strokeWidth={2.5}
                          fill="url(#fillConsumption)"
                          dot={{ r: 4, fill: activeColorHex, strokeWidth: 1.5, stroke: isDark ? '#121215' : '#ffffff' }}
                          activeDot={{ r: 6 }}
                        />
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="md:col-span-3 border-border shadow-xs">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">Resumo Operacional</CardTitle>
                    <CardDescription className="text-xs">
                      Indicadores de rendimento ponderados
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex items-center gap-3.5 rounded-xl border border-border bg-muted/30 p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xl font-bold tracking-tight text-foreground">
                          {computed.average.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">km/L</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Média ponderada do período</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="text-xs font-medium">Melhor autonomia</span>
                      </div>
                      <div className="font-semibold text-xs text-foreground font-mono">
                        {Math.max(...chartData.map(item => item.consumo), 0).toFixed(1)} km/L
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Droplet className="h-4 w-4 text-primary" />
                        <span className="text-xs font-medium">Volume total abastecido</span>
                      </div>
                      <div className="font-semibold text-xs text-foreground font-mono">
                        {computed.rows.reduce((sum, row) => sum + row.liters, 0).toFixed(1)} L
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-xs font-medium">Último registro</span>
                      </div>
                      <span className="text-xs font-medium text-foreground font-mono">
                        {computed.rows[0] ? formatDate(computed.rows[0].date) : '—'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* TAB 2: ESTATÍSTICAS DETALHADAS (MONTHS & YEARS) */}
          {activeTab === 'statistics' && (
            <motion.div
              key="statistics"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Header with Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">Estatísticas & Análises</h1>
                  <p className="text-xs text-muted-foreground">
                    Cálculos consolidados com médias ponderadas automotivas reais
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Monthly vs Yearly Selector */}
                  <div className="inline-flex rounded-lg border border-border p-1 bg-muted/40">
                    <button
                      type="button"
                      onClick={() => setStatView('monthly')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                        statView === 'monthly'
                          ? 'bg-card text-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Mês a Mês
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatView('yearly')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                        statView === 'yearly'
                          ? 'bg-card text-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Ano a Ano
                    </button>
                  </div>

                  {/* Year Filter Pills */}
                  {statView === 'monthly' && availableYears.length > 0 && (
                    <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-muted/20">
                      <button
                        type="button"
                        onClick={() => setStatYear('all')}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                          statYear === 'all'
                            ? 'bg-primary text-primary-foreground shadow-xs'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Todos
                      </button>
                      {availableYears.map(yr => (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => setStatYear(yr)}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                            statYear === yr
                              ? 'bg-primary text-primary-foreground shadow-xs'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {yr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* KPI Records Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-border shadow-xs">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Média Ponderada Real</CardTitle>
                    <Gauge className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold tracking-tight text-primary">
                      {statisticsData.overallAvgEff.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">km/L</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                      <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                        <ArrowUpRight className="h-3 w-3 mr-0.5" /> Max: {statisticsData.bestEfficiency.toFixed(1)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center text-rose-500 font-medium">
                        <ArrowDownRight className="h-3 w-3 mr-0.5" /> Min: {statisticsData.worstEfficiency.toFixed(1)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border shadow-xs">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Quilometragem Total</CardTitle>
                    <Route className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold tracking-tight text-foreground">
                      {statisticsData.totalDistance.toLocaleString('pt-BR')} <span className="text-sm font-normal text-muted-foreground">km</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2">
                      Média de {(statisticsData.activeList.length ? statisticsData.totalDistance / statisticsData.activeList.length : 0).toFixed(0)} km por {statView === 'monthly' ? 'mês' : 'ano'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border shadow-xs">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Investimento Total</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold tracking-tight text-foreground">
                      {formatMoney(statisticsData.totalSpent)}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2">
                      Em {statisticsData.totalLiters.toFixed(1)} litros abastecidos
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border shadow-xs">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Preço Médio Ponderado / L</CardTitle>
                    <Fuel className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold tracking-tight text-foreground">
                      {formatMoney(statisticsData.overallAvgPrice)} <span className="text-sm font-normal text-muted-foreground">/L</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                      <span>Mín: {formatMoney(statisticsData.lowestPrice)}</span>
                      <span>•</span>
                      <span>Máx: {formatMoney(statisticsData.highestPrice)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 2 Main Detailed Charts */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Chart 1: Efficiency evolution */}
                <Card className="border-border shadow-xs">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold flex items-center justify-between">
                      <span>Eficiência Média ({statView === 'monthly' ? 'km/L por Mês' : 'km/L por Ano'})</span>
                      <Gauge className="h-4 w-4 text-primary" />
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Autonomia média ponderada alcançada em cada período
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-1">
                    <ChartContainer config={{ efficiency: { label: 'Média km/L', color: activeColorHex } }} className="h-[260px] w-full">
                      <AreaChart data={statisticsData.activeList} margin={{ left: -15, right: 12, top: 12, bottom: 0 }}>
                        <defs>
                          <linearGradient id="fillStatEff" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={activeColorHex} stopOpacity={0.35} />
                            <stop offset="95%" stopColor={activeColorHex} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={isDark ? '#27272a' : '#e4e4e7'} />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} stroke={isDark ? '#a1a1aa' : '#71717a'} />
                        <YAxis domain={['dataMin - 3', 'dataMax + 3']} tickLine={false} axisLine={false} fontSize={12} stroke={isDark ? '#a1a1aa' : '#71717a'} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="efficiency"
                          stroke={activeColorHex}
                          strokeWidth={2.5}
                          fill="url(#fillStatEff)"
                          dot={{ r: 4, fill: activeColorHex, strokeWidth: 1.5, stroke: isDark ? '#121215' : '#ffffff' }}
                        />
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Chart 2: Monthly / Yearly Cost Bar Chart */}
                <Card className="border-border shadow-xs">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold flex items-center justify-between">
                      <span>Total Gasto com Combustível (R$)</span>
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Valor investido em cada {statView === 'monthly' ? 'mês' : 'ano'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-1">
                    <ChartContainer config={{ cost: { label: 'Gasto (R$)', color: activeColorHex } }} className="h-[260px] w-full">
                      <BarChart data={statisticsData.activeList} margin={{ left: -15, right: 12, top: 12, bottom: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={isDark ? '#27272a' : '#e4e4e7'} />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} stroke={isDark ? '#a1a1aa' : '#71717a'} />
                        <YAxis tickLine={false} axisLine={false} fontSize={12} stroke={isDark ? '#a1a1aa' : '#71717a'} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="cost"
                          fill={activeColorHex}
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              {/* 2 Secondary Detailed Charts */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Chart 3: Distance Traveled Bar Chart */}
                <Card className="border-border shadow-xs">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold flex items-center justify-between">
                      <span>Quilômetros Rodados (km)</span>
                      <Route className="h-4 w-4 text-muted-foreground" />
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Distância total percorrida no período
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-1">
                    <ChartContainer config={{ distance: { label: 'Km Rodados', color: isDark ? '#ffffff' : '#18181b' } }} className="h-[240px] w-full">
                      <BarChart data={statisticsData.activeList} margin={{ left: -15, right: 12, top: 12, bottom: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={isDark ? '#27272a' : '#e4e4e7'} />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} stroke={isDark ? '#a1a1aa' : '#71717a'} />
                        <YAxis tickLine={false} axisLine={false} fontSize={12} stroke={isDark ? '#a1a1aa' : '#71717a'} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="distance"
                          fill={isDark ? '#27272a' : '#e4e4e7'}
                          stroke={isDark ? '#3f3f46' : '#d4d4d8'}
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Chart 4: Price per liter evolution */}
                <Card className="border-border shadow-xs">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold flex items-center justify-between">
                      <span>Preço Médio da Gasolina (R$/L)</span>
                      <Fuel className="h-4 w-4 text-primary" />
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Oscilação do preço do litro pago nos postos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-1">
                    <ChartContainer config={{ pricePerLiter: { label: 'Preço/Litro (R$)', color: activeColorHex } }} className="h-[240px] w-full">
                      <LineChart data={statisticsData.activeList} margin={{ left: -15, right: 12, top: 12, bottom: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={isDark ? '#27272a' : '#e4e4e7'} />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} stroke={isDark ? '#a1a1aa' : '#71717a'} />
                        <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} tickLine={false} axisLine={false} fontSize={12} stroke={isDark ? '#a1a1aa' : '#71717a'} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="pricePerLiter"
                          stroke={activeColorHex}
                          strokeWidth={2}
                          dot={{ r: 4, fill: activeColorHex }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Consolidated Monthly/Yearly Table */}
              <Card className="border-border shadow-xs overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold">Tabela de Fechamento Consolidado</CardTitle>
                      <CardDescription className="text-xs">
                        {statView === 'monthly' ? 'Dados agrupados mês a mês' : 'Dados agrupados ano a ano'}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono">
                      {statisticsData.activeList.length} períodos
                    </Badge>
                  </div>
                </CardHeader>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow className="border-border">
                        <TableHead className="font-semibold text-xs">Período</TableHead>
                        <TableHead className="text-center font-semibold text-xs">Abastecimentos</TableHead>
                        <TableHead className="text-right font-semibold text-xs">Km Rodados</TableHead>
                        <TableHead className="text-right font-semibold text-xs">Volume (L)</TableHead>
                        <TableHead className="text-right font-semibold text-xs">Total Gasto</TableHead>
                        <TableHead className="text-right font-semibold text-xs">Preço Médio / L</TableHead>
                        <TableHead className="text-right font-semibold text-xs">Custo / Km</TableHead>
                        <TableHead className="text-right font-semibold text-xs">Média km/L</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {statisticsData.activeList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">
                            Nenhum registro encontrado para este período.
                          </TableCell>
                        </TableRow>
                      ) : (
                        statisticsData.activeList.map((item, idx) => (
                          <TableRow key={item.key} className="border-b border-border hover:bg-muted/30">
                            <TableCell className="font-medium text-xs">
                              <span className="font-semibold text-foreground">{item.fullLabel}</span>
                            </TableCell>
                            <TableCell className="text-center text-xs font-mono">
                              <Badge variant="secondary" className="text-[10px] font-normal">
                                {item.fuelingsCount}x
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-xs font-mono">{item.distance.toLocaleString('pt-BR')} km</TableCell>
                            <TableCell className="text-right text-xs font-mono">{item.liters.toFixed(2)} L</TableCell>
                            <TableCell className="text-right text-xs font-mono font-medium text-foreground">{formatMoney(item.cost)}</TableCell>
                            <TableCell className="text-right text-xs font-mono">{formatMoney(item.pricePerLiter)}</TableCell>
                            <TableCell className="text-right text-xs font-mono">{formatMoney(item.costPerKm)}</TableCell>
                            <TableCell className="text-right text-xs font-mono">
                              <span className="font-bold text-primary">{item.efficiency.toFixed(1)} km/L</span>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </motion.div>
          )}

          {/* TAB 3: HISTÓRICO */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">Histórico de Abastecimentos</h1>
                  <p className="text-xs text-muted-foreground">
                    Todos os registros de consumo e quilometragem da sua moto
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsDialogOpen(true)}
                  className="h-8.5 sm:h-9 px-2.5 sm:px-3 gap-1.5 font-medium shadow-xs cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Novo Abastecimento</span>
                  <span className="sm:hidden text-xs">Abastecer</span>
                </Button>
              </div>

              {/* Mobile View: Cards */}
              <div className="space-y-3 sm:hidden">
                {computed.rows.length === 0 ? (
                  <Card className="border-border p-6 text-center text-sm text-muted-foreground">
                    Nenhum abastecimento cadastrado ainda. Clique em "Abastecer" para começar!
                  </Card>
                ) : (
                  computed.rows.map((row, index) => (
                    <motion.div
                      key={row.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <Card className="border-border bg-card p-3.5 shadow-2xs hover:border-primary/40 transition-colors">
                        <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-semibold text-foreground">{formatDate(row.date)}</span>
                            {row.full ? (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                                Tanque Cheio
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                Parcial
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer"
                            onClick={() => deleteFueling(row.id)}
                            title="Excluir abastecimento"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2.5 text-xs">
                          <div>
                            <span className="text-[10px] text-muted-foreground block">Odômetro</span>
                            <span className="font-mono font-bold text-foreground">
                              {row.odometer.toLocaleString('pt-BR')} km
                            </span>
                            {row.distance ? (
                              <span className="text-[10px] text-primary font-mono block">+{row.distance} km</span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground block">Inicial</span>
                            )}
                          </div>

                          <div>
                            <span className="text-[10px] text-muted-foreground block">Volume / Custo</span>
                            <span className="font-mono font-medium text-foreground block">
                              {row.liters.toFixed(2)} L
                            </span>
                            {row.cost ? (
                              <span className="text-[10px] text-muted-foreground font-mono">{formatMoney(row.cost)}</span>
                            ) : null}
                          </div>

                          <div className="text-right flex flex-col justify-center">
                            <span className="text-[10px] text-muted-foreground block">Rendimento</span>
                            {row.efficiency > 0 ? (
                              <span className="text-sm font-bold font-mono text-primary">
                                {row.efficiency.toFixed(1)} km/L
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground font-mono">
                                {row.isBase ? '—' : 'Parcial'}
                              </span>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Desktop & Tablet View: Table */}
              <Card className="border-border shadow-xs overflow-hidden hidden sm:block">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow className="border-border">
                        <TableHead className="font-semibold text-xs">Data</TableHead>
                        <TableHead className="text-right font-semibold text-xs">Odômetro</TableHead>
                        <TableHead className="text-right font-semibold text-xs">Distância</TableHead>
                        <TableHead className="text-right font-semibold text-xs">Volume (L)</TableHead>
                        <TableHead className="text-right font-semibold text-xs hidden sm:table-cell">Valor</TableHead>
                        <TableHead className="text-right font-semibold text-xs">Rendimento</TableHead>
                        <TableHead className="text-right w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {computed.rows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                            Nenhum abastecimento cadastrado ainda. Clique em "Novo Abastecimento" para começar!
                          </TableCell>
                        </TableRow>
                      ) : (
                        computed.rows.map((row, index) => (
                          <motion.tr
                            key={row.id}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="border-b border-border transition-colors hover:bg-muted/40"
                          >
                            <TableCell className="font-medium text-xs">
                              <div className="flex items-center gap-2">
                                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                                <span>{formatDate(row.date)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-xs font-mono">
                              {row.odometer.toLocaleString('pt-BR')} km
                            </TableCell>
                            <TableCell className="text-right text-xs">
                              {row.distance ? (
                                <Badge variant="secondary" className="font-mono text-[10px] font-normal">
                                  +{row.distance} km
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-xs">Inicial</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right text-xs font-mono">{row.liters.toFixed(2)}</TableCell>
                            <TableCell className="text-right text-xs font-mono hidden sm:table-cell">{formatMoney(row.cost)}</TableCell>
                            <TableCell className="text-right text-xs font-mono font-semibold text-primary">
                              {row.efficiency > 0 ? (
                                <span>{row.efficiency.toFixed(1)} km/L</span>
                              ) : (
                                <span className="text-muted-foreground font-normal">{row.isBase ? '—' : 'Parcial'}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer"
                                onClick={() => deleteFueling(row.id)}
                                title="Excluir abastecimento"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </motion.tr>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </motion.div>
          )}

          {/* TAB 4: MINHA GARAGEM */}
          {activeTab === 'garage' && (
            <motion.div
              key="garage"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">Minha Garagem</h1>
                  <p className="text-xs text-muted-foreground">
                    Gerencie todos os seus veículos, alterne a moto ativa e acompanhe odômetros individuais
                  </p>
                </div>
                <Button
                  onClick={() => setIsGarageDialogOpen(true)}
                  className="text-xs h-9 gap-1.5 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>Cadastrar Veículo</span>
                </Button>
              </div>

              {/* Grid of registered motorcycles */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {motos.map(m => {
                  const isActive = m.id === currentMoto.id
                  const motoFuelings = fuelings.filter(f => f.motoId === m.id)
                  const motoOdometer = motoFuelings.length > 0 ? Math.max(...motoFuelings.map(f => f.odometer)) : 0

                  return (
                    <Card
                      key={m.id}
                      className={`overflow-hidden transition-all border ${
                        isActive
                          ? 'border-primary shadow-sm ring-1 ring-primary/40 bg-card'
                          : 'border-border/80 hover:border-primary/40 bg-card'
                      }`}
                    >
                      {/* Photo header */}
                      <div className="relative aspect-video w-full bg-muted/40 flex items-center justify-center border-b border-border overflow-hidden group">
                        {m.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.photoUrl} alt={m.model} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                            <Bike className="h-12 w-12 mb-1 opacity-30" />
                            <p className="text-[11px]">Sem foto cadastrada</p>
                          </div>
                        )}
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                          {isActive ? (
                            <Badge className="bg-emerald-600 text-white text-[10px] font-semibold shadow-xs">
                              Ativa no Painel
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-background/80 backdrop-blur-xs text-[10px]">
                              Garagem
                            </Badge>
                          )}
                        </div>
                      </div>

                      <CardContent className="p-4 space-y-3">
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-foreground truncate">
                              {m.model || m.name}
                            </h3>
                          </div>
                          <p className="text-xs text-muted-foreground">{m.name || 'Sem apelido'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-lg border border-border/80 p-2 bg-muted/20">
                            <span className="text-[10px] text-muted-foreground block">Placa</span>
                            <span className="font-semibold font-mono text-foreground">{m.plate || '—'}</span>
                          </div>
                          <div className="rounded-lg border border-border/80 p-2 bg-muted/20">
                            <span className="text-[10px] text-muted-foreground block">Ano</span>
                            <span className="font-semibold text-foreground">{m.year || '—'}</span>
                          </div>
                          <div className="rounded-lg border border-border/80 p-2 bg-muted/20">
                            <span className="text-[10px] text-muted-foreground block">Odômetro</span>
                            <span className="font-semibold font-mono text-foreground">
                              {motoOdometer > 0 ? `${motoOdometer.toLocaleString('pt-BR')} km` : '0 km'}
                            </span>
                          </div>
                          <div className="rounded-lg border border-border/80 p-2 bg-muted/20">
                            <span className="text-[10px] text-muted-foreground block">Abastecimentos</span>
                            <span className="font-semibold text-foreground">{motoFuelings.length} reg.</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          {!isActive ? (
                            <Button
                              size="sm"
                              onClick={() => handleSelectMoto(m.id)}
                              className="flex-1 text-xs h-8 gap-1.5 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Usar no Painel
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled
                              className="flex-1 text-xs h-8 gap-1.5 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold bg-emerald-500/5"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Em Uso
                            </Button>
                          )}

                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => {
                              setSelectedMotoId(m.id)
                              openMotoDialog()
                            }}
                            className="h-8 w-8 cursor-pointer hover:border-primary/40"
                            title="Editar dados da moto"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}

                {/* Add new card placeholder */}
                <Card
                  onClick={() => setIsGarageDialogOpen(true)}
                  className="border-dashed border-2 border-border/80 hover:border-primary/60 bg-muted/10 hover:bg-muted/30 transition-all flex flex-col items-center justify-center p-8 text-center cursor-pointer min-h-[280px]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
                    <Plus className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Adicionar Outro Veículo</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                    Cadastre uma nova moto para gerenciar consumo e odômetro separadamente
                  </p>
                </Card>
              </div>
            </motion.div>
          )}

          {/* TAB 5: CONFIGURAÇÕES */}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={{ duration: 0.2 }}
              className="space-y-6 max-w-4xl"
            >
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Configurações</h1>
                <p className="text-xs text-muted-foreground">
                  Personalize seu perfil, aparência e preferências do aplicativo
                </p>
              </div>

              {/* Connected User Profile Card */}
              <Card className="border-border shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-sm font-semibold">Perfil do Usuário Conectado</CardTitle>
                    <CardDescription className="text-xs">
                      Identificação do usuário associado a este painel
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsUserDialogOpen(true)}
                      className="text-xs h-8 gap-1.5 cursor-pointer hover:border-primary/40 hover:text-primary"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Editar Perfil
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="text-xs h-8 gap-1.5 cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
                      title="Encerrar sessão e voltar para tela de login"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Sair
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-sm shadow-xs">
                          {userInitials}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-card" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{userProfile.name}</p>
                          <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-mono">
                            Online
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">{userProfile.email}</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex flex-col text-right">
                      <span className="text-xs font-medium text-foreground">{userProfile.role}</span>
                      <span className="text-[11px] text-muted-foreground font-mono">Plano Pro Ativo</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Accent Color Section */}
              <Card className="border-border shadow-xs">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Cor de Destaque da Moto</CardTitle>
                  <CardDescription className="text-xs">
                    Escolha a identidade visual inspirada nas marcas e montadoras esportivas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {(Object.keys(ACCENT_CONFIG) as AccentColor[]).map(color => {
                      const cfg = ACCENT_CONFIG[color]
                      const isSelected = accent === color

                      return (
                        <div
                          key={color}
                          onClick={() => changeAccent(color)}
                          className={`relative flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-primary bg-primary/5 ring-1 ring-primary/40 shadow-xs'
                              : 'border-border/80 bg-card hover:bg-muted/40 hover:border-border'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`h-6 w-6 rounded-full shadow-xs flex-shrink-0 ${cfg.bgClass}`} />
                            <div>
                              <p className="text-xs font-semibold text-foreground leading-tight">{cfg.name}</p>
                              <p className="text-[11px] text-muted-foreground font-mono">{cfg.brand}</p>
                            </div>
                          </div>

                          {isSelected && (
                            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Theme Mode Section */}
              <Card className="border-border shadow-xs">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Modo de Exibição</CardTitle>
                  <CardDescription className="text-xs">
                    Alterne entre a base clara (branco nítido) e a base escura (preto profundo)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div
                      onClick={() => setTheme('light')}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                        resolvedTheme === 'light'
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/40 shadow-xs'
                          : 'border-border/80 bg-card hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200">
                          <Sun className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">Modo Claro</p>
                          <p className="text-[11px] text-muted-foreground">Branco e nítido</p>
                        </div>
                      </div>
                      {resolvedTheme === 'light' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>

                    <div
                      onClick={() => setTheme('dark')}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                        resolvedTheme === 'dark'
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/40 shadow-xs'
                          : 'border-border/80 bg-card hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-zinc-800 text-zinc-100 border border-zinc-700">
                          <Moon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">Modo Escuro</p>
                          <p className="text-[11px] text-muted-foreground">Preto e imersivo</p>
                        </div>
                      </div>
                      {resolvedTheme === 'dark' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>

                    <div
                      onClick={() => setTheme('system')}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                        theme === 'system'
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/40 shadow-xs'
                          : 'border-border/80 bg-card hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted text-muted-foreground border border-border">
                          <Laptop className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">Automático</p>
                          <p className="text-[11px] text-muted-foreground">Segue o sistema</p>
                        </div>
                      </div>
                      {theme === 'system' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* App Information Section */}
              <Card className="border-border shadow-xs">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Informações do Aplicativo</CardTitle>
                  <CardDescription className="text-xs">
                    Dados gerais do Moto Tracker
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg border border-border p-3 bg-muted/20">
                      <span className="text-muted-foreground">Versão do App</span>
                      <p className="font-semibold text-foreground mt-0.5">
                        v1.0.0 PRO
                      </p>
                    </div>

                    <div className="rounded-lg border border-border p-3 bg-muted/20">
                      <span className="text-muted-foreground">Finalidade</span>
                      <p className="font-semibold text-foreground mt-0.5">
                        Controle de Combustível & Odômetro
                      </p>
                    </div>

                    <div className="rounded-lg border border-border p-3 bg-muted/20">
                      <span className="text-muted-foreground">Total de Abastecimentos</span>
                      <p className="font-semibold text-foreground mt-0.5 font-mono">
                        {fuelings.length} registros
                      </p>
                    </div>

                    <div className="rounded-lg border border-border p-3 bg-muted/20">
                      <span className="text-muted-foreground">Moto Atual</span>
                      <p className="font-semibold text-foreground mt-0.5">
                        {moto.model || 'Não cadastrada'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </main>
      </div>

      {/* ===================== NATIVE MOBILE BOTTOM BAR ===================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-card/95 backdrop-blur-md border-t border-border px-2 pt-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-lg">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer relative min-w-[54px] ${
                isActive
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon className={`h-4.5 w-4.5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {'count' in item && item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-mono font-bold text-primary-foreground">
                    {item.count}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">
                {item.id === 'dashboard'
                  ? 'Painel'
                  : item.id === 'statistics'
                  ? 'Métricas'
                  : item.id === 'history'
                  ? 'Histórico'
                  : item.id === 'garage'
                  ? 'Garagem'
                  : 'Ajustes'}
              </span>
              {isActive && (
                <div className="absolute -bottom-0.5 h-0.5 w-5 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

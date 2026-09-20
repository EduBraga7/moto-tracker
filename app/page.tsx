'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  BarChart3,
  History,
  Bike,
  Settings
} from 'lucide-react'
import { type AccentColor, ACCENT_CONFIG } from '@/components/accent-picker'
import {
  getMotos,
  addMotoAction,
  deleteMotoAction,
  updateMotoAction,
  getFuelings,
  addFuelingAction,
  deleteFuelingAction,
  updateUserProfileAction,
  getCurrentUserAction,
  logoutAction,
  type Fueling,
  type Moto,
  type AuthUser
} from '@/app/actions'
import { useFuelingCalculations } from '@/hooks/use-fueling-calculations'
import { WelcomeDialog, type OnboardingData } from '@/components/onboarding/welcome-dialog'
import { GarageDialog } from '@/components/garage/garage-dialog'
import { UserProfileDialog } from '@/components/profile/user-profile-dialog'
import { ClerkAuthSync } from '@/components/auth/clerk-auth-sync'
import { LoginView } from '@/components/auth/login-view'

// Modularized Components
import { AppSidebar, type TabId } from '@/components/navigation/app-sidebar'
import { AppHeader } from '@/components/navigation/app-header'
import { BottomNav } from '@/components/navigation/bottom-nav'
import { DashboardMetrics } from '@/components/dashboard/dashboard-metrics'
import { DashboardChart } from '@/components/dashboard/dashboard-chart'
import { FuelingDialog } from '@/components/dashboard/fueling-dialog'
import { MotoDialog } from '@/components/dashboard/moto-dialog'
import { StatisticsTab } from '@/components/telemetry/statistics-tab'
import { HistoryTab } from '@/components/history/history-tab'
import { GarageTab } from '@/components/garage/garage-tab'
import { SettingsTab } from '@/components/settings/settings-tab'

const defaultMoto: Moto = {
  id: 1,
  name: 'Minha Moto',
  model: 'Honda CB 300F Twister',
  plate: 'BRA-2E19',
  year: '2024',
  photoUrl: ''
}

const pageVariants = {
  initial: { opacity: 0, y: 6 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -6 }
}

export default function Page() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [accent, setAccent] = useState<AccentColor>('red')
  const [fuelings, setFuelings] = useState<Fueling[]>([])
  const [motos, setMotos] = useState<Moto[]>([defaultMoto])
  const [selectedMotoId, setSelectedMotoId] = useState<number>(1)

  // Dialog Controls
  const [isGarageDialogOpen, setIsGarageDialogOpen] = useState(false)
  const [isFuelingDialogOpen, setIsFuelingDialogOpen] = useState(false)
  const [isMotoDialogOpen, setIsMotoDialogOpen] = useState(false)
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Navigation & Filtering State
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [statView, setStatView] = useState<'monthly' | 'yearly'>('monthly')
  const [statYear, setStatYear] = useState<string>('all')

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<AuthUser>({
    id: 1,
    name: 'Eduardo Ramos',
    email: 'eduardo@mototracker.app',
    role: 'Proprietário'
  })

  const currentMoto = useMemo(() => {
    return motos.find(m => m.id === selectedMotoId) || motos[0] || defaultMoto
  }, [motos, selectedMotoId])

  // Calculation Engine Hook
  const {
    activeMotoFuelings,
    computedRows,
    computed,
    chartData,
    statisticsData
  } = useFuelingCalculations({
    fuelings,
    selectedMotoId: currentMoto.id,
    selectedMonth,
    statYear,
    statView
  })

  const currentOdometer = useMemo(() => {
    if (activeMotoFuelings.length === 0) return 0
    return Math.max(...activeMotoFuelings.map(f => f.odometer))
  }, [activeMotoFuelings])

  const availableMonths = useMemo(() => {
    const months = new Set<string>()
    activeMotoFuelings.forEach(f => {
      if (f.date) months.add(f.date.substring(0, 7))
    })
    return Array.from(months).sort().reverse()
  }, [activeMotoFuelings])

  const availableYears = useMemo(() => {
    const years = new Set<string>()
    activeMotoFuelings.forEach(f => {
      if (f.date) years.add(f.date.substring(0, 4))
    })
    return Array.from(years).sort().reverse()
  }, [activeMotoFuelings])

  const isDark = mounted && resolvedTheme === 'dark'
  const activeColorHex = isDark ? ACCENT_CONFIG[accent].darkHex : ACCENT_CONFIG[accent].lightHex

  // Change Accent
  const changeAccent = (newAccent: AccentColor) => {
    setAccent(newAccent)
    document.documentElement.setAttribute('data-accent', newAccent)
    try {
      localStorage.setItem('moto_tracker_accent', newAccent)
    } catch {
      // storage unavailable
    }
  }

  // Load backend data
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

  // Check auth and theme on mount
  useEffect(() => {
    setMounted(true)
    try {
      const savedAccent = (localStorage.getItem('moto_tracker_accent') as AccentColor) || 'red'
      setAccent(savedAccent)
      document.documentElement.setAttribute('data-accent', savedAccent)
    } catch {
      document.documentElement.setAttribute('data-accent', 'red')
    }

    // Check server session first
    getCurrentUserAction()
      .then(serverUser => {
        // If the user deliberately logged out in this browser session, do not auto-login
        if (typeof window !== 'undefined' && sessionStorage.getItem('moto_tracker_logged_out') === 'true') {
          setIsAuthenticated(false)
          setLoading(false)
          return
        }

        if (serverUser) {
          setIsAuthenticated(true)
          setUserProfile(serverUser)
          loadData(serverUser.id)
          return
        }

        // Fallback to OAuth URL query or localStorage
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

          const savedAuth = localStorage.getItem('moto_tracker_auth')
          if (savedAuth) {
            try {
              const parsed = JSON.parse(savedAuth)
              if (parsed.authenticated && parsed.user) {
                setIsAuthenticated(true)
                setUserProfile(parsed.user)
                loadData(parsed.user.id)
                return
              }
            } catch {}
          }
        }

        setIsAuthenticated(false)
        setLoading(false)
      })
      .catch(() => {
        setIsAuthenticated(false)
        setLoading(false)
      })
  }, [])

  // Auth Handlers
  const handleLogin = (user: AuthUser) => {
    try {
      sessionStorage.removeItem('moto_tracker_logged_out')
      localStorage.setItem('moto_tracker_auth', JSON.stringify({ authenticated: true, user }))
    } catch {}
    setIsAuthenticated(true)
    setUserProfile(user)
    loadData(user.id)
  }

  const handleLogout = async () => {
    setIsUserDialogOpen(false)
    try {
      localStorage.removeItem('moto_tracker_auth')
      sessionStorage.setItem('moto_tracker_logged_out', 'true')
    } catch {}
    await logoutAction()

    if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
      setIsLoggingOut(true)
    } else {
      setIsAuthenticated(false)
    }
  }

  const handleLogoutDone = () => {
    setIsLoggingOut(false)
    setIsAuthenticated(false)
  }

  const handleSaveUserProfile = async (data: { name: string }) => {
    const res = await updateUserProfileAction(userProfile.id, data)
    if (!res.success) {
      throw new Error(res.error || 'Erro ao atualizar perfil')
    }
    const updated = { ...userProfile, name: data.name }
    setUserProfile(updated)
    try {
      localStorage.setItem('moto_tracker_auth', JSON.stringify({ authenticated: true, user: updated }))
    } catch {}
  }

  // Moto Handlers
  const handleSelectMoto = (motoId: number) => {
    setSelectedMotoId(motoId)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`moto_tracker_active_moto_${userProfile.id}`, String(motoId))
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
      setMotos(prev => prev.map(m => (m.id === motoId ? { ...m, ...motoData } : m)))
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

  // Fueling Handlers
  const handleSaveFueling = async (fuelingData: {
    odometer: number
    liters: number
    cost: number
    date: string
    full: boolean
  }) => {
    const res = await addFuelingAction(
      {
        motoId: currentMoto.id,
        ...fuelingData
      },
      userProfile.id
    )

    if (res.success && res.fueling) {
      setFuelings(prev => [res.fueling!, ...prev])
    } else {
      throw new Error(res.error || 'Erro ao registrar abastecimento')
    }
  }

  const handleDeleteFueling = async (id: number) => {
    if (!confirm('Deseja realmente excluir este abastecimento?')) return
    const res = await deleteFuelingAction(id, userProfile.id)
    if (res.success) {
      setFuelings(prev => prev.filter(f => f.id !== id))
    } else {
      alert('Erro ao excluir abastecimento.')
    }
  }

  const handleCompleteOnboarding = async (data: OnboardingData) => {
    try {
      const fullModel = `${data.motoBrand.trim()} ${data.motoModel.trim()}`.trim()
      await updateMotoAction(
        {
          name: data.motoName,
          model: fullModel,
          plate: data.motoPlate,
          year: data.motoYear,
          photoUrl: currentMoto.photoUrl || ''
        },
        userProfile.id
      )

      if (data.preferredColor) {
        changeAccent(data.preferredColor)
      }

      setMotos(prev =>
        prev.map(m =>
          m.id === currentMoto.id
            ? {
                ...m,
                name: data.motoName,
                model: fullModel,
                plate: data.motoPlate,
                year: data.motoYear
              }
            : m
        )
      )

      if (typeof window !== 'undefined') {
        localStorage.setItem(`moto_onboarding_completed_${userProfile.id}`, 'true')
        localStorage.setItem(`moto_usage_profile_${userProfile.id}`, data.usageProfile)
        if (data.currentOdometer) {
          localStorage.setItem(`moto_baseline_odometer_${userProfile.id}`, String(data.currentOdometer))
        }
      }
    } catch (err) {
      console.error('Erro ao concluir onboarding:', err)
    }
  }

  const navItems = [
    { id: 'dashboard' as const, label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'statistics' as const, label: 'Estatísticas', icon: BarChart3 },
    { id: 'history' as const, label: 'Histórico', icon: History, count: activeMotoFuelings.length },
    { id: 'garage' as const, label: 'Minha Garagem', icon: Bike, count: motos.length },
    { id: 'settings' as const, label: 'Configurações', icon: Settings }
  ]

  // Loading state
  if (loading && isAuthenticated === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg animate-pulse">
            <Bike className="h-6 w-6" />
          </div>
          <span className="text-sm font-medium text-muted-foreground animate-pulse">
            Carregando Moto Tracker PRO...
          </span>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <>
        {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && (
          <ClerkAuthSync
            onUserSynced={handleLogin}
            isLoggingOut={isLoggingOut}
            onLogoutDone={handleLogoutDone}
          />
        )}
        <LoginView onLogin={handleLogin} />
      </>
    )
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && (
        <ClerkAuthSync
          onUserSynced={handleLogin}
          isLoggingOut={isLoggingOut}
          onLogoutDone={handleLogoutDone}
        />
      )}
      {/* Dialogs */}
      <FuelingDialog
        open={isFuelingDialogOpen}
        onOpenChange={setIsFuelingDialogOpen}
        currentMoto={currentMoto}
        currentOdometer={currentOdometer}
        onSaveFueling={handleSaveFueling}
      />

      <MotoDialog
        open={isMotoDialogOpen}
        onOpenChange={setIsMotoDialogOpen}
        currentMoto={currentMoto}
        onSaveMoto={async data => {
          await handleUpdateMoto(currentMoto.id, data)
        }}
      />

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
        initialMotoModel={currentMoto.model}
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

      {/* Desktop Sidebar & Mobile Drawer */}
      <AppSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        moto={currentMoto}
        motosCount={motos.length}
        currentOdometer={currentOdometer}
        navItems={navItems}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        userProfile={userProfile}
        onOpenGarageDialog={() => setIsGarageDialogOpen(true)}
        onOpenUserDialog={() => setIsUserDialogOpen(true)}
      />

      {/* Main Wrapper */}
      <div className="flex flex-1 flex-col md:pl-64">
        {/* Sticky Header */}
        <AppHeader
          activeTab={activeTab}
          moto={currentMoto}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenGarageDialog={() => setIsGarageDialogOpen(true)}
          onOpenFuelingDialog={() => setIsFuelingDialogOpen(true)}
        />

        {/* Main Tabs Content */}
        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto space-y-6 pb-28 md:pb-8">
          <AnimatePresence mode="wait">
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
                <DashboardMetrics
                  moto={currentMoto}
                  motosCount={motos.length}
                  currentOdometer={currentOdometer}
                  fuelingsCount={activeMotoFuelings.length}
                  computed={computed}
                  selectedMonth={selectedMonth}
                  availableMonths={availableMonths}
                  onSelectMonth={setSelectedMonth}
                  onOpenMotoDialog={() => setIsMotoDialogOpen(true)}
                  onOpenGarageDialog={() => setIsGarageDialogOpen(true)}
                />

                <DashboardChart
                  chartData={chartData}
                  computed={computed}
                  activeColorHex={activeColorHex}
                  isDark={isDark}
                />
              </motion.div>
            )}

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
                <StatisticsTab
                  statisticsData={statisticsData}
                  statView={statView}
                  setStatView={setStatView}
                  statYear={statYear}
                  setStatYear={setStatYear}
                  availableYears={availableYears}
                  activeColorHex={activeColorHex}
                  isDark={isDark}
                />
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={{ duration: 0.2 }}
              >
                <HistoryTab
                  rows={computed.rows}
                  onOpenNewFueling={() => setIsFuelingDialogOpen(true)}
                  onDeleteFueling={handleDeleteFueling}
                />
              </motion.div>
            )}

            {activeTab === 'garage' && (
              <motion.div
                key="garage"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={{ duration: 0.2 }}
              >
                <GarageTab
                  motos={motos}
                  activeMotoId={currentMoto.id}
                  fuelings={fuelings}
                  onSelectMoto={handleSelectMoto}
                  onOpenEditMoto={() => setIsMotoDialogOpen(true)}
                  onOpenGarageDialog={() => setIsGarageDialogOpen(true)}
                />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={{ duration: 0.2 }}
              >
                <SettingsTab
                  userProfile={userProfile}
                  moto={currentMoto}
                  fuelingsCount={fuelings.length}
                  accent={accent}
                  onChangeAccent={changeAccent}
                  resolvedTheme={resolvedTheme}
                  theme={theme}
                  setTheme={setTheme}
                  onOpenUserDialog={() => setIsUserDialogOpen(true)}
                  onLogout={handleLogout}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        navItems={navItems}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />
    </div>
  )
}

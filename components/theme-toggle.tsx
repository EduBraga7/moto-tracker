'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={`h-9 w-9 rounded-lg border border-border/60 ${className || ''}`}
        aria-label="Alternar tema"
      >
        <span className="h-4 w-4" />
      </Button>
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`h-9 w-9 rounded-lg border border-border/60 transition-all hover:bg-muted ${className || ''}`}
      title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      aria-label="Alternar modo claro e escuro"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-foreground transition-transform duration-200 rotate-0 scale-100" />
      ) : (
        <Moon className="h-4 w-4 text-foreground transition-transform duration-200 rotate-0 scale-100" />
      )}
    </Button>
  )
}

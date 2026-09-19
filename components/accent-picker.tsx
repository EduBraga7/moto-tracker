'use client'

import * as React from 'react'
import { Check } from 'lucide-react'

export type AccentColor = 'red' | 'orange' | 'blue' | 'green' | 'yellow' | 'zinc'

export const ACCENT_CONFIG: Record<
  AccentColor,
  { name: string; brand: string; lightHex: string; darkHex: string; bgClass: string }
> = {
  red: {
    name: 'Vermelho Performance',
    brand: 'Honda / Ducati',
    lightHex: '#dc2626',
    darkHex: '#ef4444',
    bgClass: 'bg-red-600'
  },
  orange: {
    name: 'Laranja Racing',
    brand: 'KTM / Gulf',
    lightHex: '#ea580c',
    darkHex: '#f97316',
    bgClass: 'bg-orange-500'
  },
  blue: {
    name: 'Azul Elétrico',
    brand: 'Yamaha / Porsche',
    lightHex: '#2563eb',
    darkHex: '#3b82f6',
    bgClass: 'bg-blue-600'
  },
  green: {
    name: 'Verde Ninja',
    brand: 'Kawasaki / Eco',
    lightHex: '#059669',
    darkHex: '#10b981',
    bgClass: 'bg-emerald-600'
  },
  yellow: {
    name: 'Amarelo Speed',
    brand: 'Sport / Pista',
    lightHex: '#d97706',
    darkHex: '#eab308',
    bgClass: 'bg-amber-500'
  },
  zinc: {
    name: 'Preto & Branco',
    brand: 'Monocromático',
    lightHex: '#18181b',
    darkHex: '#fafafa',
    bgClass: 'bg-zinc-800'
  }
}

interface AccentPickerProps {
  currentAccent: AccentColor
  onAccentChange: (accent: AccentColor) => void
  showLabels?: boolean
  className?: string
}

export function AccentPicker({
  currentAccent,
  onAccentChange,
  showLabels = false,
  className = ''
}: AccentPickerProps) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {(Object.keys(ACCENT_CONFIG) as AccentColor[]).map(color => {
        const config = ACCENT_CONFIG[color]
        const isSelected = currentAccent === color

        return (
          <button
            key={color}
            type="button"
            onClick={() => onAccentChange(color)}
            title={`${config.name} (${config.brand})`}
            aria-label={`Selecionar cor ${config.name}`}
            className={`group relative flex items-center justify-center rounded-full transition-all duration-150 cursor-pointer ${
              isSelected
                ? 'h-6 w-6 ring-2 ring-foreground/40 ring-offset-2 ring-offset-background scale-110'
                : 'h-5 w-5 hover:scale-110 opacity-80 hover:opacity-100'
            }`}
          >
            <span
              className={`h-full w-full rounded-full shadow-xs ${config.bgClass}`}
            />
            {isSelected && (
              <Check className="absolute h-3 w-3 text-white drop-shadow-xs" />
            )}
          </button>
        )
      })}
    </div>
  )
}

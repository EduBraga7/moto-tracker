import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://moto-tracker-kohl.vercel.app'),
  title: 'Moto Tracker — Gestão de Combustível e Odômetro',
  description: 'Acompanhe consumo real (km/L), gastos por quilômetro, histórico de abastecimentos e múltiplas motos na sua garagem.',
  applicationName: 'Moto Tracker',
  authors: [{ name: 'Eduardo Ramos' }],
  keywords: ['moto', 'combustível', 'odômetro', 'consumo', 'km/L', 'garagem', 'motocicleta', 'tracker'],
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'Moto Tracker — Gestão Inteligente de Combustível & Odômetro',
    description: 'Acompanhe consumo real (km/L), gastos por quilômetro, histórico de abastecimentos e múltiplas motos na sua garagem.',
    url: 'https://moto-tracker-kohl.vercel.app',
    siteName: 'Moto Tracker',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 675,
        alt: 'Moto Tracker — Gestão Inteligente de Combustível & Odômetro',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Moto Tracker — Gestão Inteligente de Combustível & Odômetro',
    description: 'Acompanhe consumo real (km/L), gastos por km e sua garagem completa.',
    images: ['/og-image.jpg'],
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  const content = (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )

  if (!publishableKey) {
    return content
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={{
        theme: dark,
        variables: {
          colorPrimary: '#e11d48'
        }
      }}
    >
      {content}
    </ClerkProvider>
  )
}


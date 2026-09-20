'use client'

import { useState, useEffect } from 'react'

export default function GoogleAuthPopup() {
  const [selectedEmail, setSelectedEmail] = useState('')
  const [customEmail, setCustomEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [statusText, setStatusText] = useState('')

  const handleSelectAccount = (name: string, email: string) => {
    setLoading(true)
    setSelectedEmail(email)
    setStatusText('Autenticando com o Google...')

    setTimeout(() => {
      setStatusText('Sincronizando com o Moto Tracker PRO...')
    }, 400)

    setTimeout(() => {
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'OAUTH_SUCCESS',
            provider: 'google',
            user: {
              name,
              email,
              avatarUrl: ''
            }
          },
          window.location.origin
        )
      }
      window.close()
    }, 800)
  }

  return (
    <div className="min-h-screen w-full bg-white text-[#202124] flex flex-col justify-between p-6 sm:p-10 font-sans antialiased selection:bg-blue-100">
      <div className="max-w-[400px] w-full mx-auto my-auto space-y-6">
        {/* Google Logo */}
        <div className="flex flex-col items-center text-center space-y-3">
          <svg className="h-8 w-8" viewBox="0 0 24 24">
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

          <div>
            <h1 className="text-xl font-medium text-[#202124]">Fazer login com o Google</h1>
            <p className="text-sm text-[#5f6368] mt-1">
              para continuar no app <strong className="text-[#202124] font-medium">Moto Tracker PRO</strong>
            </p>
          </div>
        </div>

        {/* Loading Progress Bar */}
        {loading ? (
          <div className="py-8 space-y-4 text-center">
            <div className="w-full bg-[#e0e0e0] h-1 rounded-full overflow-hidden">
              <div className="bg-[#1a73e8] h-full w-2/3 animate-pulse rounded-full" />
            </div>
            <p className="text-xs text-[#5f6368]">{statusText}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Account List */}
            <div className="border border-[#dadce0] rounded-lg divide-y divide-[#dadce0] overflow-hidden">
              {/* Account 1 */}
              <button
                type="button"
                onClick={() => handleSelectAccount('Eduardo Braga', 'eduardobraga@gmail.com')}
                className="w-full p-3.5 flex items-center gap-3.5 hover:bg-[#f8f9fa] transition-colors text-left cursor-pointer"
              >
                <div className="h-9 w-9 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-medium text-sm">
                  E
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#202124] leading-tight">Eduardo Braga</p>
                  <p className="text-xs text-[#5f6368] truncate leading-tight mt-0.5">eduardobraga@gmail.com</p>
                </div>
              </button>

              {/* Account 2 */}
              <button
                type="button"
                onClick={() => handleSelectAccount('Avaliador / Recrutador', 'recrutador.tech@gmail.com')}
                className="w-full p-3.5 flex items-center gap-3.5 hover:bg-[#f8f9fa] transition-colors text-left cursor-pointer"
              >
                <div className="h-9 w-9 rounded-full bg-[#f29900] text-white flex items-center justify-center font-medium text-sm">
                  R
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#202124] leading-tight">Avaliador / Recrutador</p>
                  <p className="text-xs text-[#5f6368] truncate leading-tight mt-0.5">recrutador.tech@gmail.com</p>
                </div>
              </button>
            </div>

            {/* Custom Account Input */}
            <div className="pt-2">
              <p className="text-xs text-[#5f6368] mb-1.5">Ou use sua própria conta Google:</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={customEmail}
                  onChange={e => setCustomEmail(e.target.value)}
                  placeholder="seu.email@gmail.com"
                  className="flex-1 px-3 py-2 text-xs border border-[#dadce0] rounded-md focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
                />
                <button
                  type="button"
                  disabled={!customEmail.includes('@')}
                  onClick={() => {
                    const name = customEmail.split('@')[0]
                    handleSelectAccount(name.charAt(0).toUpperCase() + name.slice(1), customEmail)
                  }}
                  className="px-4 py-2 text-xs font-medium text-white bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 rounded-md transition-colors cursor-pointer"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Disclaimer */}
        <p className="text-xs text-[#5f6368] text-center leading-relaxed">
          Para continuar, o Google compartilhará seu nome, endereço de e-mail e foto de perfil com o Moto Tracker PRO.
        </p>
      </div>

      <div className="flex items-center justify-between text-xs text-[#70757a] max-w-[400px] w-full mx-auto pt-4 border-t border-[#f1f3f4]">
        <span>Português (Brasil)</span>
        <div className="flex gap-4">
          <span>Ajuda</span>
          <span>Privacidade</span>
          <span>Termos</span>
        </div>
      </div>
    </div>
  )
}

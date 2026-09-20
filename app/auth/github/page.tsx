'use client'

import { useState } from 'react'

export default function GitHubAuthPopup() {
  const [customUser, setCustomUser] = useState('')
  const [loading, setLoading] = useState(false)
  const [statusText, setStatusText] = useState('')

  const handleAuthorize = (name: string, email: string) => {
    setLoading(true)
    setStatusText('Verificando autorização com o GitHub...')

    setTimeout(() => {
      setStatusText('Sincronizando permissões com o Moto Tracker PRO...')
    }, 400)

    setTimeout(() => {
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'OAUTH_SUCCESS',
            provider: 'github',
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
    <div className="min-h-screen w-full bg-[#0d1117] text-[#c9d1d9] flex flex-col justify-between p-6 sm:p-8 font-sans antialiased">
      <div className="max-w-[440px] w-full mx-auto my-auto space-y-6">
        {/* GitHub & App Logos with Connection */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <div className="h-12 w-12 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center text-white">
            <svg className="h-7 w-7 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </div>
          <div className="h-0.5 w-8 bg-[#30363d]" />
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
            MOTO
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="text-xl font-semibold text-white">Authorize Moto Tracker PRO</h1>
          <p className="text-xs text-[#8b949e]">
            by <span className="text-[#58a6ff]">EduBraga7</span> would like to access your GitHub account
          </p>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="p-6 rounded-xl bg-[#161b22] border border-[#30363d] text-center space-y-3">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#8b949e]">{statusText}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Scopes Box */}
            <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2 text-xs">
              <p className="font-semibold text-white text-[11px] flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Personal user data
              </p>
              <p className="text-[11px] text-[#8b949e] pl-4">
                Email addresses (read-only), profile info and public repositories.
              </p>
            </div>

            {/* Quick Profiles */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleAuthorize('EduBraga7', 'dubragaaa@gmail.com')}
                className="w-full p-3 rounded-xl bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-left flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-[#161b22] text-white flex items-center justify-center font-bold text-xs border border-[#30363d]">
                    EB
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white leading-tight">EduBraga7 (Criador)</p>
                    <p className="text-[11px] text-[#8b949e] font-mono">dubragaaa@gmail.com</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  Autorizar
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleAuthorize('Tech Lead Reviewer', 'techlead@github.com')}
                className="w-full p-3 rounded-xl bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-left flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-[#161b22] text-white flex items-center justify-center font-bold text-xs border border-[#30363d]">
                    TL
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white leading-tight">Tech Lead / Avaliador</p>
                    <p className="text-[11px] text-[#8b949e] font-mono">techlead@github.com</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  Autorizar
                </span>
              </button>
            </div>

            {/* Custom GitHub Username */}
            <div className="pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customUser}
                  onChange={e => setCustomUser(e.target.value)}
                  placeholder="Ou informe seu @usuario"
                  className="flex-1 px-3 py-1.5 text-xs bg-[#0d1117] border border-[#30363d] rounded-md text-white focus:outline-none focus:border-[#58a6ff]"
                />
                <button
                  type="button"
                  disabled={!customUser.trim()}
                  onClick={() => {
                    const clean = customUser.trim().replace(/^@/, '')
                    handleAuthorize(clean, `${clean.toLowerCase()}@github.com`)
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 rounded-md transition-colors cursor-pointer"
                >
                  Autorizar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-[11px] text-[#8b949e] py-2 border-t border-[#21262d]">
        Authorize only applications you trust. Moto Tracker PRO will connect securely.
      </div>
    </div>
  )
}

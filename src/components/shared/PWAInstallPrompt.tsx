'use client'

import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if dismissed before
    const dismissed = localStorage.getItem('pwa-prompt-dismissed')
    if (dismissed) return

    // Detect iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(ios)

    if (ios) {
      // Show iOS instructions after 3 seconds
      const timer = setTimeout(() => setShow(true), 3000)
      return () => clearTimeout(timer)
    }

    // Listen for Chrome/Android install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setPromptEvent(e as BeforeInstallPromptEvent)
      setTimeout(() => setShow(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    setShow(false)
    localStorage.setItem('pwa-prompt-dismissed', '1')
  }

  async function install() {
    if (!promptEvent) return
    await promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
    }
    setShow(false)
  }

  if (!show || isInstalled) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 animate-slide-up">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl p-4 border border-slate-700">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">Install LET Reviewer</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {isIOS
                  ? 'Tap Share → Add to Home Screen'
                  : 'Add to your home screen for quick access'}
              </p>
            </div>
          </div>
          <button onClick={dismiss} className="p-1 hover:bg-slate-700 rounded-lg flex-shrink-0">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {!isIOS && (
          <button
            onClick={install}
            className="mt-3 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors"
          >
            Install App
          </button>
        )}

        {isIOS && (
          <div className="mt-3 bg-slate-800 rounded-xl p-3 text-xs text-slate-300 space-y-1">
            <p>1. Tap the <strong>Share</strong> button (↑) in Safari</p>
            <p>2. Scroll down and tap <strong>"Add to Home Screen"</strong></p>
            <p>3. Tap <strong>Add</strong> — done!</p>
          </div>
        )}
      </div>
    </div>
  )
}

import { LoginForm } from '@/components/auth/LoginForm'
import { ShieldCheck, Zap, ArrowRight } from 'lucide-react'

const features = [
  'Transferencias instantáneas y seguras',
  'Cifrado bancario de extremo a extremo',
  'Autenticación en dos factores (2FA)',
  'Monitoreo de fraude en tiempo real',
]

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL — branding ─────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 gradient-blue flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-white/5" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <span className="text-white text-xl font-bold">OpenPay</span>
        </div>

        {/* Hero copy */}
        <div className="relative space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Tus finanzas,<br />en un solo lugar.
            </h1>
            <p className="text-blue-200 mt-3 text-lg">
              La plataforma de pagos segura para personas y empresas modernas.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-blue-100">
                <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom tag */}
        <div className="relative">
          <p className="text-blue-300 text-xs">
            © 2025 OpenPay · Regulado y seguro
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL — form ────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-slate-50 px-6 py-12">

        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-slate-900 text-lg font-bold">OpenPay</span>
        </div>

        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>

    </div>
  )
}

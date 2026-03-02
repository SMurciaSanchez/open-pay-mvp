'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SendMoneyForm } from '@/components/transactions/SendMoneyForm';
import { TransactionsList } from '@/components/transactions/TransactionsList';
import { Toaster } from '@/components/ui/toaster';
import {
  Send,
  Download,
  CreditCard,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Wallet,
} from 'lucide-react';

// ── Quick actions ────────────────────────────────────────────
const quickActions = [
  {
    label: 'Enviar',
    href: '/dashboard/send',
    icon: Send,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    label: 'Recargar',
    href: '/dashboard/receive',
    icon: Download,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    label: 'Servicios',
    href: '/services',
    icon: CreditCard,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
  },
  {
    label: 'Contactos',
    href: '/contacts',
    icon: Users,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
];

// ── Stat cards ────────────────────────────────────────────────
const stats = [
  {
    label: 'Ingresos del mes',
    value: '$45,200',
    change: '+12.5%',
    up: true,
    icon: TrendingUp,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    label: 'Gastos del mes',
    value: '$12,380',
    change: '-3.2%',
    up: false,
    icon: TrendingDown,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
  },
  {
    label: 'Transferencias',
    value: '24',
    change: '+4 esta semana',
    up: true,
    icon: ArrowUpRight,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
];

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8 max-w-7xl mx-auto space-y-6">

      {/* ── HERO BALANCE CARD ──────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden gradient-blue p-6 lg:p-8 text-white">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-10 -right-4 h-40 w-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute top-8 right-32 h-20 w-20 rounded-full bg-white/5" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Balance info */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-4 w-4 text-blue-200" />
              <p className="text-sm text-blue-200 font-medium">Saldo disponible</p>
            </div>
            <h2 className="text-4xl font-bold tracking-tight mt-1">$12,520.35</h2>
            <p className="text-blue-300 text-sm mt-1 font-mono">MXN  ·  **** 3456</p>

            <div className="flex items-center gap-6 mt-5">
              <div>
                <div className="flex items-center gap-1 text-blue-200 text-xs mb-0.5">
                  <ArrowDownLeft className="h-3.5 w-3.5" />
                  Ingresos
                </div>
                <p className="text-white font-semibold">+$45,200</p>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <div className="flex items-center gap-1 text-blue-200 text-xs mb-0.5">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  Gastos
                </div>
                <p className="text-white font-semibold">-$12,380</p>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <div className="flex items-center gap-1 text-blue-200 text-xs mb-0.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Cuenta
                </div>
                <p className="text-white font-semibold text-sm">Verificada</p>
              </div>
            </div>
          </div>

          {/* Hero action buttons */}
          <div className="flex gap-3 shrink-0">
            <Button
              onClick={() => router.push('/dashboard/send')}
              className="bg-white text-blue-700 hover:bg-blue-50 font-semibold rounded-xl shadow-md"
            >
              <Send className="mr-2 h-4 w-4" />
              Enviar dinero
            </Button>
            <Button
              onClick={() => router.push('/dashboard/receive')}
              className="bg-white/10 text-white border border-white/20 hover:bg-white/20 font-semibold rounded-xl backdrop-blur-sm"
              variant="ghost"
            >
              <Download className="mr-2 h-4 w-4" />
              Recargar
            </Button>
          </div>
        </div>
      </div>

      {/* ── QUICK ACTIONS ROW ──────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <button
            key={action.href}
            onClick={() => router.push(action.href)}
            className="quick-action"
          >
            <div className={`quick-action-icon ${action.iconBg}`}>
              <action.icon className={`h-5 w-5 ${action.iconColor}`} />
            </div>
            <span className="text-xs font-semibold text-slate-600 group-hover:text-blue-600 transition-colors">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* ── STAT CARDS ROW ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="card-shadow border-slate-200 bg-white">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                  <span className={stat.up ? 'stat-up' : 'stat-down'} style={{ marginTop: 6, display: 'inline-block' }}>
                    {stat.change}
                  </span>
                </div>
                <div className={`h-10 w-10 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── MAIN CONTENT: transactions + send form ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TransactionsList limit={7} />
        </div>
        <div>
          <SendMoneyForm onSuccess={() => router.refresh()} />
        </div>
      </div>

      <Toaster />
    </div>
  );
}

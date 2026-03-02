'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowRightLeft,
  CreditCard,
  Users,
  Clock,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
  Shield,
  Zap,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

const mainNavItems: NavItem[] = [
  { title: 'Panel Principal', href: '/dashboard',     icon: LayoutDashboard },
  { title: 'Transferencias',  href: '/transfers',     icon: ArrowRightLeft },
  { title: 'Transacciones',   href: '/transactions',  icon: Clock,    badge: 3 },
  { title: 'Servicios',       href: '/services',      icon: CreditCard },
  { title: 'Contactos',       href: '/contacts',      icon: Users },
];

const bottomNavItems: NavItem[] = [
  { title: 'Configuración', href: '/settings',  icon: Settings },
  { title: 'Seguridad',     href: '/security',  icon: Shield },
  { title: 'Soporte',       href: '/support',   icon: HelpCircle },
  { title: 'Admin',         href: '/admin',     icon: Shield },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── DARK SIDEBAR ─────────────────────────────────── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between px-5 border-b border-slate-800 lg:h-[70px]">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-900/40">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-none">OpenPay</p>
              <p className="text-slate-500 text-[10px] leading-none mt-0.5">Finanzas seguras</p>
            </div>
          </Link>
          <button
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main nav */}
        <nav className="flex-1 overflow-auto px-3 py-5 space-y-0.5">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'sidebar-item',
                  isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                  <span className={cn(
                    'flex h-5 min-w-5 items-center justify-center rounded-full text-[11px] font-semibold px-1.5',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-600/20 text-blue-400'
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Section divider */}
          <div className="pt-5 pb-1">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              Mi cuenta
            </p>
          </div>

          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'sidebar-item',
                  isActive ? 'bg-slate-800 text-white' : 'sidebar-item-inactive'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* User card at bottom */}
        <div className="shrink-0 p-3 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800 mb-1">
            <div className="h-8 w-8 rounded-full bg-blue-600/30 flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Usuario</p>
              <p className="text-xs text-slate-500 truncate">usuario@mail.com</p>
            </div>
          </div>
          <button className="w-full sidebar-item sidebar-item-inactive text-red-400 hover:text-red-300 hover:bg-red-900/20">
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ────────────────────────────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Top header */}
        <header className="h-16 lg:h-[70px] bg-white border-b border-slate-200 shrink-0 card-shadow">
          <div className="flex h-full items-center gap-4 px-4 md:px-6">
            {/* Mobile menu button */}
            <button
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search bar */}
            <div className="hidden md:flex flex-1 max-w-xs items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Buscar..."
                className="flex-1 bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none border-none shadow-none p-0 focus:ring-0"
              />
            </div>

            <div className="ml-auto flex items-center gap-2">
              {/* Notification bell */}
              <button className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-100 transition-colors"
                  aria-expanded={isProfileOpen}
                  aria-haspopup="true"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    U
                  </div>
                  <span className="hidden md:block text-sm font-medium text-slate-700">
                    Usuario
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl card-shadow-md border border-slate-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Conectado como</p>
                      <p className="text-sm font-semibold text-slate-800 truncate">usuario@mail.com</p>
                    </div>
                    {[
                      { label: 'Mi perfil', href: '/profile' },
                      { label: 'Configuración', href: '/settings' },
                    ].map(({ label, href }) => (
                      <Link
                        key={href}
                        href={href}
                        className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        {label}
                      </Link>
                    ))}
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}

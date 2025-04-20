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
  Shield
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
  {
    title: 'Panel Principal',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Transferencias',
    href: '/transfers',
    icon: ArrowRightLeft,
  },
  {
    title: 'Transacciones',
    href: '/transactions',
    icon: Clock,
    badge: 3
  },
  {
    title: 'Pagos',
    href: '/payments',
    icon: CreditCard,
  },
  {
    title: 'Contactos',
    href: '/contacts',
    icon: Users,
  },
];

const bottomNavItems: NavItem[] = [
  {
    title: 'Configuración',
    href: '/settings',
    icon: Settings,
  },
  {
    title: 'Seguridad',
    href: '/security',
    icon: Shield,
  },
  {
    title: 'Ayuda',
    href: '/help',
    icon: HelpCircle,
  },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar (mobile overlay) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 lg:static lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex h-16 items-center justify-between px-4 border-b lg:h-[70px]">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary"></div>
              <span className="text-lg font-bold">OpenPay</span>
            </Link>
            <button 
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              onClick={toggleSidebar}
              aria-label="Cerrar menú lateral"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-auto py-6 px-3">
            <ul className="space-y-1.5">
              {mainNavItems.map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    className={cn(
                      "flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                      pathname === item.href 
                        ? "bg-primary text-white" 
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", pathname === item.href ? "text-white" : "text-gray-500")} />
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className={cn(
                        "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full text-xs",
                        pathname === item.href ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-10 space-y-2">
              <p className="px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Mi cuenta
              </p>
              <ul className="space-y-1.5">
                {bottomNavItems.map((item) => (
                  <li key={item.href}>
                    <Link 
                      href={item.href}
                      className={cn(
                        "flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                        pathname === item.href 
                          ? "bg-gray-100 text-gray-900" 
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <item.icon className="h-5 w-5 text-gray-500" />
                      <span>{item.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              
              <button
                className="w-full mt-8 flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navbar */}
        <header className="bg-white shadow-sm border-b h-16 lg:h-[70px]">
          <div className="flex h-full items-center px-4 md:px-6">
            <button 
              className="mr-4 p-2 rounded-md hover:bg-gray-100 lg:hidden"
              onClick={toggleSidebar}
              aria-label="Abrir menú lateral"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="ml-auto flex items-center gap-x-4">
              <button className="relative p-1.5 rounded-full hover:bg-gray-100">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary"></span>
              </button>
              
              <div className="relative">
                <button 
                  className="flex items-center gap-x-2 rounded-full p-1.5 hover:bg-gray-100"
                  onClick={toggleProfile}
                  aria-expanded={isProfileOpen}
                  aria-haspopup="true"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                    <User className="h-5 w-5" />
                  </div>
                  <span className="hidden md:inline-flex text-sm font-medium text-gray-700">
                    Usuario OpenPay
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm">Conectado como</p>
                      <p className="truncate text-sm font-medium text-gray-900">usuario@mail.com</p>
                    </div>
                    <Link 
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Mi perfil
                    </Link>
                    <Link 
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Configuración
                    </Link>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
} 
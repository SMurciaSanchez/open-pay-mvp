'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api, { User, Account, Transaction } from '@/lib/api';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import BalanceCard from '@/components/dashboard/BalanceCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import FinancialInsights from '@/components/dashboard/FinancialInsights';
import BalanceChart from '@/components/dashboard/BalanceChart';
import AccountSummary from '@/components/dashboard/AccountSummary';
import { ArrowDownRight, ArrowUpRight, CreditCard, DollarSign, Download, Users, Send, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { SendMoneyForm } from '@/components/transactions/SendMoneyForm';
import { TransactionsList } from '@/components/transactions/TransactionsList';
import { Toaster } from '@/components/ui/toaster';


// Mock data - en producción esto vendría de una API
const mockAccountData = {
  balance: 5284.75,
  currency: 'MXN',
  accountNumber: '1234 5678 9012 3456',
  recentTransactions: [
    {
      id: '1',
      type: 'deposit',
      amount: 2500,
      date: '2023-11-12T10:45:00',
      description: 'Depósito nómina',
      sender: 'Empresa XYZ',
      status: 'completed',
    },
    {
      id: '2',
      type: 'withdrawal',
      amount: 800,
      date: '2023-11-10T15:22:00',
      description: 'Retiro cajero',
      status: 'completed',
    },
    {
      id: '3',
      type: 'transfer',
      amount: 1200,
      date: '2023-11-08T09:15:00',
      description: 'Transferencia mensual',
      recipient: 'Juan Pérez',
      status: 'completed',
    },
  ],
};

const mockAllTransactions = [
  ...mockAccountData.recentTransactions,
  {
    id: '4',
    type: 'withdrawal',
    amount: 550,
    date: '2023-11-05T14:30:00',
    description: 'Pago de servicios',
    status: 'completed',
  },
  {
    id: '5',
    type: 'deposit',
    amount: 3000,
    date: '2023-11-01T11:20:00',
    description: 'Transferencia recibida',
    sender: 'Carlos López',
    status: 'completed',
  },
  {
    id: '6',
    type: 'transfer',
    amount: 750,
    date: '2023-10-28T16:45:00',
    description: 'Pago de renta',
    recipient: 'Inmobiliaria ABC',
    status: 'pending',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);
        
        // Fetch user profile data
        const userProfile = await api.getProfile();
        setUser(userProfile);
        
        // Fetch accounts
        const userAccounts = await api.getAccounts();
        setAccounts(userAccounts);
        
        // Fetch recent transactions
        const transactionData = await api.getTransactions({
          limit: 30 // Incrementamos el límite para tener más datos para las visualizaciones
        });
        setTransactions(transactionData.transactions);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('No se pudieron cargar los datos. Por favor, intenta nuevamente.');
        
        // If unauthorized, redirect to login
        if ((err as any).status === 401) {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    loadDashboardData();
  }, [router]);

  // Display loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="mb-4 inline-block rounded-full bg-primary-100 p-4">
            <svg className="h-8 w-8 animate-spin text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-lg font-medium text-neutral-900">Cargando tu información...</p>
        </div>
      </div>
    );
  }

  // Display error state
  if (error || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6 text-danger-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="mb-4 text-xl font-bold text-neutral-900">Ha ocurrido un problema</h2>
          <p className="text-neutral-600">{error || 'No se pudo cargar tu información'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  // Get the primary account for display (in a real app, might allow selection)
  const primaryAccount = accounts.length > 0 ? accounts[0] : null;

  const handleTransactionSuccess = (transactionId: string) => {
    router.refresh();
  };

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenido a tu panel de OpenPay. Administra tus finanzas desde aquí.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Saldo disponible
                </CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,520.35</div>
                <p className="text-xs text-muted-foreground mt-1">
                  +20% desde el mes pasado
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Acciones rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => router.push('/send-money')}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Enviar
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push('/topup')}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Recargar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <TransactionsList limit={5} />
        </div>
        
        <div>
          <SendMoneyForm onSuccess={handleTransactionSuccess} />
        </div>
      </div>
      
      <Toaster />
    </div>
  );
} 
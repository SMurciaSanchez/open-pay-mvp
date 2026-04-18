'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpRight, ArrowDownLeft, Wallet, CreditCard, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { transactionsApi, Transaction } from '@/lib/api/transactions';
import { formatCurrency, formatDate } from '@/lib/utils';

interface TransactionsListProps {
  limit?: number;
  showViewAll?: boolean;
}

export function TransactionsList({ limit, showViewAll = true }: TransactionsListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // For demo/MVP, use mock data
        const data = transactionsApi.getMockTransactions(limit || 10);
        setTransactions(data);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('No se pudieron cargar las transacciones');
        
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las transacciones',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [limit, toast]);

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'receive':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'topup':
        return <Wallet className="h-4 w-4 text-blue-500" />;
      case 'withdraw':
        return <CreditCard className="h-4 w-4 text-orange-500" />;
      default:
        return <ArrowUpRight className="h-4 w-4" />;
    }
  };

  const getTransactionTitle = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'send':
        return `Enviado a ${transaction.recipient?.name || 'usuario'}`;
      case 'receive':
        return `Recibido de ${transaction.sender?.name || 'usuario'}`;
      case 'topup':
        return 'Recarga de saldo';
      case 'withdraw':
        return 'Retiro a cuenta bancaria';
      default:
        return 'Transacción';
    }
  };

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completada</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendiente</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Fallida</Badge>;
      default:
        return null;
    }
  };

  const handleViewTransaction = (id: string) => {
    router.push(`/transactions/${id}`);
  };

  return (
    <div className="rounded-2xl bg-white border border-violet-100 overflow-hidden"
      style={{ boxShadow: '0 4px 20px rgba(124,58,237,0.08)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(124,58,237,0.08)' }}>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}
          >
            <ArrowUpRight className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base leading-none">Movimientos</h3>
            <p className="text-xs text-slate-400 mt-0.5">Historial de transacciones</p>
          </div>
        </div>
        {showViewAll && transactions.length > 0 && (
          <button
            onClick={() => router.push('/transactions')}
            className="text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors"
          >
            Ver todas →
          </button>
        )}
      </div>

      <div className="px-4 py-3">
        {loading ? (
          <div className="space-y-3 py-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-1">
                <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3.5 w-3/4 rounded-lg" />
                  <Skeleton className="h-3 w-1/2 rounded-lg" />
                </div>
                <Skeleton className="h-4 w-16 rounded-lg" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-700 text-sm">No se pudieron cargar</p>
              <p className="text-xs text-slate-400 mt-0.5">Intenta recargar la página</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors"
            >
              Reintentar →
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-violet-50 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-700 text-sm">Sin transacciones</p>
              <p className="text-xs text-slate-400 mt-0.5">Realiza tu primera transferencia</p>
            </div>
          </div>
        ) : (
          <div className="space-y-0.5">
            {transactions.map((transaction) => {
              const isPositive = transaction.type === 'receive' || transaction.type === 'topup';
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-all duration-150 hover:bg-violet-50/60 group"
                  onClick={() => handleViewTransaction(transaction.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                      isPositive ? 'bg-emerald-100' : 'bg-rose-100'
                    }`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800 leading-none">{getTransactionTitle(transaction)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-slate-400">{formatDate(transaction.date)}</p>
                        {transaction.status !== 'completed' && getStatusBadge(transaction.status)}
                      </div>
                    </div>
                  </div>
                  <p className={`font-bold text-sm tabular-nums ${isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {isPositive ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 
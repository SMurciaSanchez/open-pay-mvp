'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    <Card className="card-shadow border-slate-200 rounded-2xl bg-white">
      <CardHeader>
        <CardTitle>Transacciones</CardTitle>
        <CardDescription>
          Recent transactions · Transactions list
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">Cargando transacciones...</p>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No se pudieron cargar las transacciones</h3>
            <p className="text-sm text-muted-foreground">
              Intenta recargar la página o inténtalo más tarde
            </p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No hay transacciones</h3>
            <p className="text-sm text-muted-foreground">
              Realiza tu primera transacción para verla aquí
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {transactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between p-3 hover:bg-secondary rounded-lg cursor-pointer transition-colors"
                onClick={() => handleViewTransaction(transaction.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-2 ${
                    transaction.type === 'receive' || transaction.type === 'topup' 
                      ? 'bg-green-100' 
                      : 'bg-red-100'
                  }`}>
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{getTransactionTitle(transaction)}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                      {transaction.status !== 'completed' && 
                        getStatusBadge(transaction.status)
                      }
                    </div>
                  </div>
                </div>
                <p className={`font-medium ${
                  transaction.type === 'receive' || transaction.type === 'topup'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {transaction.type === 'receive' || transaction.type === 'topup' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {showViewAll && transactions.length > 0 && (
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => router.push('/transactions')}
          >
            Ver todas las transacciones
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  CreditCard, 
  AlertCircle, 
  Check, 
  Copy, 
  ChevronLeft 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { transactionsApi, Transaction } from '@/lib/api/transactions';
import { formatCurrency, formatDate } from '@/lib/utils';

interface TransactionDetailProps {
  transactionId: string;
}

export function TransactionDetail({ transactionId }: TransactionDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // For demo/MVP, get from mock data
        const allTransactions = transactionsApi.getMockTransactions(20);
        const foundTransaction = allTransactions.find(tx => tx.id === transactionId);
        
        if (!foundTransaction) {
          throw new Error('Transacción no encontrada');
        }
        
        setTransaction(foundTransaction);
      } catch (err) {
        console.error('Error fetching transaction:', err);
        setError('No se pudo cargar la información de la transacción');
        
        toast({
          title: 'Error',
          description: 'No se pudo cargar la información de la transacción',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (transactionId) {
      fetchTransaction();
    }
  }, [transactionId, toast]);

  const getTransactionIcon = (type?: Transaction['type']) => {
    if (!type) return <CreditCard className="h-5 w-5" />;
    
    switch (type) {
      case 'send':
        return <ArrowUpRight className="h-5 w-5 text-red-500" />;
      case 'receive':
        return <ArrowDownLeft className="h-5 w-5 text-green-500" />;
      case 'topup':
        return <Wallet className="h-5 w-5 text-blue-500" />;
      case 'withdraw':
        return <CreditCard className="h-5 w-5 text-orange-500" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status?: Transaction['status']) => {
    if (!status) return null;
    
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

  const getTransactionTitle = (transaction?: Transaction | null) => {
    if (!transaction) return 'Transacción';
    
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

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado',
      description: message,
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !transaction) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            No se pudo cargar la información de la transacción
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <h3 className="mt-4 text-lg font-semibold">
              {error || 'Transacción no encontrada'}
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Intenta nuevamente o revisa el ID de la transacción
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => router.back()}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getTransactionIcon(transaction.type)}
              {getTransactionTitle(transaction)}
            </CardTitle>
            <CardDescription className="mt-1">
              {formatDate(transaction.date, 'PPpp')}
            </CardDescription>
          </div>
          {getStatusBadge(transaction.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center items-center py-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Importe</p>
            <p className={`text-3xl font-bold mt-1 ${
              transaction.type === 'receive' || transaction.type === 'topup'
                ? 'text-green-600'
                : 'text-red-600'
            }`}>
              {transaction.type === 'receive' || transaction.type === 'topup' ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </p>
          </div>
        </div>

        <div className="rounded-md border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tipo</span>
            <span className="font-medium">{
              {
                send: 'Envío',
                receive: 'Recibido',
                topup: 'Recarga',
                withdraw: 'Retiro'
              }[transaction.type]
            }</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Concepto</span>
            <span className="font-medium">{transaction.concept}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Referencia</span>
            <div className="flex items-center gap-1">
              <span className="font-medium">{transaction.reference}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={() => copyToClipboard(
                  transaction.reference, 
                  'Referencia copiada al portapapeles'
                )}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {transaction.recipient && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Destinatario</span>
              <span className="font-medium">{transaction.recipient.name}</span>
            </div>
          )}
          
          {transaction.sender && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Remitente</span>
              <span className="font-medium">{transaction.sender.name}</span>
            </div>
          )}
          
          {transaction.status === 'completed' && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Estado</span>
              <div className="flex items-center gap-1 text-green-600">
                <Check className="h-4 w-4" />
                <span className="font-medium">Completada</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => router.back()}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </CardFooter>
    </Card>
  );
} 
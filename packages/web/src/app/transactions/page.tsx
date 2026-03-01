'use client';

import { TransactionsList } from '@/components/transactions/TransactionsList';
import { Toaster } from '@/components/ui/toaster';


export default function TransactionsPage() {
  return (
    <div className="container py-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Mis transacciones</h1>
        <p className="text-muted-foreground mt-2">
          Revisa el historial completo de tus movimientos
        </p>
      </div>
      
      <TransactionsList showViewAll={false} />
      
      <Toaster />
    </div>
  );
} 
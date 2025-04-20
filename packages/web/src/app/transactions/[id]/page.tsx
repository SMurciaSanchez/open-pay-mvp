'use client';

import { TransactionDetail } from '@/components/transactions/TransactionDetail';
import { Toaster } from '@/components/ui/toaster';

interface TransactionDetailPageProps {
  params: {
    id: string;
  };
}

export default function TransactionDetailPage({ params }: TransactionDetailPageProps) {
  return (
    <div className="container py-10 max-w-2xl mx-auto">
      <TransactionDetail transactionId={params.id} />
      <Toaster />
    </div>
  );
} 
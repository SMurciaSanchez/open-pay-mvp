import TransferForm from '@/components/transfers/TransferForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transferencias | OpenPay',
  description: 'Realiza transferencias bancarias de forma segura y rápida con OpenPay',
}

export default function TransfersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Transferencias Bancarias</h1>
        <TransferForm />
      </div>
    </div>
  );
} 
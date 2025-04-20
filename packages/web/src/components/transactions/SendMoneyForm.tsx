'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { transactionsApi, TransactionRequest } from '@/lib/api/transactions';
import { formatCurrency } from '@/lib/utils';

interface SendMoneyFormProps {
  onSuccess?: (transactionId: string) => void;
}

export function SendMoneyForm({ onSuccess }: SendMoneyFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<TransactionRequest>({
    amount: 0,
    recipient: '',
    concept: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof TransactionRequest, string>>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // For amount field, handle numeric input specifically
    if (name === 'amount') {
      const numValue = parseFloat(value);
      setFormData(prev => ({
        ...prev,
        [name]: isNaN(numValue) ? 0 : numValue,
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error for this field if it exists
    if (errors[name as keyof TransactionRequest]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TransactionRequest, string>> = {};

    if (formData.amount <= 0) {
      newErrors.amount = 'Ingresa un monto válido mayor a 0';
    }

    if (!formData.recipient.trim()) {
      newErrors.recipient = 'Ingresa el correo electrónico del destinatario';
    } else if (!formData.recipient.includes('@')) {
      newErrors.recipient = 'Ingresa un correo electrónico válido';
    }

    if (!formData.concept.trim()) {
      newErrors.concept = 'Ingresa un concepto para la transferencia';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // For demo/MVP, use mock API
      const transaction = await transactionsApi.mockSend(formData);
      
      // Reset form
      setFormData({
        amount: 0,
        recipient: '',
        concept: '',
      });
      
      // Show success message
      toast({
        title: '¡Transferencia exitosa!',
        description: `Has enviado ${formatCurrency(transaction.amount)} a ${transaction.recipient?.name || transaction.recipient?.email}`,
        variant: 'success',
      });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(transaction.id);
      }
    } catch (error: any) {
      console.error('Error en transferencia:', error);
      
      toast({
        title: 'Error en la transferencia',
        description: error.message || 'No se pudo completar la transferencia. Intenta de nuevo más tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enviar dinero</CardTitle>
        <CardDescription>
          Envía dinero a otros usuarios de OpenPay
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Monto a enviar (MXN)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.amount || ''}
                onChange={handleChange}
                className={`pl-8 ${errors.amount ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-red-500">{errors.amount}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient">Correo electrónico del destinatario</Label>
            <Input
              id="recipient"
              name="recipient"
              type="email"
              placeholder="usuario@ejemplo.com"
              value={formData.recipient}
              onChange={handleChange}
              className={errors.recipient ? 'border-red-500' : ''}
            />
            {errors.recipient && (
              <p className="text-xs text-red-500">{errors.recipient}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="concept">Concepto</Label>
            <Textarea
              id="concept"
              name="concept"
              placeholder="Escribe el motivo de la transferencia"
              value={formData.concept}
              onChange={handleChange}
              className={errors.concept ? 'border-red-500' : ''}
              rows={3}
            />
            {errors.concept && (
              <p className="text-xs text-red-500">{errors.concept}</p>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? 'Procesando...' : 'Enviar dinero'}
        </Button>
      </CardFooter>
    </Card>
  );
} 
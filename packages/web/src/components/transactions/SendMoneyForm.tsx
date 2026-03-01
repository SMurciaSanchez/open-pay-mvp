'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

interface SendMoneyFormProps {
  onSuccess?: (transactionId: string) => void;
}

interface FormData {
  amount: number;
  recipient: string;
  concept: string;
}

function generateIdempotencyKey() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

export function SendMoneyForm({ onSuccess }: SendMoneyFormProps) {
  const { toast } = useToast();

  // La clave se genera una vez por sesión del formulario, no en cada submit
  const idempotencyKey = useRef(generateIdempotencyKey());

  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false); // Bloqueo permanente tras éxito
  const [formData, setFormData] = useState<FormData>({ amount: 0, recipient: '', concept: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? (parseFloat(value) || 0) : value,
    }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (formData.amount <= 0) newErrors.amount = 'Ingresa un monto válido mayor a 0';
    if (!formData.recipient.trim()) newErrors.recipient = 'Ingresa el correo del destinatario';
    else if (!formData.recipient.includes('@')) newErrors.recipient = 'Correo electrónico inválido';
    if (!formData.concept.trim()) newErrors.concept = 'Ingresa un concepto';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Doble protección: si ya está cargando o ya fue enviado, ignorar
    if (isLoading || submitted) return;
    if (!validate()) return;

    // Bloquear inmediatamente antes del request
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('No autenticado');

      const { data, error } = await supabase.rpc('transfer_funds', {
        p_sender_email:    user.email,
        p_receiver_email:  formData.recipient,
        p_amount:          formData.amount,
        p_description:     formData.concept,
        p_idempotency_key: idempotencyKey.current,
      });

      if (error) throw new Error(error.message);

      // Marcar como enviado (bloqueo permanente del formulario)
      setSubmitted(true);

      toast({
        title: '¡Transferencia exitosa!',
        description: `Enviaste ${formatCurrency(formData.amount)} a ${formData.recipient}`,
      });

      if (onSuccess) onSuccess(data.id);

    } catch (error: any) {
      toast({
        title: 'Error en la transferencia',
        description: error.message || 'No se pudo completar la transferencia.',
        variant: 'destructive',
      });
      // Regenerar la clave solo si falló (para poder reintentar con clave fresca)
      idempotencyKey.current = generateIdempotencyKey();
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10 gap-3">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-semibold text-lg">Transferencia enviada</p>
          <p className="text-sm text-muted-foreground">{formatCurrency(formData.amount)} a {formData.recipient}</p>
          <Button variant="outline" onClick={() => {
            setSubmitted(false);
            setFormData({ amount: 0, recipient: '', concept: '' });
            idempotencyKey.current = generateIdempotencyKey();
          }}>
            Nueva transferencia
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enviar dinero</CardTitle>
        <CardDescription>Envía dinero a otros usuarios de OpenPay</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Monto (MXN)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="amount" name="amount" type="number" min="0.01" step="0.01"
                placeholder="0.00" value={formData.amount || ''}
                onChange={handleChange} disabled={isLoading}
                className={`pl-8 ${errors.amount ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient">Correo del destinatario</Label>
            <Input
              id="recipient" name="recipient" type="email"
              placeholder="usuario@ejemplo.com" value={formData.recipient}
              onChange={handleChange} disabled={isLoading}
              className={errors.recipient ? 'border-red-500' : ''}
            />
            {errors.recipient && <p className="text-xs text-red-500">{errors.recipient}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="concept">Concepto</Label>
            <Textarea
              id="concept" name="concept" rows={3}
              placeholder="Motivo de la transferencia"
              value={formData.concept} onChange={handleChange}
              disabled={isLoading}
              className={errors.concept ? 'border-red-500' : ''}
            />
            {errors.concept && <p className="text-xs text-red-500">{errors.concept}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Procesando...
              </span>
            ) : 'Enviar dinero'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

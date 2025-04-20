'use client';

import { IdentityVerification } from '@/components/auth/IdentityVerification';
import { Toaster } from '@/components/ui/toaster';

export default function VerificationPage() {
  return (
    <div className="container py-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Verificación de identidad</h1>
        <p className="text-muted-foreground mt-2">
          Completa la verificación de identidad para acceder a todas las funcionalidades de tu cuenta.
        </p>
      </div>
      
      <IdentityVerification />
      
      <Toaster />
    </div>
  );
} 
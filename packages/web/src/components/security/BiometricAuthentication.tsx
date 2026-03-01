'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Fingerprint, Clock } from 'lucide-react';

export function BiometricAuthentication() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5" />
          Autenticación Biométrica
          <Badge variant="secondary">Próximamente</Badge>
        </CardTitle>
        <CardDescription>
          Accede con huella digital o reconocimiento facial
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-center text-muted-foreground">
          <Clock className="h-10 w-10 opacity-40" />
          <p className="font-medium">Función en desarrollo</p>
          <p className="text-sm max-w-xs">
            La autenticación biométrica (WebAuthn) estará disponible en una próxima versión.
            Por ahora tu cuenta está protegida con correo y contraseña.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default BiometricAuthentication;

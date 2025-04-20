'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, SmartphoneNfc, Mail, LockKeyhole, ShieldAlert, ShieldCheck } from 'lucide-react';

export function TwoFactorAuthentication() {
  const { securitySettings, enableTwoFactor, disableTwoFactor, verifyTwoFactor } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [setupKey, setSetupKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeMethod, setActiveMethod] = useState<'app' | 'sms' | 'email'>('app');
  const [isSetupMode, setIsSetupMode] = useState(false);

  const handleToggleTwoFactor = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (securitySettings.twoFactorEnabled) {
        const result = await disableTwoFactor();
        if (result) {
          setSuccess('La autenticación de dos factores ha sido desactivada');
        } else {
          setError('No se pudo desactivar la autenticación de dos factores');
        }
      } else {
        // Iniciar el proceso de configuración
        setIsSetupMode(true);
        const { qrCode, secretKey } = await enableTwoFactor(activeMethod);
        setQrCodeUrl(qrCode);
        setSetupKey(secretKey);
      }
    } catch (err) {
      console.error('Error con la autenticación de dos factores:', err);
      setError('Ocurrió un error al configurar la autenticación de dos factores');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Ingresa un código de verificación válido de 6 dígitos');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await verifyTwoFactor(verificationCode);
      if (result) {
        setSuccess('La autenticación de dos factores ha sido activada correctamente');
        setIsSetupMode(false);
        setVerificationCode('');
      } else {
        setError('Código de verificación incorrecto. Inténtalo de nuevo.');
      }
    } catch (err) {
      console.error('Error al verificar código:', err);
      setError('Ocurrió un error al verificar el código');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMethodChange = (method: 'app' | 'sms' | 'email') => {
    setActiveMethod(method);
  };

  const getMethodIcon = (method: 'app' | 'sms' | 'email') => {
    switch (method) {
      case 'app':
        return <SmartphoneNfc className="h-5 w-5" />;
      case 'sms':
        return <Mail className="h-5 w-5" />;
      case 'email':
        return <Mail className="h-5 w-5" />;
      default:
        return <LockKeyhole className="h-5 w-5" />;
    }
  };

  const getMethodName = (method: 'app' | 'sms' | 'email') => {
    switch (method) {
      case 'app':
        return 'Aplicación Autenticadora';
      case 'sms':
        return 'SMS';
      case 'email':
        return 'Correo Electrónico';
      default:
        return 'Método Desconocido';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            {securitySettings.twoFactorEnabled ? 
              <ShieldCheck className="h-12 w-12 text-primary" /> : 
              <ShieldAlert className="h-12 w-12 text-muted-foreground" />
            }
            <div>
              <CardTitle>Autenticación de Dos Factores</CardTitle>
              <CardDescription>
                Añade una capa adicional de seguridad a tu cuenta
              </CardDescription>
            </div>
          </div>
          {securitySettings.twoFactorMethod && (
            <Badge variant={securitySettings.twoFactorEnabled ? "success" : "outline"}>
              {securitySettings.twoFactorEnabled ? 
                `Activado (${getMethodName(securitySettings.twoFactorMethod as any)})` : 
                "Desactivado"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!isSetupMode ? (
          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <p className="text-sm">
                La autenticación de dos factores añade una capa adicional de seguridad a tu cuenta 
                requiriendo un segundo método de verificación además de tu contraseña.
              </p>
            </div>
            
            <div className="flex items-center justify-between space-x-2">
              <label 
                htmlFor="2fa-toggle" 
                className="flex flex-col space-y-1 cursor-pointer"
              >
                <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Habilitar Autenticación de Dos Factores
                </span>
                <span className="text-xs text-muted-foreground">
                  {securitySettings.twoFactorEnabled
                    ? "La autenticación de dos factores está actualmente habilitada"
                    : "Protege tu cuenta con una capa adicional de seguridad"}
                </span>
              </label>
              <Switch
                id="2fa-toggle"
                checked={securitySettings.twoFactorEnabled}
                onCheckedChange={handleToggleTwoFactor}
                disabled={isLoading}
              />
            </div>

            {!securitySettings.twoFactorEnabled && (
              <Tabs 
                defaultValue={activeMethod} 
                onValueChange={(v) => handleMethodChange(v as any)}
                className="mt-6"
              >
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="app" className="flex items-center gap-2">
                    <SmartphoneNfc className="h-4 w-4" />
                    <span>App</span>
                  </TabsTrigger>
                  <TabsTrigger value="sms" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>SMS</span>
                  </TabsTrigger>
                  <TabsTrigger value="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="app" className="space-y-4 mt-4">
                  <div className="rounded-md border p-4">
                    <h4 className="text-sm font-medium">Aplicación Autenticadora</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Usa una aplicación como Google Authenticator, Microsoft Authenticator o Authy 
                      para generar códigos de verificación únicos.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="sms" className="space-y-4 mt-4">
                  <div className="rounded-md border p-4">
                    <h4 className="text-sm font-medium">Autenticación por SMS</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recibe códigos de verificación por mensaje de texto en tu teléfono móvil.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="email" className="space-y-4 mt-4">
                  <div className="rounded-md border p-4">
                    <h4 className="text-sm font-medium">Autenticación por Email</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recibe códigos de verificación en tu dirección de correo electrónico.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-md border p-4">
              <h3 className="font-medium mb-2">Configuración de {getMethodName(activeMethod)}</h3>
              
              {activeMethod === 'app' && (
                <div className="space-y-4">
                  {qrCodeUrl && (
                    <div className="flex flex-col items-center justify-center p-4 bg-muted/20 rounded-lg">
                      <QrCode className="h-32 w-32 text-primary mb-2" />
                      <p className="text-xs text-center text-muted-foreground">
                        Escanea este código QR con tu aplicación de autenticación
                      </p>
                    </div>
                  )}
                  
                  {setupKey && (
                    <div className="p-3 bg-muted/20 rounded-md">
                      <p className="text-xs mb-1">O ingresa este código manualmente:</p>
                      <p className="font-mono text-sm text-center py-2 bg-background rounded border">
                        {setupKey}
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {(activeMethod === 'sms' || activeMethod === 'email') && (
                <p className="text-sm mb-4">
                  Se ha enviado un código de verificación a tu {activeMethod === 'sms' ? 'teléfono' : 'correo electrónico'}.
                </p>
              )}
              
              <div className="mt-4 space-y-2">
                <label htmlFor="verification-code" className="text-sm font-medium">
                  Código de verificación
                </label>
                <div className="flex gap-2">
                  <Input
                    id="verification-code"
                    placeholder="Ingresa el código de 6 dígitos"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                  />
                  <Button 
                    onClick={handleVerifyCode} 
                    disabled={isLoading || verificationCode.length !== 6}
                  >
                    Verificar
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setIsSetupMode(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mt-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mt-4 rounded-md bg-primary/15 p-3 text-sm text-primary">
            {success}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t px-6 py-4">
        <p className="text-xs text-muted-foreground">
          La autenticación de dos factores protege tu cuenta incluso si tu contraseña es comprometida.
        </p>
      </CardFooter>
    </Card>
  );
} 
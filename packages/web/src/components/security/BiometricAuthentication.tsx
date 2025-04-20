'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Fingerprint, 
  AlertCircle, 
  Shield, 
  ShieldCheck, 
  ShieldX,
  Info,
  Loader2
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { 
  isBiometricsSupported,
  isPlatformAuthenticatorAvailable,
  registerBiometric,
  authenticateWithBiometric,
  removeBiometricRegistration,
  isBiometricRegistered,
  BiometricStatus,
  getBiometricStatus
} from '@/lib/biometrics';
import { useAuth } from '@/lib/auth';

export function BiometricAuthentication() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [biometricStatus, setBiometricStatus] = useState<BiometricStatus>('unknown');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  useEffect(() => {
    const checkBiometricStatus = async () => {
      const status = await getBiometricStatus();
      setBiometricStatus(status);
    };

    checkBiometricStatus();
  }, []);

  const handleToggleBiometrics = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para configurar la autenticación biométrica",
        variant: "destructive",
      });
      return;
    }

    if (biometricStatus === 'registered') {
      // Disable biometrics
      setIsLoading(true);
      try {
        removeBiometricRegistration();
        setBiometricStatus('not-registered');
        toast({
          title: "Biometría desactivada",
          description: "La autenticación biométrica ha sido desactivada correctamente",
        });
      } catch (error) {
        console.error('Error disabling biometrics:', error);
        toast({
          title: "Error",
          description: "No se pudo desactivar la autenticación biométrica",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // Enable biometrics
      setIsRegistering(true);
      try {
        const result = await registerBiometric(user.id, user.email);
        
        if (result.success) {
          setBiometricStatus('registered');
          toast({
            title: "Biometría activada",
            description: "La autenticación biométrica ha sido configurada correctamente",
          });
        } else {
          toast({
            title: "Error",
            description: result.error || "No se pudo activar la autenticación biométrica",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error('Error enabling biometrics:', error);
        toast({
          title: "Error",
          description: error.message || "No se pudo activar la autenticación biométrica",
          variant: "destructive",
        });
      } finally {
        setIsRegistering(false);
      }
    }
  };

  const handleTestBiometrics = async () => {
    setIsTesting(true);
    try {
      const result = await authenticateWithBiometric();
      
      if (result.success) {
        toast({
          title: "Verificación exitosa",
          description: "Tu autenticación biométrica funciona correctamente",
        });
      } else {
        toast({
          title: "Verificación fallida",
          description: result.error || "No se pudo verificar tu biometría",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error testing biometrics:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo verificar tu biometría",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const renderStatusBadge = () => {
    switch (biometricStatus) {
      case 'registered':
        return <Badge className="ml-2 bg-green-500">Activado</Badge>;
      case 'not-registered':
        return <Badge className="ml-2" variant="outline">Desactivado</Badge>;
      case 'unavailable':
        return <Badge className="ml-2" variant="secondary">No disponible</Badge>;
      case 'unsupported':
        return <Badge className="ml-2" variant="destructive">No compatible</Badge>;
      default:
        return <Badge className="ml-2" variant="secondary">Verificando...</Badge>;
    }
  };

  const renderContent = () => {
    if (biometricStatus === 'unknown') {
      return (
        <div className="flex justify-center items-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Verificando disponibilidad de autenticación biométrica...</p>
        </div>
      );
    }

    if (biometricStatus === 'unsupported') {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No compatible</AlertTitle>
          <AlertDescription>
            Tu navegador no es compatible con la autenticación biométrica.
            Intenta con un navegador más reciente como Chrome, Firefox o Edge.
          </AlertDescription>
        </Alert>
      );
    }

    if (biometricStatus === 'unavailable') {
      return (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No disponible</AlertTitle>
          <AlertDescription>
            Tu dispositivo no tiene un autenticador de plataforma disponible (huella digital, reconocimiento facial, etc.).
            Esto podría deberse a que tu dispositivo no tiene hardware biométrico o no está configurado.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label 
              htmlFor="biometric-switch"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {biometricStatus === 'registered' ? 'Desactivar' : 'Activar'} autenticación biométrica
            </label>
            <p className="text-sm text-muted-foreground">
              {biometricStatus === 'registered' 
                ? 'La autenticación biométrica está activada para esta cuenta' 
                : 'Utiliza tu huella digital o reconocimiento facial para acceder a tu cuenta de forma segura'}
            </p>
          </div>
          <Switch
            id="biometric-switch"
            checked={biometricStatus === 'registered'}
            onCheckedChange={handleToggleBiometrics}
            disabled={isLoading || isRegistering}
          />
        </div>

        {biometricStatus === 'registered' && (
          <div className="pt-2">
            <Button 
              variant="outline" 
              onClick={handleTestBiometrics}
              disabled={isTesting}
              className="w-full"
            >
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Fingerprint className="mr-2 h-4 w-4" />
                  Probar autenticación biométrica
                </>
              )}
            </Button>
          </div>
        )}

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>Mayor seguridad</AlertTitle>
          <AlertDescription>
            La autenticación biométrica añade una capa adicional de seguridad a tu cuenta,
            ya que solo tú puedes proporcionar tu huella digital o rostro.
          </AlertDescription>
        </Alert>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Fingerprint className="mr-2 h-5 w-5" />
          Autenticación Biométrica
          {renderStatusBadge()}
        </CardTitle>
        <CardDescription>
          Utiliza tu huella digital o reconocimiento facial para acceder a tu cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
      {(biometricStatus === 'registered' || biometricStatus === 'not-registered') && (
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <div className="flex items-center text-sm text-muted-foreground">
            {biometricStatus === 'registered' ? (
              <>
                <ShieldCheck className="mr-1 h-4 w-4 text-green-500" />
                Autenticación biométrica activa
              </>
            ) : (
              <>
                <ShieldX className="mr-1 h-4 w-4 text-muted-foreground" />
                Autenticación biométrica no configurada
              </>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
} 
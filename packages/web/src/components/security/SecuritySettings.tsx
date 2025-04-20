'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import SecurityKey from '@/components/security/SecurityKey';
import { Badge } from '@/components/ui/badge';
import { Shield, Smartphone } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

interface SecuritySettingsProps {
  initialState?: {
    is2FAEnabled: boolean;
    isEmailVerificationEnabled: boolean;
  };
}

export function SecuritySettings({ 
  initialState = { 
    is2FAEnabled: false, 
    isEmailVerificationEnabled: true 
  } 
}: SecuritySettingsProps) {
  const [is2FAEnabled, setIs2FAEnabled] = useState(initialState.is2FAEnabled);
  const [isEmailVerificationEnabled, setIsEmailVerificationEnabled] = useState(
    initialState.isEmailVerificationEnabled
  );
  const [showOtpSetup, setShowOtpSetup] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleOtpGenerate = (key: string) => {
    // En una aplicación real, enviaríamos este código al servidor
    // y el servidor lo enviaría al correo electrónico o teléfono del usuario
    console.log('Generated OTP key:', key);
    
    // Simulamos enviar el código al servidor
    toast({
      title: "Código generado",
      description: "Se ha enviado un código de verificación a su correo electrónico.",
    });
  };

  const handleOtpVerify = (result: boolean) => {
    setOtpVerified(result);
    
    if (result) {
      setIsLoading(true);
      
      // En una aplicación real, enviaríamos una confirmación al servidor
      // Simulamos una llamada a la API
      setTimeout(() => {
        setIs2FAEnabled(true);
        setShowOtpSetup(false);
        setIsLoading(false);
        
        toast({
          title: "Verificación en dos pasos activada",
          description: "Su cuenta ahora está protegida con verificación en dos pasos.",
          variant: "success",
        });
      }, 1000);
    } else {
      toast({
        title: "Código incorrecto",
        description: "El código que ha introducido no es válido. Inténtelo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleToggle2FA = () => {
    if (!is2FAEnabled) {
      setShowOtpSetup(true);
    } else {
      setIsLoading(true);
      
      // Simulamos desactivar 2FA en el servidor
      setTimeout(() => {
        setIs2FAEnabled(false);
        setOtpVerified(false);
        setIsLoading(false);
        
        toast({
          title: "Verificación en dos pasos desactivada",
          description: "La verificación en dos pasos ha sido desactivada. Su cuenta es menos segura ahora.",
          variant: "default",
        });
      }, 1000);
    }
  };

  const handleToggleEmailVerification = (checked: boolean) => {
    setIsLoading(true);
    
    // Simulamos actualizar la configuración en el servidor
    setTimeout(() => {
      setIsEmailVerificationEnabled(checked);
      setIsLoading(false);
      
      toast({
        title: checked ? "Verificación por correo activada" : "Verificación por correo desactivada",
        description: checked 
          ? "Recibirá un correo de verificación cuando inicie sesión desde un nuevo dispositivo." 
          : "Ya no recibirá correos de verificación al iniciar sesión desde nuevos dispositivos.",
        variant: checked ? "success" : "default",
      });
    }, 800);
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Verificación en dos pasos</CardTitle>
            </div>
            <Badge variant={is2FAEnabled ? "success" : "outline"}>
              {is2FAEnabled ? "Activado" : "Desactivado"}
            </Badge>
          </div>
          <CardDescription>
            Añada una capa adicional de seguridad a su cuenta requiriendo un código además de su contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Smartphone className="h-8 w-8 text-gray-400" />
            <div className="flex-1">
              <p className="font-medium">Autenticación con código OTP</p>
              <p className="text-sm text-muted-foreground">
                Recibirá un código de un solo uso en su correo electrónico o teléfono cada vez que inicie sesión.
              </p>
            </div>
            <Switch
              checked={is2FAEnabled}
              onCheckedChange={handleToggle2FA}
              disabled={isLoading}
              aria-label="Toggle 2FA"
            />
          </div>

          {showOtpSetup && (
            <div className="mt-6 border-t pt-6">
              <div className="mb-4">
                <h3 className="text-sm font-medium">Configurar verificación en dos pasos</h3>
                <p className="text-sm text-muted-foreground">
                  {otpVerified ? 
                    "Verificación completada correctamente." : 
                    "Complete estos pasos para activar la verificación en dos pasos."}
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                      1
                    </div>
                    <h4 className="font-medium">Genera tu código de verificación</h4>
                  </div>
                  <SecurityKey mode="generate" onGenerate={handleOtpGenerate} />
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                      2
                    </div>
                    <h4 className="font-medium">Verifica el código</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Introduzca el código que acaba de recibir para verificar la configuración.
                  </p>
                  <SecurityKey mode="verify" onVerify={handleOtpVerify} />
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-between">
          <p className="text-sm text-muted-foreground">
            Última actualización: {new Date().toLocaleDateString()}
          </p>
          {is2FAEnabled && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleToggle2FA}
              disabled={isLoading}
            >
              {isLoading ? "Desactivando..." : "Desactivar"}
            </Button>
          )}
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Verificación por correo electrónico</CardTitle>
          </div>
          <CardDescription>
            Reciba un correo electrónico de confirmación cuando inicie sesión desde un nuevo dispositivo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="email-verification" className="flex-1">
              Activar verificación por correo
            </Label>
            <Switch
              id="email-verification"
              checked={isEmailVerificationEnabled}
              onCheckedChange={handleToggleEmailVerification}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
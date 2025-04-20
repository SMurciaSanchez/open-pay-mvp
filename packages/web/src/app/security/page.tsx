'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/toaster';

import IdentityVerification from '@/components/security/IdentityVerification';
import TwoFactorAuthentication from '@/components/security/TwoFactorAuthentication';
import BiometricAuthentication from '@/components/security/BiometricAuthentication';
import ActiveSessions from '@/components/security/ActiveSessions';
import SecurityAlerts from '@/components/security/SecurityAlerts';

export const metadata = {
  title: 'Security | OpenPay',
  description: 'Manage your account security and privacy settings',
};

export default function SecurityPage() {
  return (
    <div className="container max-w-5xl py-8">
      <div className="space-y-0.5 mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Seguridad</h2>
        <p className="text-muted-foreground">
          Administra la seguridad de tu cuenta y protege tu información personal
        </p>
      </div>
      <Separator className="my-6" />
      
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="identity">Identidad</TabsTrigger>
          <TabsTrigger value="2fa">Autenticación 2FA</TabsTrigger>
          <TabsTrigger value="biometric">Biometría</TabsTrigger>
          <TabsTrigger value="sessions">Sesiones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Centro de Alertas de Seguridad</CardTitle>
              <CardDescription>
                Visualiza y administra alertas de seguridad relacionadas con tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SecurityAlerts showHeader={false} limit={10} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="identity" className="space-y-4">
          <IdentityVerification />
        </TabsContent>
        
        <TabsContent value="2fa" className="space-y-4">
          <TwoFactorAuthentication />
        </TabsContent>
        
        <TabsContent value="biometric" className="space-y-4">
          <BiometricAuthentication />
        </TabsContent>
        
        <TabsContent value="sessions" className="space-y-4">
          <ActiveSessions />
        </TabsContent>
      </Tabs>
      
      <Toaster />
    </div>
  );
} 
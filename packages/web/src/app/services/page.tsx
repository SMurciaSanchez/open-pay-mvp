'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServicePaymentForm } from '@/components/services/ServicePaymentForm';
import { Separator } from '@/components/ui/separator';
import { Icons } from '@/components/ui/icons';


export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState('payment');

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-2">Pago de Servicios</h1>
      <p className="text-muted-foreground mb-8">
        Paga tus servicios de manera rápida y segura.
      </p>

      <Tabs defaultValue="payment" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full md:w-[400px] mb-8">
          <TabsTrigger value="payment">Pago</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="payment">
          <ServicePaymentForm />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Pagos</CardTitle>
              <CardDescription>
                Visualiza tus pagos de servicios realizados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="rounded-full bg-muted p-6">
                  <Icons.clock className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">No hay pagos recientes</h3>
                <p className="text-muted-foreground max-w-md">
                  Cuando realices pagos de servicios, aparecerán aquí para que puedas
                  consultarlos fácilmente.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
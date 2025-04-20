'use client';

import { useState, useEffect } from 'react';
import { Transaction } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

type BalanceChartProps = {
  transactions: Transaction[];
  initialBalance?: number;
  currency?: string;
  period?: 'week' | 'month';
  isLoading?: boolean;
};

type BalancePoint = {
  date: string;
  balance: number;
  formattedDate: string;
};

export default function BalanceChart({
  transactions,
  initialBalance = 0,
  currency = 'COP',
  period = 'month',
  isLoading = false,
}: BalanceChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>(period);
  const [balanceData, setBalanceData] = useState<BalancePoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<BalancePoint | null>(null);
  
  // Calcular datos de balance cuando cambian las transacciones o el periodo
  useEffect(() => {
    if (isLoading || transactions.length === 0) {
      setBalanceData([]);
      return;
    }
    
    const data = calculateBalanceOverTime(transactions, initialBalance, selectedPeriod);
    setBalanceData(data);
    setSelectedPoint(data[data.length - 1] || null);
  }, [transactions, initialBalance, selectedPeriod, isLoading]);
  
  // Renderizar esqueleto durante la carga
  if (isLoading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="h-6 w-32 animate-pulse rounded bg-neutral-200"></h3>
          <div className="h-8 w-32 animate-pulse rounded bg-neutral-200"></div>
        </div>
        <div className="mt-6 h-64 w-full animate-pulse rounded bg-neutral-200"></div>
      </div>
    );
  }
  
  // Si no hay datos suficientes
  if (balanceData.length < 2) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-neutral-900">Evolución del saldo</h3>
          <div className="flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setSelectedPeriod('week')}
              className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-medium ${
                selectedPeriod === 'week'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              Semana
            </button>
            <button
              type="button"
              onClick={() => setSelectedPeriod('month')}
              className={`relative -ml-px inline-flex items-center rounded-r-md px-3 py-2 text-sm font-medium ${
                selectedPeriod === 'month'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              Mes
            </button>
          </div>
        </div>
        
        <div className="flex h-64 flex-col items-center justify-center rounded-xl bg-neutral-50 p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mb-2 h-8 w-8 text-neutral-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
          </svg>
          <h4 className="text-lg font-medium text-neutral-900">Sin datos suficientes</h4>
          <p className="text-sm text-neutral-600">
            Necesitas más transacciones para ver la evolución de tu saldo.
          </p>
        </div>
      </div>
    );
  }
  
  // Calcular valores mínimos y máximos para escalar el gráfico
  const minBalance = Math.min(...balanceData.map(point => point.balance));
  const maxBalance = Math.max(...balanceData.map(point => point.balance));
  const balanceRange = maxBalance - minBalance;
  
  // Asegurar que hay suficiente rango para mostrar variaciones
  const effectiveMin = balanceRange > 0 ? minBalance - (balanceRange * 0.1) : minBalance * 0.9;
  const effectiveMax = balanceRange > 0 ? maxBalance + (balanceRange * 0.1) : maxBalance * 1.1;
  const effectiveRange = effectiveMax - effectiveMin;
  
  // Función para convertir valores de balance a coordenadas Y en el gráfico
  const getYPosition = (balance: number): number => {
    // Invierte la escala para que valores más altos estén arriba
    const height = 180; // Altura disponible para el gráfico
    return height - ((balance - effectiveMin) / effectiveRange * height);
  };
  
  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h3 className="text-lg font-medium text-neutral-900">Evolución del saldo</h3>
          {selectedPoint && (
            <p className="text-sm text-neutral-500">{selectedPoint.formattedDate}</p>
          )}
        </div>
        
        <div className="flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setSelectedPeriod('week')}
            className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-medium ${
              selectedPeriod === 'week'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            Semana
          </button>
          <button
            type="button"
            onClick={() => setSelectedPeriod('month')}
            className={`relative -ml-px inline-flex items-center rounded-r-md px-3 py-2 text-sm font-medium ${
              selectedPeriod === 'month'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            Mes
          </button>
        </div>
      </div>
      
      <div className="relative h-64">
        {/* Balance seleccionado */}
        <div className="mb-6 text-center">
          <p className="text-3xl font-bold text-primary-600">
            {selectedPoint ? formatCurrency(selectedPoint.balance, currency) : formatCurrency(0, currency)}
          </p>
        </div>
        
        {/* Gráfico de línea */}
        <div className="absolute bottom-0 left-0 right-0 h-40">
          <svg className="h-full w-full" viewBox={`0 0 ${balanceData.length - 1} 200`} preserveAspectRatio="none">
            {/* Área bajo la curva */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8a05be" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#8a05be" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            
            {/* Área bajo la curva */}
            <path
              d={`
                M 0 ${getYPosition(balanceData[0].balance)}
                ${balanceData.map((point, i) => `L ${i} ${getYPosition(point.balance)}`).join(' ')}
                L ${balanceData.length - 1} 200
                L 0 200
                Z
              `}
              fill="url(#gradient)"
            />
            
            {/* Línea de tendencia */}
            <path
              d={`
                M 0 ${getYPosition(balanceData[0].balance)}
                ${balanceData.map((point, i) => `L ${i} ${getYPosition(point.balance)}`).join(' ')}
              `}
              fill="none"
              stroke="#8a05be"
              strokeWidth="2"
              strokeLinecap="round"
            />
            
            {/* Puntos interactivos */}
            {balanceData.map((point, i) => (
              <circle
                key={i}
                cx={i}
                cy={getYPosition(point.balance)}
                r="4"
                fill={selectedPoint?.date === point.date ? "#8a05be" : "white"}
                stroke="#8a05be"
                strokeWidth="2"
                className="cursor-pointer"
                onClick={() => setSelectedPoint(point)}
                onMouseEnter={() => setSelectedPoint(point)}
              />
            ))}
          </svg>
        </div>
      </div>
      
      {/* Indicadores de días */}
      <div className="mt-2 flex justify-between text-xs text-neutral-500">
        {balanceData.length > 0 && (
          <>
            <span>{balanceData[0].formattedDate.split(', ')[0]}</span>
            {balanceData.length > 2 && (
              <span>{balanceData[Math.floor(balanceData.length / 2)].formattedDate.split(', ')[0]}</span>
            )}
            <span>{balanceData[balanceData.length - 1].formattedDate.split(', ')[0]}</span>
          </>
        )}
      </div>
    </div>
  );
}

// Función para calcular la evolución del saldo en el tiempo
function calculateBalanceOverTime(
  transactions: Transaction[],
  initialBalance: number,
  period: 'week' | 'month'
): BalancePoint[] {
  // Ordenar transacciones por fecha
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  
  // Determinar el rango de fechas a mostrar
  const now = new Date();
  const startDate = new Date();
  
  if (period === 'week') {
    startDate.setDate(now.getDate() - 7);
  } else {
    startDate.setMonth(now.getMonth() - 1);
  }
  
  // Generar todas las fechas en el rango
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= now) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Inicializar datos de balance con el saldo inicial
  let runningBalance = initialBalance;
  const balancePoints: BalancePoint[] = [];
  
  // Formato para mostrar fechas
  const dateFormatter = new Intl.DateTimeFormat('es-CO', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  
  // Para cada fecha, calcular el saldo acumulado
  dates.forEach(date => {
    const dateString = date.toISOString().split('T')[0];
    
    // Aplicar todas las transacciones de esta fecha
    sortedTransactions.forEach(tx => {
      const txDate = new Date(tx.created_at);
      if (txDate.toISOString().split('T')[0] === dateString && tx.status !== 'failed') {
        const amount = parseFloat(tx.amount);
        
        if (tx.transaction_type === 'deposit') {
          runningBalance += amount;
        } else if (['withdrawal', 'payment'].includes(tx.transaction_type)) {
          runningBalance -= amount;
        }
      }
    });
    
    balancePoints.push({
      date: dateString,
      balance: runningBalance,
      formattedDate: dateFormatter.format(date),
    });
  });
  
  return balancePoints;
} 
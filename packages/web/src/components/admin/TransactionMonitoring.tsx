'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  MoreHorizontal, 
  Search, 
  RotateCw, 
  Download,
  CheckCircle,
  XCircle,
  Eye,
  Flag
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { adminApi } from '@/lib/api/admin';

// Types for transaction data
interface Transaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  description: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment';
  status: 'completed' | 'pending' | 'failed' | 'flagged' | 'reviewed';
  date: string;
  flags: TransactionFlag[];
}

interface TransactionFlag {
  id: string;
  type: 'high_amount' | 'unusual_location' | 'multiple_attempts' | 'unusual_pattern' | 'velocity';
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export function TransactionMonitoring() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('flagged');
  const [flagFilter, setFlagFilter] = useState<string>('all');

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      // const data = await adminApi.getTransactions({ status: statusFilter !== 'all' ? statusFilter : undefined });
      // setTransactions(data);
      
      // Mock data for demonstration
      const mockTransactions: Transaction[] = [
        {
          id: 'txn-1',
          userId: 'user-1',
          userName: 'Juan Pérez',
          userEmail: 'juan.perez@example.com',
          amount: 150000,
          description: 'Depósito',
          type: 'deposit',
          status: 'flagged',
          date: '2023-06-01T14:30:00Z',
          flags: [
            {
              id: 'flag-1',
              type: 'high_amount',
              description: 'Monto inusualmente alto para este usuario',
              severity: 'high',
            },
          ],
        },
        {
          id: 'txn-2',
          userId: 'user-2',
          userName: 'María González',
          userEmail: 'maria.gonzalez@example.com',
          amount: 25000,
          description: 'Transferencia a Carlos Rodríguez',
          type: 'transfer',
          status: 'flagged',
          date: '2023-06-02T10:15:00Z',
          flags: [
            {
              id: 'flag-2',
              type: 'unusual_location',
              description: 'Ubicación inusual para esta cuenta (IP diferente)',
              severity: 'medium',
            },
          ],
        },
        {
          id: 'txn-3',
          userId: 'user-3',
          userName: 'Carlos Rodríguez',
          userEmail: 'carlos.rodriguez@example.com',
          amount: 5000,
          description: 'Retiro',
          type: 'withdrawal',
          status: 'reviewed',
          date: '2023-06-02T16:45:00Z',
          flags: [
            {
              id: 'flag-3',
              type: 'multiple_attempts',
              description: 'Múltiples intentos de retiro en un corto período',
              severity: 'low',
            },
          ],
        },
        {
          id: 'txn-4',
          userId: 'user-4',
          userName: 'Ana López',
          userEmail: 'ana.lopez@example.com',
          amount: 45000,
          description: 'Pago de servicio',
          type: 'payment',
          status: 'flagged',
          date: '2023-06-03T09:20:00Z',
          flags: [
            {
              id: 'flag-4',
              type: 'unusual_pattern',
              description: 'Patrón inusual de transacciones en esta cuenta',
              severity: 'high',
            },
            {
              id: 'flag-5',
              type: 'velocity',
              description: 'Velocidad inusual de transacciones',
              severity: 'medium',
            },
          ],
        },
        {
          id: 'txn-5',
          userId: 'user-5',
          userName: 'Roberto Martínez',
          userEmail: 'roberto.martinez@example.com',
          amount: 75000,
          description: 'Transferencia a cuenta externa',
          type: 'transfer',
          status: 'flagged',
          date: '2023-06-03T11:10:00Z',
          flags: [
            {
              id: 'flag-6',
              type: 'high_amount',
              description: 'Monto inusualmente alto para este usuario',
              severity: 'medium',
            },
          ],
        },
        {
          id: 'txn-6',
          userId: 'user-6',
          userName: 'Laura Sánchez',
          userEmail: 'laura.sanchez@example.com',
          amount: 12000,
          description: 'Pago de factura',
          type: 'payment',
          status: 'completed',
          date: '2023-06-03T14:55:00Z',
          flags: [],
        },
        {
          id: 'txn-7',
          userId: 'user-7',
          userName: 'Miguel Hernández',
          userEmail: 'miguel.hernandez@example.com',
          amount: 30000,
          description: 'Depósito',
          type: 'deposit',
          status: 'flagged',
          date: '2023-06-04T09:30:00Z',
          flags: [
            {
              id: 'flag-7',
              type: 'velocity',
              description: 'Múltiples depósitos en un corto período',
              severity: 'medium',
            },
          ],
        },
        {
          id: 'txn-8',
          userId: 'user-1',
          userName: 'Juan Pérez',
          userEmail: 'juan.perez@example.com',
          amount: 120000,
          description: 'Retiro',
          type: 'withdrawal',
          status: 'flagged',
          date: '2023-06-04T16:20:00Z',
          flags: [
            {
              id: 'flag-8',
              type: 'high_amount',
              description: 'Retiro de gran cantidad poco después de un depósito grande',
              severity: 'high',
            },
          ],
        },
      ];
      
      setTransactions(mockTransactions);
      
      // Apply initial filters
      const initialFiltered = mockTransactions.filter(t => 
        statusFilter === 'all' || t.status === statusFilter
      );
      setFilteredTransactions(initialFiltered);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las transacciones',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    // Filter transactions based on search term and filters
    let result = transactions;
    
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(
        transaction => 
          transaction.userName.toLowerCase().includes(lowercasedSearch) || 
          transaction.userEmail.toLowerCase().includes(lowercasedSearch) || 
          transaction.description.toLowerCase().includes(lowercasedSearch)
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(transaction => transaction.status === statusFilter);
    }
    
    if (typeFilter !== 'all') {
      result = result.filter(transaction => transaction.type === typeFilter);
    }
    
    if (flagFilter !== 'all') {
      result = result.filter(transaction => 
        transaction.flags.some(flag => flag.type === flagFilter)
      );
    }
    
    setFilteredTransactions(result);
  }, [transactions, searchTerm, statusFilter, typeFilter, flagFilter]);

  const handleMarkAsReviewed = async (transaction: Transaction) => {
    try {
      // In a real app, this would be an API call
      // await adminApi.updateTransactionStatus(transaction.id, 'reviewed');
      
      // Update local state
      const updatedTransactions = transactions.map(t => 
        t.id === transaction.id ? { ...t, status: 'reviewed' } : t
      );
      setTransactions(updatedTransactions);
      
      toast({
        title: 'Transacción revisada',
        description: `La transacción ${transaction.id} ha sido marcada como revisada`,
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado de la transacción',
        variant: 'destructive',
      });
    }
  };

  const handleExportTransactions = async () => {
    try {
      // In a real app, this would trigger an API call to generate a CSV/Excel file
      // const url = await adminApi.exportTransactions(filteredTransactions.map(t => t.id));
      // window.open(url, '_blank');
      
      toast({
        title: 'Exportación iniciada',
        description: 'Los datos de transacciones se están preparando para descargar',
      });
    } catch (error) {
      console.error('Error exporting transactions:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron exportar las transacciones',
        variant: 'destructive',
      });
    }
  };

  const getFlagSeverityBadge = (severity: TransactionFlag['severity']) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">Alta</Badge>;
      case 'medium':
        return <Badge variant="warning">Media</Badge>;
      case 'low':
        return <Badge variant="outline">Baja</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completada</Badge>;
      case 'pending':
        return <Badge variant="outline">Pendiente</Badge>;
      case 'failed':
        return <Badge variant="destructive">Fallida</Badge>;
      case 'flagged':
        return (
          <Badge variant="warning" className="flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Marcada
          </Badge>
        );
      case 'reviewed':
        return <Badge variant="secondary">Revisada</Badge>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return <Badge className="bg-blue-500">Depósito</Badge>;
      case 'withdrawal':
        return <Badge className="bg-amber-500">Retiro</Badge>;
      case 'transfer':
        return <Badge className="bg-purple-500">Transferencia</Badge>;
      case 'payment':
        return <Badge className="bg-green-500">Pago</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Monitoreo de Transacciones</CardTitle>
        <CardDescription>
          Revisa y gestiona transacciones sospechosas o marcadas para revisión
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuario o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[150px] h-9">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="flagged">Marcadas</SelectItem>
                  <SelectItem value="reviewed">Revisadas</SelectItem>
                  <SelectItem value="completed">Completadas</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="failed">Fallidas</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={typeFilter}
                onValueChange={setTypeFilter}
              >
                <SelectTrigger className="w-[150px] h-9">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="deposit">Depósitos</SelectItem>
                  <SelectItem value="withdrawal">Retiros</SelectItem>
                  <SelectItem value="transfer">Transferencias</SelectItem>
                  <SelectItem value="payment">Pagos</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={flagFilter}
                onValueChange={setFlagFilter}
              >
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="Tipo de Alerta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las alertas</SelectItem>
                  <SelectItem value="high_amount">Monto alto</SelectItem>
                  <SelectItem value="unusual_location">Ubicación inusual</SelectItem>
                  <SelectItem value="multiple_attempts">Múltiples intentos</SelectItem>
                  <SelectItem value="unusual_pattern">Patrón inusual</SelectItem>
                  <SelectItem value="velocity">Velocidad inusual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleExportTransactions} className="h-9">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={fetchTransactions} variant="outline" className="h-9">
              <RotateCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-6">
              <RotateCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Alertas</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                        No se encontraron transacciones
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="font-medium">{transaction.userName}</div>
                          <div className="text-sm text-muted-foreground">{transaction.userEmail}</div>
                        </TableCell>
                        <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                        <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{transaction.description}</TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {transaction.flags.length > 0 ? (
                              transaction.flags.map((flag) => (
                                <div 
                                  key={flag.id} 
                                  className="inline-flex items-center py-0.5 text-xs rounded bg-gray-100 px-1.5"
                                  title={flag.description}
                                >
                                  <span className="mr-1">
                                    {flag.type === 'high_amount' && '💰'}
                                    {flag.type === 'unusual_location' && '🌍'}
                                    {flag.type === 'multiple_attempts' && '🔄'}
                                    {flag.type === 'unusual_pattern' && '📊'}
                                    {flag.type === 'velocity' && '⚡'}
                                  </span>
                                  {getFlagSeverityBadge(flag.severity)}
                                </div>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">Ninguna</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menú</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver detalles
                              </DropdownMenuItem>
                              {transaction.status === 'flagged' && (
                                <DropdownMenuItem onClick={() => handleMarkAsReviewed(transaction)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Marcar como revisada
                                </DropdownMenuItem>
                              )}
                              {transaction.status !== 'flagged' && (
                                <DropdownMenuItem>
                                  <Flag className="h-4 w-4 mr-2" />
                                  Marcar como sospechosa
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Mostrando {filteredTransactions.length} de {transactions.length} transacciones
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Anterior
              </Button>
              <Button variant="outline" size="sm" disabled>
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
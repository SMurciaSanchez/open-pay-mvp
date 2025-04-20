import { supabase } from '../supabase';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Transaction {
  id: string;
  amount: number;
  type: 'send' | 'receive' | 'topup' | 'withdraw';
  status: 'pending' | 'completed' | 'failed';
  recipient?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  sender?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  concept: string;
  date: string;
  reference: string;
}

export interface TransactionRequest {
  senderId: string;
  receiverId: string;
  amount: number;
  description?: string;
  type?: string;
}

export interface TransactionResponse {
  id: string;
  senderId: string;
  receiverId: string;
  amount: number;
  description?: string;
  status: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  error?: string;
}

export interface TransactionListResponse {
  transactions: TransactionResponse[];
  error?: string;
}

export interface TransactionError {
  message: string;
  status: number;
}

export const createTransaction = async (data: TransactionRequest): Promise<TransactionResponse | TransactionError> => {
  try {
    // Verificar balance suficiente
    const senderAccount = await prisma.account.findFirst({
      where: {
        profileId: data.senderId,
        type: 'CHECKING'
      }
    });

    if (!senderAccount || senderAccount.balance < data.amount) {
      return {
        message: 'Saldo insuficiente para realizar la transacción',
        status: 400
      };
    }

    // Verificar que el destinatario existe
    const receiverProfile = await prisma.profile.findUnique({
      where: {
        id: data.receiverId
      }
    });

    if (!receiverProfile) {
      return {
        message: 'Destinatario no encontrado',
        status: 404
      };
    }

    // Crear transacción
    const transaction = await prisma.transaction.create({
      data: {
        senderId: data.senderId,
        receiverId: data.receiverId,
        amount: data.amount,
        description: data.description || '',
        type: data.type || 'TRANSFER',
        status: 'COMPLETED'
      }
    });

    return {
      id: transaction.id,
      senderId: transaction.senderId,
      receiverId: transaction.receiverId,
      amount: transaction.amount,
      description: transaction.description || undefined,
      status: transaction.status,
      type: transaction.type,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt
    };
  } catch (error: any) {
    console.error('Error al crear transacción:', error);
    return {
      message: error.message || 'Error al procesar la transacción',
      status: 500
    };
  }
};

export const getTransactionById = async (id: string): Promise<TransactionResponse | TransactionError> => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: {
        id
      }
    });

    if (!transaction) {
      return {
        message: 'Transacción no encontrada',
        status: 404
      };
    }

    return {
      id: transaction.id,
      senderId: transaction.senderId,
      receiverId: transaction.receiverId,
      amount: transaction.amount,
      description: transaction.description || undefined,
      status: transaction.status,
      type: transaction.type,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt
    };
  } catch (error: any) {
    return {
      message: error.message || 'Error al obtener la transacción',
      status: 500
    };
  }
};

export const getUserTransactions = async (userId: string): Promise<TransactionListResponse> => {
  try {
    // Obtener perfil del usuario
    const userProfile = await prisma.profile.findFirst({
      where: {
        userId
      }
    });

    if (!userProfile) {
      return {
        transactions: [],
        error: 'Perfil de usuario no encontrado'
      };
    }

    const profileId = userProfile.id;

    // Obtener todas las transacciones donde el usuario es remitente o destinatario
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { senderId: profileId },
          { receiverId: profileId }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      transactions: transactions.map(t => ({
        id: t.id,
        senderId: t.senderId,
        receiverId: t.receiverId,
        amount: t.amount,
        description: t.description || undefined,
        status: t.status,
        type: t.type,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt
      }))
    };
  } catch (error: any) {
    console.error('Error al obtener transacciones del usuario:', error);
    return {
      transactions: [],
      error: error.message || 'Error al obtener transacciones'
    };
  }
};

// Alternativa utilizando Supabase directamente (sin Prisma)
export const getTransactionsWithSupabase = async (profileId: string): Promise<TransactionListResponse> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .or(`senderId.eq.${profileId},receiverId.eq.${profileId}`)
      .order('createdAt', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return {
      transactions: data.map((t: any) => ({
        id: t.id,
        senderId: t.senderId,
        receiverId: t.receiverId,
        amount: t.amount,
        description: t.description,
        status: t.status,
        type: t.type,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt)
      }))
    };
  } catch (error: any) {
    console.error('Error al obtener transacciones con Supabase:', error);
    return {
      transactions: [],
      error: error.message || 'Error al obtener transacciones'
    };
  }
};

export const transactionsApi = {
  getAll: async (): Promise<Transaction[]> => {
    // In real implementation, add pagination, filtering, etc.
    const { data } = await apiClient.get('/transactions');
    return data.transactions;
  },
  
  getRecent: async (): Promise<Transaction[]> => {
    const { data } = await apiClient.get('/transactions/recent');
    return data.transactions;
  },
  
  getById: async (id: string): Promise<Transaction> => {
    const { data } = await apiClient.get(`/transactions/${id}`);
    return data.transaction;
  },
  
  send: async (transactionData: TransactionRequest): Promise<Transaction> => {
    const { data } = await apiClient.post('/transactions/send', transactionData);
    return data.transaction;
  },
  
  // For development/demo purposes, we'll simulate API responses
  mockSend: async (transactionData: TransactionRequest): Promise<Transaction> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate a mock transaction response
    return {
      id: `tx-${Math.random().toString(36).substring(2, 10)}`,
      amount: transactionData.amount,
      type: 'send',
      status: 'completed',
      recipient: {
        id: `user-${Math.random().toString(36).substring(2, 8)}`,
        name: transactionData.recipient.includes('@') 
          ? transactionData.recipient.split('@')[0] 
          : `Usuario ${Math.floor(Math.random() * 1000)}`,
        email: transactionData.recipient.includes('@') 
          ? transactionData.recipient 
          : `user${Math.floor(Math.random() * 1000)}@example.com`,
      },
      concept: transactionData.concept || 'Transferencia',
      date: new Date().toISOString(),
      reference: `REF-${Math.random().toString(36).toUpperCase().substring(2, 10)}`
    };
  },
  
  // Mock recent transactions data for development
  getMockTransactions: (count = 10): Transaction[] => {
    const types: Array<Transaction['type']> = ['send', 'receive', 'topup', 'withdraw'];
    const statuses: Array<Transaction['status']> = ['completed', 'pending', 'failed'];
    
    return Array.from({ length: count }, (_, i) => {
      const type = types[Math.floor(Math.random() * types.length)];
      const isIncoming = type === 'receive' || type === 'topup';
      const amount = Math.floor(Math.random() * 10000) / 100;
      
      return {
        id: `tx-${Math.random().toString(36).substring(2, 10)}`,
        amount,
        type,
        status: Math.random() > 0.2 ? 'completed' : statuses[Math.floor(Math.random() * statuses.length)],
        recipient: isIncoming ? undefined : {
          id: `user-${Math.random().toString(36).substring(2, 8)}`,
          name: `Usuario ${Math.floor(Math.random() * 1000)}`,
          email: `user${Math.floor(Math.random() * 1000)}@example.com`,
        },
        sender: !isIncoming ? undefined : {
          id: `user-${Math.random().toString(36).substring(2, 8)}`,
          name: `Usuario ${Math.floor(Math.random() * 1000)}`,
          email: `user${Math.floor(Math.random() * 1000)}@example.com`,
        },
        concept: ['Pago', 'Transferencia', 'Servicios', 'Compra', 'Renta'][Math.floor(Math.random() * 5)],
        date: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toISOString(),
        reference: `REF-${Math.random().toString(36).toUpperCase().substring(2, 10)}`,
      };
    });
  }
}; 
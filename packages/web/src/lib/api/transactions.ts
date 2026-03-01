import { supabase } from '../supabase';

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
    const { data: tx, error } = await supabase
      .from('Transaction')
      .insert({
        senderId: data.senderId,
        receiverId: data.receiverId,
        amount: data.amount,
        description: data.description || '',
        type: data.type || 'TRANSFER',
        status: 'COMPLETED',
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: tx.id,
      senderId: tx.senderId,
      receiverId: tx.receiverId,
      amount: tx.amount,
      description: tx.description || undefined,
      status: tx.status,
      type: tx.type,
      createdAt: new Date(tx.createdAt),
      updatedAt: new Date(tx.updatedAt),
    };
  } catch (error: unknown) {
    console.error('Error al crear transacción:', error);
    return {
      message: error instanceof Error ? error.message : 'Error al procesar la transacción',
      status: 500,
    };
  }
};

export const getTransactionById = async (id: string): Promise<TransactionResponse | TransactionError> => {
  try {
    const { data: tx, error } = await supabase
      .from('Transaction')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !tx) {
      return { message: 'Transacción no encontrada', status: 404 };
    }

    return {
      id: tx.id,
      senderId: tx.senderId,
      receiverId: tx.receiverId,
      amount: tx.amount,
      description: tx.description || undefined,
      status: tx.status,
      type: tx.type,
      createdAt: new Date(tx.createdAt),
      updatedAt: new Date(tx.updatedAt),
    };
  } catch (error: unknown) {
    return {
      message: error instanceof Error ? error.message : 'Error al obtener la transacción',
      status: 500,
    };
  }
};

export const getUserTransactions = async (userId: string): Promise<TransactionListResponse> => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('Profile')
      .select('id')
      .eq('userId', userId)
      .single();

    if (profileError || !profile) {
      return { transactions: [], error: 'Perfil de usuario no encontrado' };
    }

    const { data: transactions, error } = await supabase
      .from('Transaction')
      .select('*')
      .or(`senderId.eq.${profile.id},receiverId.eq.${profile.id}`)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    return {
      transactions: (transactions || []).map((t: any) => ({
        id: t.id,
        senderId: t.senderId,
        receiverId: t.receiverId,
        amount: t.amount,
        description: t.description || undefined,
        status: t.status,
        type: t.type,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
      })),
    };
  } catch (error: unknown) {
    console.error('Error al obtener transacciones del usuario:', error);
    return {
      transactions: [],
      error: error instanceof Error ? error.message : 'Error al obtener transacciones',
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
    await new Promise(resolve => setTimeout(resolve, 500));
    return transactionsApi.getMockTransactions(20);
  },

  getRecent: async (): Promise<Transaction[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return transactionsApi.getMockTransactions(5);
  },

  getById: async (id: string): Promise<Transaction> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const tx = transactionsApi.getMockTransactions(1)[0];
    return { ...tx, id };
  },

  send: async (transactionData: TransactionRequest): Promise<Transaction> => {
    return transactionsApi.mockSend(transactionData);
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
        id: transactionData.receiverId,
        name: `Usuario`,
        email: `user@example.com`,
      },
      concept: transactionData.description || 'Transferencia',
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
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService, SessionState } from '../services/AuthService';

interface AuthContextType {
  isLoading: boolean;
  isSignedIn: boolean;
  user: SessionState['user'] | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithBiometrics: () => Promise<{ success: boolean; error?: string }>;
  isBiometricAvailable: () => Promise<boolean>;
  isBiometricEnabled: () => Promise<boolean>;
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<boolean>;
}

// Crear el contexto con un valor inicial
const AuthContext = createContext<AuthContextType | null>(null);

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Componente proveedor de autenticación
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<SessionState['user'] | null>(null);
  
  // Obtener la instancia del servicio de autenticación
  const authService = AuthService.getInstance();

  // Efecto para cargar la sesión al iniciar la aplicación
  useEffect(() => {
    const loadSession = async () => {
      try {
        setIsLoading(true);
        
        // Intentar restaurar la sesión desde el almacenamiento local
        const sessionRestored = await authService.restoreSession();
        
        if (sessionRestored) {
          const sessionState = authService.getSessionState();
          setIsSignedIn(true);
          setUser(sessionState.user || null);
        }
      } catch (error) {
        console.error('Error al cargar la sesión:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  // Iniciar sesión con correo y contraseña
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const result = await authService.login({ email, password });
      
      if (result.success) {
        setIsSignedIn(true);
        setUser(authService.getSessionState().user || null);
      }
      
      return result;
    } catch (error: any) {
      console.error('Error en inicio de sesión:', error);
      return { 
        success: false, 
        error: error.message || 'Error al iniciar sesión' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Iniciar sesión con biometría
  const signInWithBiometrics = async () => {
    setIsLoading(true);
    
    try {
      const result = await authService.loginWithBiometric();
      
      if (result.success) {
        setIsSignedIn(true);
        setUser(authService.getSessionState().user || null);
      }
      
      return result;
    } catch (error: any) {
      console.error('Error en inicio de sesión con biometría:', error);
      return { 
        success: false, 
        error: error.message || 'Error al iniciar sesión con biometría' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Registrar un nuevo usuario
  const signUp = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    
    try {
      return await authService.register({ name, email, password });
    } catch (error: any) {
      console.error('Error en registro:', error);
      return { 
        success: false, 
        error: error.message || 'Error al registrar usuario' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Cerrar sesión
  const signOut = async () => {
    setIsLoading(true);
    
    try {
      await authService.logout();
      setIsSignedIn(false);
      setUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar si la biometría está disponible
  const isBiometricAvailable = async () => {
    return await authService.isBiometricAvailable();
  };

  // Verificar si la biometría está habilitada
  const isBiometricEnabled = async () => {
    return await authService.isBiometricEnabled();
  };

  // Habilitar la biometría
  const enableBiometric = async () => {
    return await authService.enableBiometric();
  };

  // Deshabilitar la biometría
  const disableBiometric = async () => {
    return await authService.disableBiometric();
  };

  // Valores y funciones que expone el contexto
  const value: AuthContextType = {
    isLoading,
    isSignedIn,
    user,
    signIn,
    signOut,
    signUp,
    signInWithBiometrics,
    isBiometricAvailable,
    isBiometricEnabled,
    enableBiometric,
    disableBiometric,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
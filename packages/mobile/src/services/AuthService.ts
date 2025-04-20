import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/apiClient';
import * as Keychain from 'react-native-keychain';
import ReactNativeBiometrics from 'react-native-biometrics';

// Interfaces para autenticación
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface SessionState {
  authenticated: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  lastActivity: number;
  expiresAt: number;
}

// Clase para manejar la autenticación
export class AuthService {
  private static instance: AuthService;
  private rnBiometrics = new ReactNativeBiometrics();
  
  // Estado de la sesión
  private sessionState: SessionState = {
    authenticated: false,
    lastActivity: 0,
    expiresAt: 0,
  };

  // Método para obtener la instancia única (Singleton)
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Verificar si el usuario está autenticado
  public isAuthenticated(): boolean {
    return this.sessionState.authenticated && this.sessionState.expiresAt > Date.now();
  }

  // Obtener el estado de la sesión
  public getSessionState(): SessionState {
    return { ...this.sessionState };
  }

  // Actualizar la actividad para extender la sesión
  public updateLastActivity(): void {
    this.sessionState.lastActivity = Date.now();
  }

  // Iniciar sesión con correo y contraseña
  public async login(credentials: LoginCredentials): Promise<{success: boolean; error?: string}> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      
      // Guardar el token en AsyncStorage
      await apiClient.setAuthToken(response.token);
      
      // Actualizar el estado de la sesión
      this.sessionState = {
        authenticated: true,
        user: response.user,
        lastActivity: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 horas por defecto
      };
      
      // Guardar el estado de la sesión
      await this.saveSessionState();
      
      return { success: true };
    } catch (error: any) {
      console.error('Error en inicio de sesión:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al iniciar sesión'
      };
    }
  }

  // Registrar un nuevo usuario
  public async register(data: RegisterData): Promise<{success: boolean; error?: string}> {
    try {
      await apiClient.post('/auth/register', data);
      return { success: true };
    } catch (error: any) {
      console.error('Error en registro:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al registrar usuario'
      };
    }
  }

  // Cerrar sesión
  public async logout(): Promise<void> {
    try {
      // Llamar al endpoint de logout si existe
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Error en logout API:', error);
      // Continuar con el proceso de logout local incluso si falla la API
    }
    
    // Limpiar el token y la sesión localmente
    await apiClient.clearAuthToken();
    await AsyncStorage.removeItem('session_state');
    
    // Restablecer el estado de la sesión
    this.sessionState = {
      authenticated: false,
      lastActivity: 0,
      expiresAt: 0,
    };
  }

  // Validar un token existente
  public async validateToken(token: string): Promise<boolean> {
    try {
      // Configurar el token en el cliente
      await apiClient.setAuthToken(token);
      
      // Verificar si el token es válido
      const response = await apiClient.get('/auth/validate');
      
      // Actualizar el estado de la sesión con los datos del usuario
      if (response) {
        this.sessionState = {
          authenticated: true,
          user: response.user,
          lastActivity: Date.now(),
          expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 horas por defecto
        };
        await this.saveSessionState();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error validando token:', error);
      await apiClient.clearAuthToken();
      return false;
    }
  }

  // Restaurar la sesión desde el almacenamiento local
  public async restoreSession(): Promise<boolean> {
    try {
      // Obtener el estado de la sesión guardado
      const sessionData = await AsyncStorage.getItem('session_state');
      if (sessionData) {
        const savedState = JSON.parse(sessionData) as SessionState;
        
        // Verificar si la sesión es válida
        if (savedState.expiresAt > Date.now()) {
          this.sessionState = savedState;
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error restaurando sesión:', error);
      return false;
    }
  }

  // Guardar el estado de la sesión en el almacenamiento local
  private async saveSessionState(): Promise<void> {
    try {
      await AsyncStorage.setItem('session_state', JSON.stringify(this.sessionState));
    } catch (error) {
      console.error('Error guardando estado de sesión:', error);
    }
  }

  // Verificar si la biometría está disponible
  public async isBiometricAvailable(): Promise<boolean> {
    try {
      const { available } = await this.rnBiometrics.isSensorAvailable();
      return available;
    } catch (error) {
      console.error('Error verificando biometría:', error);
      return false;
    }
  }

  // Habilitar la autenticación biométrica
  public async enableBiometric(): Promise<boolean> {
    try {
      // Verificar si la biometría está disponible
      const isAvailable = await this.isBiometricAvailable();
      if (!isAvailable) return false;

      // Crear par de claves para biometría
      const { publicKey } = await this.rnBiometrics.createKeys();
      
      // Guardar la clave pública en el servidor (si es necesario)
      await apiClient.post('/auth/biometric/register', { publicKey });
      
      // Guardar las credenciales actuales de forma segura
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        await Keychain.setGenericPassword('openpay_user', token, {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });
        
        // Marcar que la biometría está habilitada
        await AsyncStorage.setItem('biometric_enabled', 'true');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error habilitando biometría:', error);
      return false;
    }
  }

  // Autenticar usando biometría
  public async loginWithBiometric(): Promise<{success: boolean; error?: string}> {
    try {
      // Verificar si la biometría está habilitada
      const isEnabled = await AsyncStorage.getItem('biometric_enabled');
      if (isEnabled !== 'true') {
        return { success: false, error: 'La autenticación biométrica no está habilitada' };
      }

      // Solicitar autenticación biométrica
      const { success } = await this.rnBiometrics.simplePrompt({
        promptMessage: 'Inicia sesión con biometría',
        cancelButtonText: 'Cancelar',
      });

      if (success) {
        // Obtener el token guardado
        const credentials = await Keychain.getGenericPassword({
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
        });

        if (credentials) {
          // Validar el token y restaurar la sesión
          const isValid = await this.validateToken(credentials.password);
          if (isValid) {
            return { success: true };
          }
        }
      }

      return { success: false, error: 'Error en la autenticación biométrica' };
    } catch (error: any) {
      console.error('Error en login biométrico:', error);
      return { 
        success: false, 
        error: error.message || 'Error en la autenticación biométrica'
      };
    }
  }

  // Desactivar la autenticación biométrica
  public async disableBiometric(): Promise<boolean> {
    try {
      // Eliminar las credenciales guardadas
      await Keychain.resetGenericPassword();
      
      // Marcar que la biometría está deshabilitada
      await AsyncStorage.removeItem('biometric_enabled');
      return true;
    } catch (error) {
      console.error('Error deshabilitando biometría:', error);
      return false;
    }
  }

  // Verificar si la autenticación biométrica está habilitada
  public async isBiometricEnabled(): Promise<boolean> {
    try {
      const isEnabled = await AsyncStorage.getItem('biometric_enabled');
      return isEnabled === 'true';
    } catch (error) {
      console.error('Error verificando estado de biometría:', error);
      return false;
    }
  }
} 
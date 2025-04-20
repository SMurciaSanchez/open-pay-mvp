import { apiClient } from '@/lib/api';
import { useState, useEffect } from 'react';

// Tipos para los métodos de autenticación
export type BiometricType = 'fingerprint' | 'faceid' | 'none';
export type TwoFactorMethod = 'email' | 'app' | 'sms' | 'none';

// Estado de la sesión
export interface SessionState {
  authenticated: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  lastActivity: number;
  expiresAt: number;
}

// Configuración de seguridad
export interface SecuritySettings {
  biometricEnabled: boolean;
  biometricType: BiometricType;
  twoFactorEnabled: boolean;
  twoFactorMethod: TwoFactorMethod;
  autoLogoutTime: number; // En minutos
}

/**
 * Clase para manejar la autenticación y seguridad
 */
export class AuthService {
  private static instance: AuthService;
  private activityTimeout?: NodeJS.Timeout;
  private sessionState: SessionState = {
    authenticated: false,
    lastActivity: Date.now(),
    expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutos por defecto
  };
  private securitySettings: SecuritySettings = {
    biometricEnabled: false,
    biometricType: 'none',
    twoFactorEnabled: false,
    twoFactorMethod: 'none',
    autoLogoutTime: 30, // 30 minutos por defecto
  };
  private listeners: Array<(state: SessionState) => void> = [];

  private constructor() {
    // Carga la configuración desde localStorage al iniciar
    this.loadSettings();
    
    // Si hay un token, intenta restaurar la sesión
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        this.validateToken(token);
      }
    }
  }

  /**
   * Obtiene la instancia singleton del servicio
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Carga la configuración de seguridad desde localStorage
   */
  private loadSettings(): void {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('security_settings');
      if (savedSettings) {
        try {
          this.securitySettings = {
            ...this.securitySettings,
            ...JSON.parse(savedSettings),
          };
        } catch (e) {
          console.error('Error parsing security settings', e);
        }
      }
    }
  }

  /**
   * Guarda la configuración de seguridad en localStorage
   */
  private saveSettings(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'security_settings',
        JSON.stringify(this.securitySettings)
      );
    }
  }

  /**
   * Actualiza la configuración de seguridad
   */
  public updateSecuritySettings(settings: Partial<SecuritySettings>): void {
    this.securitySettings = {
      ...this.securitySettings,
      ...settings,
    };
    this.saveSettings();
    
    // Si cambia el tiempo de auto-logout, actualiza el temporizador
    if (settings.autoLogoutTime !== undefined) {
      this.resetActivityTimeout();
    }
  }

  /**
   * Obtiene la configuración actual de seguridad
   */
  public getSecuritySettings(): SecuritySettings {
    return { ...this.securitySettings };
  }

  /**
   * Valida un token JWT con el servidor
   */
  private async validateToken(token: string): Promise<boolean> {
    try {
      // Llamada a la API para validar el token
      const response = await apiClient.post('/auth/validate-token', { token });
      if (response.data.valid) {
        this.sessionState = {
          authenticated: true,
          user: response.data.user,
          lastActivity: Date.now(),
          expiresAt: Date.now() + this.securitySettings.autoLogoutTime * 60 * 1000,
        };
        this.startActivityMonitoring();
        this.notifyListeners();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error validating token', error);
      return false;
    }
  }

  /**
   * Inicia el monitoreo de actividad para cierre de sesión automático
   */
  private startActivityMonitoring(): void {
    if (typeof window !== 'undefined') {
      // Limpiar cualquier temporizador existente
      if (this.activityTimeout) {
        clearTimeout(this.activityTimeout);
      }

      // Registrar eventos de actividad
      window.addEventListener('mousemove', this.handleUserActivity);
      window.addEventListener('keydown', this.handleUserActivity);
      window.addEventListener('click', this.handleUserActivity);
      window.addEventListener('touchstart', this.handleUserActivity);

      // Configurar temporizador inicial
      this.resetActivityTimeout();
    }
  }

  /**
   * Detiene el monitoreo de actividad
   */
  private stopActivityMonitoring(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', this.handleUserActivity);
      window.removeEventListener('keydown', this.handleUserActivity);
      window.removeEventListener('click', this.handleUserActivity);
      window.removeEventListener('touchstart', this.handleUserActivity);

      if (this.activityTimeout) {
        clearTimeout(this.activityTimeout);
        this.activityTimeout = undefined;
      }
    }
  }

  /**
   * Maneja eventos de actividad del usuario
   */
  private handleUserActivity = (): void => {
    this.sessionState.lastActivity = Date.now();
    this.resetActivityTimeout();
  };

  /**
   * Restablece el temporizador de inactividad
   */
  private resetActivityTimeout(): void {
    if (this.activityTimeout) {
      clearTimeout(this.activityTimeout);
    }

    // Solo configurar si el auto-logout está habilitado
    if (this.securitySettings.autoLogoutTime > 0) {
      this.activityTimeout = setTimeout(() => {
        this.logout({ reason: 'inactivity' });
      }, this.securitySettings.autoLogoutTime * 60 * 1000);
    }
  }

  /**
   * Verifica si la biometría está disponible en el dispositivo
   */
  public async isBiometricAvailable(): Promise<{ available: boolean; type: BiometricType }> {
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      try {
        // Verificar si la API de WebAuthn es compatible
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        
        // Intentar determinar el tipo de biometría (esto es una aproximación)
        let type: BiometricType = 'none';
        if (available) {
          // En iOS, probablemente es FaceID/TouchID
          if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            type = 'faceid'; // Podría ser TouchID también, pero es difícil saberlo
          } 
          // En Android, probablemente es huella digital
          else if (/Android/.test(navigator.userAgent)) {
            type = 'fingerprint';
          }
          // En Windows, podría ser Windows Hello (facial)
          else if (/Windows/.test(navigator.userAgent)) {
            type = 'faceid';
          }
        }
        
        return { available, type };
      } catch (e) {
        console.error('Error checking biometric availability', e);
        return { available: false, type: 'none' };
      }
    }
    
    return { available: false, type: 'none' };
  }

  /**
   * Activa la autenticación biométrica para el usuario actual
   */
  public async enableBiometric(): Promise<boolean> {
    try {
      const { available, type } = await this.isBiometricAvailable();
      
      if (!available) {
        throw new Error('Biometric authentication is not available on this device');
      }
      
      // En una implementación real, aquí se registraría una credencial de WebAuthn
      // y se guardaría en el servidor asociada a la cuenta del usuario
      
      // Simulación:
      this.securitySettings.biometricEnabled = true;
      this.securitySettings.biometricType = type;
      this.saveSettings();
      
      return true;
    } catch (e) {
      console.error('Error enabling biometric authentication', e);
      return false;
    }
  }

  /**
   * Desactiva la autenticación biométrica
   */
  public disableBiometric(): boolean {
    try {
      this.securitySettings.biometricEnabled = false;
      this.securitySettings.biometricType = 'none';
      this.saveSettings();
      return true;
    } catch (e) {
      console.error('Error disabling biometric authentication', e);
      return false;
    }
  }

  /**
   * Realiza la autenticación con biometría
   */
  public async authenticateWithBiometric(): Promise<boolean> {
    if (!this.securitySettings.biometricEnabled) {
      return false;
    }

    try {
      // En una implementación real, aquí se usaría la API de WebAuthn
      // para autenticar al usuario con su dispositivo biométrico
      
      // Simulación para la demostración:
      return new Promise((resolve) => {
        // Simular diálogo y verificación biométrica
        setTimeout(() => {
          resolve(true);
        }, 1500);
      });
    } catch (e) {
      console.error('Error during biometric authentication', e);
      return false;
    }
  }

  /**
   * Activa la verificación en dos pasos
   */
  public async enableTwoFactor(method: TwoFactorMethod): Promise<boolean> {
    try {
      // En una implementación real, aquí se generaría un código de verificación,
      // se enviaría al método elegido por el usuario y se verificaría
      
      // Simulación:
      this.securitySettings.twoFactorEnabled = true;
      this.securitySettings.twoFactorMethod = method;
      this.saveSettings();
      
      return true;
    } catch (e) {
      console.error('Error enabling two-factor authentication', e);
      return false;
    }
  }

  /**
   * Desactiva la verificación en dos pasos
   */
  public disableTwoFactor(): boolean {
    try {
      this.securitySettings.twoFactorEnabled = false;
      this.securitySettings.twoFactorMethod = 'none';
      this.saveSettings();
      return true;
    } catch (e) {
      console.error('Error disabling two-factor authentication', e);
      return false;
    }
  }

  /**
   * Genera y envía un código de verificación para 2FA
   */
  public async sendTwoFactorCode(): Promise<boolean> {
    if (!this.securitySettings.twoFactorEnabled) {
      return false;
    }

    try {
      // En una implementación real, aquí se generaría un código
      // y se enviaría al método elegido (email, SMS, etc.)
      
      // Simulación:
      return true;
    } catch (e) {
      console.error('Error sending two-factor code', e);
      return false;
    }
  }

  /**
   * Verifica un código para 2FA
   */
  public async verifyTwoFactorCode(code: string): Promise<boolean> {
    try {
      // En una implementación real, aquí se validaría el código con el backend
      
      // Simulación (verifica si el código es "123456" para la demo):
      return code === '123456';
    } catch (e) {
      console.error('Error verifying two-factor code', e);
      return false;
    }
  }

  /**
   * Inicia sesión con credenciales de usuario
   */
  public async login(
    credentials: { email: string; password: string },
    options?: { useBiometric?: boolean }
  ): Promise<{ success: boolean; requiresTwoFactor?: boolean }> {
    try {
      // Si se solicita autenticación biométrica
      if (options?.useBiometric && this.securitySettings.biometricEnabled) {
        const biometricSuccess = await this.authenticateWithBiometric();
        if (!biometricSuccess) {
          return { success: false };
        }
      }

      // Simulación de llamada al API para login
      const response = await apiClient.post('/auth/login', credentials);
      
      if (response.data.success) {
        // Guardar el token
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', response.data.token);
        }
        
        // Actualizar el estado de la sesión
        this.sessionState = {
          authenticated: true,
          user: response.data.user,
          lastActivity: Date.now(),
          expiresAt: Date.now() + this.securitySettings.autoLogoutTime * 60 * 1000,
        };
        
        // Iniciar monitoreo de actividad
        this.startActivityMonitoring();
        
        // Notificar a los oyentes del cambio
        this.notifyListeners();
        
        // Si 2FA está habilitado, requerir verificación
        if (this.securitySettings.twoFactorEnabled) {
          await this.sendTwoFactorCode();
          return { success: true, requiresTwoFactor: true };
        }
        
        return { success: true };
      }
      
      return { success: false };
    } catch (e) {
      console.error('Error during login', e);
      return { success: false };
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  public logout(options?: { reason?: 'user' | 'inactivity' | 'security' }): void {
    // Limpiar el token
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
    
    // Detener el monitoreo de actividad
    this.stopActivityMonitoring();
    
    // Restablecer el estado de la sesión
    this.sessionState = {
      authenticated: false,
      lastActivity: Date.now(),
      expiresAt: Date.now(),
    };
    
    // Notificar a los oyentes
    this.notifyListeners();
    
    // Si se proporciona una razón, manejarla específicamente
    if (options?.reason === 'inactivity') {
      // Aquí se podría mostrar un mensaje o redirigir a una página específica
      console.log('Session ended due to inactivity');
    }
  }

  /**
   * Obtiene el estado actual de la sesión
   */
  public getSessionState(): SessionState {
    return { ...this.sessionState };
  }

  /**
   * Suscribe un oyente para cambios en el estado de la sesión
   */
  public subscribe(listener: (state: SessionState) => void): () => void {
    this.listeners.push(listener);
    
    // Retornar función para cancelar la suscripción
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notifica a todos los oyentes sobre un cambio de estado
   */
  private notifyListeners(): void {
    const state = this.getSessionState();
    this.listeners.forEach(listener => listener(state));
  }
}

/**
 * Hook para usar el servicio de autenticación en componentes React
 */
export function useAuth() {
  const [sessionState, setSessionState] = useState<SessionState>({
    authenticated: false,
    lastActivity: Date.now(),
    expiresAt: Date.now(),
  });
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    biometricEnabled: false,
    biometricType: 'none',
    twoFactorEnabled: false,
    twoFactorMethod: 'none',
    autoLogoutTime: 30,
  });

  useEffect(() => {
    const authService = AuthService.getInstance();
    
    // Sincronizar el estado inicial
    setSessionState(authService.getSessionState());
    setSecuritySettings(authService.getSecuritySettings());
    
    // Suscribirse a cambios
    const unsubscribe = authService.subscribe(state => {
      setSessionState(state);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  const authService = AuthService.getInstance();

  return {
    // Estado de la sesión
    isAuthenticated: sessionState.authenticated,
    user: sessionState.user,
    
    // Configuración de seguridad
    securitySettings,
    
    // Métodos de autenticación
    login: authService.login.bind(authService),
    logout: authService.logout.bind(authService),
    
    // Métodos de biometría
    isBiometricAvailable: authService.isBiometricAvailable.bind(authService),
    enableBiometric: authService.enableBiometric.bind(authService),
    disableBiometric: authService.disableBiometric.bind(authService),
    authenticateWithBiometric: authService.authenticateWithBiometric.bind(authService),
    
    // Métodos de 2FA
    enableTwoFactor: authService.enableTwoFactor.bind(authService),
    disableTwoFactor: authService.disableTwoFactor.bind(authService),
    sendTwoFactorCode: authService.sendTwoFactorCode.bind(authService),
    verifyTwoFactorCode: authService.verifyTwoFactorCode.bind(authService),
    
    // Configuración de seguridad
    updateSecuritySettings: authService.updateSecuritySettings.bind(authService),
  };
} 
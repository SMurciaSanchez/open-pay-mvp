import { apiClient } from '@/lib/api';
import { AuthService } from '@/lib/auth';

// Types for security alerts and detection
export type SuspiciousActivityType = 
  | 'unusual_location' 
  | 'high_amount' 
  | 'multiple_attempts' 
  | 'unusual_pattern' 
  | 'ip_change'
  | 'device_change'
  | 'velocity';

export type AlertSeverity = 'low' | 'medium' | 'high';
export type AlertStatus = 'new' | 'reviewing' | 'resolved' | 'false_positive';
export type NotificationChannel = 'email' | 'push' | 'sms' | 'in_app';

export interface SecurityAlert {
  id: string;
  userId: string;
  type: SuspiciousActivityType;
  description: string;
  severity: AlertSeverity;
  timestamp: string;
  status: AlertStatus;
  metadata: Record<string, any>;
  notificationSent: boolean;
  notificationChannels: NotificationChannel[];
}

export interface SecuritySettings {
  alertNotifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
  };
  monitoringEnabled: boolean;
  unusualLocationDetection: boolean;
  highAmountDetection: boolean;
  multipleAttemptsDetection: boolean;
  unusualPatternDetection: boolean;
  velocityMonitoring: boolean;
  deviceChangeMonitoring: boolean;
  thresholds: {
    highAmountThreshold: number;
    loginAttemptsThreshold: number;
    velocityThreshold: number;
  };
}

// Default security settings
const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  alertNotifications: {
    email: true,
    push: true,
    sms: false,
    inApp: true,
  },
  monitoringEnabled: true,
  unusualLocationDetection: true,
  highAmountDetection: true,
  multipleAttemptsDetection: true,
  unusualPatternDetection: true,
  velocityMonitoring: true,
  deviceChangeMonitoring: true,
  thresholds: {
    highAmountThreshold: 10000, // Amount considered high (in currency units)
    loginAttemptsThreshold: 3,  // Number of failed attempts before alerting
    velocityThreshold: 5,       // Number of transactions in short period
  },
};

/**
 * Security Detection Service
 * Manages detection of suspicious activities, security alerts, and logging
 */
export class SecurityDetectionService {
  private static instance: SecurityDetectionService;
  private settings: SecuritySettings;
  private authService: AuthService;
  private listeners: Array<(alert: SecurityAlert) => void> = [];

  private constructor() {
    this.settings = DEFAULT_SECURITY_SETTINGS;
    this.authService = AuthService.getInstance();
    this.loadSettings();
  }

  /**
   * Get the singleton instance of the security service
   */
  public static getInstance(): SecurityDetectionService {
    if (!SecurityDetectionService.instance) {
      SecurityDetectionService.instance = new SecurityDetectionService();
    }
    return SecurityDetectionService.instance;
  }

  /**
   * Load saved security settings
   */
  private loadSettings(): void {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('advanced_security_settings');
      if (savedSettings) {
        try {
          this.settings = {
            ...this.settings,
            ...JSON.parse(savedSettings),
          };
        } catch (e) {
          console.error('Error parsing security settings', e);
        }
      }
    }
  }

  /**
   * Save security settings
   */
  private saveSettings(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'advanced_security_settings',
        JSON.stringify(this.settings)
      );
    }
  }

  /**
   * Update security settings
   */
  public updateSettings(settings: Partial<SecuritySettings>): void {
    this.settings = {
      ...this.settings,
      ...settings,
    };
    this.saveSettings();
  }

  /**
   * Get current security settings
   */
  public getSettings(): SecuritySettings {
    return { ...this.settings };
  }

  /**
   * Get security alerts for the current user
   */
  public async getAlerts(options?: { 
    status?: AlertStatus, 
    limit?: number,
    offset?: number
  }): Promise<{
    alerts: SecurityAlert[];
    total: number;
  }> {
    try {
      const { data } = await apiClient.get('/security/alerts', { params: options });
      return data;
    } catch (error) {
      console.error('Error fetching security alerts:', error);
      return { alerts: [], total: 0 };
    }
  }

  /**
   * Mark a security alert as reviewed/resolved
   */
  public async updateAlertStatus(alertId: string, status: AlertStatus): Promise<boolean> {
    try {
      await apiClient.put(`/security/alerts/${alertId}`, { status });
      return true;
    } catch (error) {
      console.error('Error updating alert status:', error);
      return false;
    }
  }

  /**
   * Log an activity for security monitoring
   */
  public async logSecurityEvent(event: {
    type: string;
    details: Record<string, any>;
    severity?: AlertSeverity;
  }): Promise<void> {
    try {
      await apiClient.post('/security/log', event);
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  /**
   * Check for suspicious transaction based on amount
   */
  public checkHighAmount(amount: number, userId: string): boolean {
    if (!this.settings.highAmountDetection) return false;
    return amount > this.settings.thresholds.highAmountThreshold;
  }

  /**
   * Check for suspicious login based on location/IP
   */
  public async checkUnusualLocation(
    ipAddress: string, 
    userId: string
  ): Promise<{ suspicious: boolean; details?: Record<string, any> }> {
    if (!this.settings.unusualLocationDetection) return { suspicious: false };
    
    try {
      const { data } = await apiClient.post('/security/check-location', { 
        ipAddress, 
        userId 
      });
      return data;
    } catch (error) {
      console.error('Error checking location:', error);
      return { suspicious: false };
    }
  }

  /**
   * Handle failed login attempt and check for multiple attempts
   */
  public async handleFailedLogin(
    userId: string,
    ipAddress: string,
    deviceInfo: string
  ): Promise<boolean> {
    if (!this.settings.multipleAttemptsDetection) return false;
    
    try {
      const { data } = await apiClient.post('/security/failed-login', {
        userId,
        ipAddress,
        deviceInfo,
      });
      
      // Alert if threshold exceeded
      if (data.attempts >= this.settings.thresholds.loginAttemptsThreshold) {
        this.triggerAlert({
          userId,
          type: 'multiple_attempts',
          description: `Multiple failed login attempts detected (${data.attempts} attempts)`,
          severity: 'medium',
          metadata: {
            attempts: data.attempts,
            ipAddress,
            deviceInfo,
          },
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error logging failed login:', error);
      return false;
    }
  }

  /**
   * Create a security alert and send notifications
   */
  public async triggerAlert(alertData: {
    userId: string;
    type: SuspiciousActivityType;
    description: string;
    severity: AlertSeverity;
    metadata: Record<string, any>;
  }): Promise<void> {
    if (!this.settings.monitoringEnabled) return;
    
    try {
      // Create alert in backend
      const { data } = await apiClient.post('/security/alerts', alertData);
      
      // Send notifications based on settings
      if (this.settings.alertNotifications.email) {
        this.sendEmailAlert(data.alert);
      }
      
      if (this.settings.alertNotifications.push) {
        this.sendPushNotification(data.alert);
      }
      
      if (this.settings.alertNotifications.sms) {
        this.sendSmsAlert(data.alert);
      }
      
      if (this.settings.alertNotifications.inApp) {
        this.notifyListeners(data.alert);
      }
    } catch (error) {
      console.error('Error creating security alert:', error);
    }
  }

  /**
   * Send email notification for security alert
   */
  private async sendEmailAlert(alert: SecurityAlert): Promise<void> {
    try {
      await apiClient.post('/notifications/email', {
        type: 'security_alert',
        alertId: alert.id,
        userId: alert.userId,
      });
    } catch (error) {
      console.error('Error sending email alert:', error);
    }
  }

  /**
   * Send push notification for security alert
   */
  private async sendPushNotification(alert: SecurityAlert): Promise<void> {
    try {
      await apiClient.post('/notifications/push', {
        type: 'security_alert',
        alertId: alert.id,
        userId: alert.userId,
        title: 'Alerta de Seguridad',
        body: alert.description,
        data: {
          alertId: alert.id,
          type: alert.type,
          severity: alert.severity,
        },
      });
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  /**
   * Send SMS notification for security alert
   */
  private async sendSmsAlert(alert: SecurityAlert): Promise<void> {
    try {
      await apiClient.post('/notifications/sms', {
        type: 'security_alert',
        alertId: alert.id,
        userId: alert.userId,
        message: `OpenPay: Alerta de seguridad - ${alert.description}`,
      });
    } catch (error) {
      console.error('Error sending SMS alert:', error);
    }
  }

  /**
   * Subscribe to security alerts
   */
  public subscribe(listener: (alert: SecurityAlert) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of new security alert
   */
  private notifyListeners(alert: SecurityAlert): void {
    this.listeners.forEach(listener => listener(alert));
  }
}

// Hook for using the security service in components
export function useSecurityDetection() {
  return {
    service: SecurityDetectionService.getInstance(),
  };
} 
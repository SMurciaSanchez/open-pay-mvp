// Biometric authentication utilities using WebAuthn
// This handles registration and authentication using platform authenticators (fingerprint/FaceID/Windows Hello)

/**
 * Check if the current browser supports WebAuthn
 */
export function isBiometricsSupported(): boolean {
  return (
    window !== undefined &&
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential === 'function'
  );
}

/**
 * Check if the device has platform authenticator (fingerprint, FaceID, etc.)
 */
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isBiometricsSupported()) {
    return false;
  }
  
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch (err) {
    console.error('Error checking platform authenticator availability:', err);
    return false;
  }
}

/**
 * Convert a base64 string to an ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Convert an ArrayBuffer to a base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Prepare the credential options by decoding base64 fields from the server
 */
function preparePublicKeyCredentialOptions(options: any): PublicKeyCredentialCreationOptions {
  const challenge = base64ToArrayBuffer(options.challenge);
  const user = {
    ...options.user,
    id: Uint8Array.from(options.user.id as string, (c: string) => c.charCodeAt(0)),
  };
  
  const publicKey = {
    ...options,
    challenge,
    user,
    excludeCredentials: options.excludeCredentials?.map((credential: any) => ({
      ...credential,
      id: base64ToArrayBuffer(credential.id),
    })),
  };
  
  return publicKey as PublicKeyCredentialCreationOptions;
}

/**
 * Prepare authentication options by decoding base64 fields
 */
function preparePublicKeyRequestOptions(options: any): PublicKeyCredentialRequestOptions {
  const challenge = base64ToArrayBuffer(options.challenge);
  
  const publicKey = {
    ...options,
    challenge,
    allowCredentials: options.allowCredentials?.map((credential: any) => ({
      ...credential,
      id: base64ToArrayBuffer(credential.id),
    })),
  };
  
  return publicKey as PublicKeyCredentialRequestOptions;
}

/**
 * Register a new biometric credential
 */
export async function registerBiometric(
  userId: string,
  username: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isBiometricsSupported()) {
      return { 
        success: false, 
        error: 'El navegador no soporta autenticación biométrica' 
      };
    }
    
    // In a real implementation, this would come from the server
    // The server would generate a random challenge, specify the RP name,
    // and the user information
    const options = {
      challenge: arrayBufferToBase64(crypto.getRandomValues(new Uint8Array(32)).buffer as ArrayBuffer),
      rp: {
        name: 'OpenPay Secure',
        id: window.location.hostname,
      },
      user: {
        id: userId,
        name: username,
        displayName: username,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        requireResidentKey: false,
        userVerification: 'required',
      },
      timeout: 60000,
      attestation: 'none',
    };
    
    const publicKeyOptions = preparePublicKeyCredentialOptions(options);
    const credential = await navigator.credentials.create({
      publicKey: publicKeyOptions,
    });
    
    if (!credential) {
      return { 
        success: false, 
        error: 'No se pudo crear la credencial' 
      };
    }
    
    // In a real implementation, the credential would be sent to the server for storage
    // and verification. Here we just simulate success.
    localStorage.setItem('biometric_registered', 'true');
    
    return { success: true };
  } catch (error: any) {
    console.error('Error registering biometric:', error);
    
    // Handle some common error cases with user-friendly messages
    if (error.name === 'NotAllowedError') {
      return { 
        success: false, 
        error: 'La verificación biométrica fue cancelada por el usuario o el dispositivo' 
      };
    }
    
    if (error.name === 'SecurityError') {
      return { 
        success: false, 
        error: 'La operación no está permitida por razones de seguridad' 
      };
    }
    
    return { 
      success: false, 
      error: error.message || 'Error al registrar la autenticación biométrica' 
    };
  }
}

/**
 * Authenticate using registered biometric credentials
 */
export async function authenticateWithBiometric(): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isBiometricsSupported()) {
      return { 
        success: false, 
        error: 'El navegador no soporta autenticación biométrica' 
      };
    }
    
    // In a real implementation, this would come from the server
    // The server would generate a random challenge and specify
    // the allowed credentials for this user
    const options = {
      challenge: arrayBufferToBase64(crypto.getRandomValues(new Uint8Array(32)).buffer as ArrayBuffer),
      timeout: 60000,
      rpId: window.location.hostname,
      userVerification: 'required',
      // In a real app, the server would provide the credential IDs for this user
      allowCredentials: [],
    };
    
    const publicKeyOptions = preparePublicKeyRequestOptions(options);
    const credential = await navigator.credentials.get({
      publicKey: publicKeyOptions,
    });
    
    if (!credential) {
      return { 
        success: false, 
        error: 'No se pudo verificar la credencial' 
      };
    }
    
    // In a real implementation, the assertion would be sent to the server for verification
    // Here we just simulate success
    return { success: true };
  } catch (error: any) {
    console.error('Error authenticating with biometric:', error);
    
    // Handle some common error cases with user-friendly messages
    if (error.name === 'NotAllowedError') {
      return { 
        success: false, 
        error: 'La verificación biométrica fue cancelada por el usuario o el dispositivo' 
      };
    }
    
    if (error.name === 'SecurityError') {
      return { 
        success: false, 
        error: 'La operación no está permitida por razones de seguridad' 
      };
    }
    
    return { 
      success: false, 
      error: error.message || 'Error al verificar la autenticación biométrica' 
    };
  }
}

/**
 * Check if the user has registered biometric authentication
 */
export function isBiometricRegistered(): boolean {
  // In a real implementation, this would check with the server
  // Here we just use localStorage as a simple simulation
  return localStorage.getItem('biometric_registered') === 'true';
}

/**
 * Remove registered biometric credentials
 */
export function removeBiometricRegistration(): void {
  // In a real implementation, this would call an API endpoint
  // to remove the credentials on the server
  localStorage.removeItem('biometric_registered');
}

/**
 * Types for representing the biometric state
 */
export type BiometricStatus = 
  | 'unsupported'  // Browser doesn't support WebAuthn
  | 'unavailable'  // No platform authenticator available
  | 'not-registered'  // User hasn't registered biometrics yet
  | 'registered'  // User has registered biometrics
  | 'unknown'; // Status is being determined

/**
 * Get the current biometric status for the user
 */
export async function getBiometricStatus(): Promise<BiometricStatus> {
  if (!isBiometricsSupported()) {
    return 'unsupported';
  }
  
  const isPlatformAvailable = await isPlatformAuthenticatorAvailable();
  if (!isPlatformAvailable) {
    return 'unavailable';
  }
  
  if (isBiometricRegistered()) {
    return 'registered';
  }
  
  return 'not-registered';
} 
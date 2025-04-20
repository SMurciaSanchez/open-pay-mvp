'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUp, Shield, Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';

type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

interface IdentityFormData {
  documentType: string;
  documentNumber: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
}

export function IdentityVerification() {
  const { toast } = useToast();
  const [status, setStatus] = useState<VerificationStatus>('unverified');
  const [isLoading, setIsLoading] = useState(false);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<IdentityFormData>({
    documentType: 'dni',
    documentNumber: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    postalCode: ''
  });
  const [errors, setErrors] = useState<Partial<IdentityFormData>>({});

  // Simulate fetching user verification status
  useState(() => {
    const checkVerificationStatus = async () => {
      try {
        const response = await apiClient.get('/auth/verification-status');
        setStatus(response.data.status);
        
        // If there's saved form data, load it
        if (response.data.formData) {
          setFormData(response.data.formData);
        }
      } catch (error) {
        console.error('Error fetching verification status:', error);
      }
    };
    
    checkVerificationStatus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when typing
    if (errors[name as keyof IdentityFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error
    if (errors[name as keyof IdentityFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back' | 'selfie') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Archivo demasiado grande',
          description: 'El tamaño máximo permitido es 5MB',
          variant: 'destructive'
        });
        return;
      }
      
      // Validate file type (only images and PDF)
      if (!file.type.includes('image/') && file.type !== 'application/pdf') {
        toast({
          title: 'Formato no compatible',
          description: 'Por favor sube una imagen o PDF',
          variant: 'destructive'
        });
        return;
      }
      
      if (type === 'front') setFrontFile(file);
      else if (type === 'back') setBackFile(file);
      else setSelfieFile(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<IdentityFormData> = {};
    
    if (!formData.documentNumber) {
      newErrors.documentNumber = 'El número de documento es requerido';
    }
    
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'La fecha de nacimiento es requerida';
    }
    
    if (!formData.address) {
      newErrors.address = 'La dirección es requerida';
    }
    
    if (!formData.city) {
      newErrors.city = 'La ciudad es requerida';
    }
    
    if (!formData.state) {
      newErrors.state = 'El estado/provincia es requerido';
    }
    
    if (!formData.postalCode) {
      newErrors.postalCode = 'El código postal es requerido';
    }
    
    setErrors(newErrors);
    
    // Also validate files
    if (!frontFile) {
      toast({
        title: 'Documento requerido',
        description: 'Por favor sube la parte frontal de tu documento',
        variant: 'destructive'
      });
      return false;
    }
    
    if (!backFile) {
      toast({
        title: 'Documento requerido',
        description: 'Por favor sube la parte trasera de tu documento',
        variant: 'destructive'
      });
      return false;
    }
    
    if (!selfieFile) {
      toast({
        title: 'Selfie requerida',
        description: 'Por favor sube una selfie sosteniendo tu documento',
        variant: 'destructive'
      });
      return false;
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Create form data for multipart upload
      const formDataUpload = new FormData();
      formDataUpload.append('documentType', formData.documentType);
      formDataUpload.append('documentNumber', formData.documentNumber);
      formDataUpload.append('dateOfBirth', formData.dateOfBirth);
      formDataUpload.append('address', formData.address);
      formDataUpload.append('city', formData.city);
      formDataUpload.append('state', formData.state);
      formDataUpload.append('postalCode', formData.postalCode);
      
      if (frontFile) formDataUpload.append('frontDocument', frontFile);
      if (backFile) formDataUpload.append('backDocument', backFile);
      if (selfieFile) formDataUpload.append('selfie', selfieFile);
      
      await apiClient.post('/auth/verify-identity', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setStatus('pending');
      
      toast({
        title: 'Verificación en proceso',
        description: 'Tus documentos han sido enviados y están siendo revisados',
        variant: 'success'
      });
    } catch (error: any) {
      console.error('Error de verificación:', error);
      
      toast({
        title: 'Error de verificación',
        description: error.response?.data?.message || 'Ha ocurrido un error al enviar tus documentos',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'verified':
        return (
          <div className="flex items-center space-x-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
            <CheckCircle className="h-4 w-4" />
            <span>Verificado</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center space-x-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
            <Clock className="h-4 w-4" />
            <span>En revisión</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center space-x-2 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
            <AlertCircle className="h-4 w-4" />
            <span>Rechazado</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-2 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
            <Shield className="h-4 w-4" />
            <span>Sin verificar</span>
          </div>
        );
    }
  };

  if (status === 'verified') {
    return (
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle>Verificación de identidad</CardTitle>
            </div>
            {getStatusBadge()}
          </div>
          <CardDescription>
            Tu identidad ha sido verificada correctamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-6 text-center space-y-4 border rounded-md bg-green-50">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
            <h3 className="text-lg font-medium">¡Verificación completada!</h3>
            <p className="text-sm text-muted-foreground">
              Tu cuenta ha sido verificada. Ahora tienes acceso completo a todas las funcionalidades de OpenPay.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === 'pending') {
    return (
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle>Verificación de identidad</CardTitle>
            </div>
            {getStatusBadge()}
          </div>
          <CardDescription>
            Tu verificación está en proceso de revisión
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-6 text-center space-y-4 border rounded-md bg-yellow-50">
            <Clock className="h-16 w-16 mx-auto text-yellow-500" />
            <h3 className="text-lg font-medium">Verificación en proceso</h3>
            <p className="text-sm text-muted-foreground">
              Estamos revisando tus documentos. Este proceso puede tomar hasta 24 horas. Te notificaremos cuando esté listo.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === 'rejected') {
    return (
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle>Verificación de identidad</CardTitle>
            </div>
            {getStatusBadge()}
          </div>
          <CardDescription>
            Tu verificación ha sido rechazada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-6 space-y-4 border rounded-md bg-red-50">
            <AlertCircle className="h-16 w-16 mx-auto text-red-500" />
            <h3 className="text-lg font-medium text-center">Verificación rechazada</h3>
            <p className="text-sm text-muted-foreground">
              Tu verificación ha sido rechazada por los siguientes motivos:
            </p>
            <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
              <li>Documento ilegible o borroso</li>
              <li>La selfie no coincide con el documento</li>
              <li>Documento expirado o inválido</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Por favor, vuelve a intentarlo con documentos claros y vigentes.
            </p>
          </div>
          <Button onClick={() => setStatus('unverified')} className="w-full">
            Intentar nuevamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle>Verificación de identidad</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>
          Completa este formulario para verificar tu identidad y acceder a todas las funcionalidades
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-base font-medium">Información personal</h3>
            
            <div className="space-y-2">
              <Label htmlFor="documentType">Tipo de documento</Label>
              <Select 
                value={formData.documentType}
                onValueChange={(value) => handleSelectChange('documentType', value)}
              >
                <SelectTrigger id="documentType">
                  <SelectValue placeholder="Selecciona tipo de documento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dni">DNI</SelectItem>
                  <SelectItem value="passport">Pasaporte</SelectItem>
                  <SelectItem value="drivers_license">Licencia de conducir</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="documentNumber">Número de documento</Label>
              <Input
                id="documentNumber"
                name="documentNumber"
                value={formData.documentNumber}
                onChange={handleChange}
                disabled={isLoading}
                className={errors.documentNumber ? 'border-red-500' : ''}
              />
              {errors.documentNumber && (
                <p className="text-xs text-red-500">{errors.documentNumber}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Fecha de nacimiento</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={isLoading}
                className={errors.dateOfBirth ? 'border-red-500' : ''}
              />
              {errors.dateOfBirth && (
                <p className="text-xs text-red-500">{errors.dateOfBirth}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-base font-medium">Dirección</h3>
            
            <div className="space-y-2">
              <Label htmlFor="address">Dirección completa</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={isLoading}
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="text-xs text-red-500">{errors.address}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && (
                  <p className="text-xs text-red-500">{errors.city}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">Estado/Provincia</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={errors.state ? 'border-red-500' : ''}
                />
                {errors.state && (
                  <p className="text-xs text-red-500">{errors.state}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="postalCode">Código postal</Label>
              <Input
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                disabled={isLoading}
                className={errors.postalCode ? 'border-red-500' : ''}
              />
              {errors.postalCode && (
                <p className="text-xs text-red-500">{errors.postalCode}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-base font-medium">Documentos</h3>
            <p className="text-xs text-muted-foreground">
              Sube fotos o escaneos de tu documento por ambos lados, y una selfie sosteniendo el documento.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frontDocument" className="text-sm">Frente del documento</Label>
                <div className="border rounded-md p-4 flex flex-col items-center justify-center gap-2 bg-gray-50 cursor-pointer hover:bg-gray-100 text-center">
                  {frontFile ? (
                    <>
                      <FileUp className="h-8 w-8 text-green-500 mb-1" />
                      <p className="text-xs text-green-600 font-medium">Archivo listo</p>
                      <p className="text-xs text-muted-foreground truncate max-w-full">
                        {frontFile.name}
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400 mb-1" />
                      <p className="text-xs text-muted-foreground">Haz clic para subir</p>
                    </>
                  )}
                  <input
                    id="frontDocument"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileChange(e, 'front')}
                    className="hidden"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="backDocument" className="text-sm">Reverso del documento</Label>
                <label 
                  htmlFor="backDocument" 
                  className="border rounded-md p-4 flex flex-col items-center justify-center gap-2 bg-gray-50 cursor-pointer hover:bg-gray-100 text-center"
                >
                  {backFile ? (
                    <>
                      <FileUp className="h-8 w-8 text-green-500 mb-1" />
                      <p className="text-xs text-green-600 font-medium">Archivo listo</p>
                      <p className="text-xs text-muted-foreground truncate max-w-full">
                        {backFile.name}
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400 mb-1" />
                      <p className="text-xs text-muted-foreground">Haz clic para subir</p>
                    </>
                  )}
                  <input
                    id="backDocument"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileChange(e, 'back')}
                    className="hidden"
                  />
                </label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="selfie" className="text-sm">Selfie con documento</Label>
                <label 
                  htmlFor="selfie" 
                  className="border rounded-md p-4 flex flex-col items-center justify-center gap-2 bg-gray-50 cursor-pointer hover:bg-gray-100 text-center"
                >
                  {selfieFile ? (
                    <>
                      <FileUp className="h-8 w-8 text-green-500 mb-1" />
                      <p className="text-xs text-green-600 font-medium">Archivo listo</p>
                      <p className="text-xs text-muted-foreground truncate max-w-full">
                        {selfieFile.name}
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400 mb-1" />
                      <p className="text-xs text-muted-foreground">Haz clic para subir</p>
                    </>
                  )}
                  <input
                    id="selfie"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'selfie')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800 border border-blue-100">
              <p>
                <strong>Importante:</strong> Asegúrate de que todos los documentos sean legibles y estén vigentes. La revisión puede tardar hasta 24 horas.
              </p>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading} 
          className="w-full"
        >
          {isLoading ? 'Enviando documentos...' : 'Enviar documentos para verificación'}
        </Button>
      </CardFooter>
    </Card>
  );
} 
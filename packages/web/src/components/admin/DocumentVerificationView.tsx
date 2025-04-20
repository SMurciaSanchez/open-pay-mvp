'use client';

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Maximize, 
  Minimize,
  Check,
  X,
  AlertCircle,
  FileText,
  Camera,
  Fingerprint,
  Loader2,
  HelpCircle,
  SquarePen
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/utils/formatters';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface VerificationDocument {
  id: string;
  userId: string;
  type: 'id_front' | 'id_back' | 'selfie' | 'proof_of_address';
  imageUrl: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedAt?: string;
  reviewedBy?: string;
  comments?: string;
}

interface DocumentUser {
  id: string;
  name: string;
  email: string;
  submittedAt: string;
  allDocuments: VerificationDocument[];
}

interface DocumentVerificationViewProps {
  userId?: string;
  onBack: () => void;
  onApprove?: (documentIds: string[], comments: string) => Promise<void>;
  onReject?: (documentIds: string[], reason: string, comments: string) => Promise<void>;
}

const rejectionReasons = [
  { value: 'poor_quality', label: 'Calidad de imagen insuficiente' },
  { value: 'incomplete', label: 'Documento incompleto o recortado' },
  { value: 'not_readable', label: 'Información no legible' },
  { value: 'mismatch', label: 'No coincide con la información proporcionada' },
  { value: 'expired', label: 'Documento expirado' },
  { value: 'fraudulent', label: 'Posible documento fraudulento' },
  { value: 'other', label: 'Otro motivo' },
];

export function DocumentVerificationView({
  userId,
  onBack,
  onApprove,
  onReject,
}: DocumentVerificationViewProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState<DocumentUser | null>(null);
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('id_front');
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock function to fetch user documents
  const fetchUserDocuments = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      // const data = await adminApi.getUserPendingDocuments(userId);
      
      // Mock data for demonstration
      const mockUser: DocumentUser = {
        id: userId || 'user-123',
        name: 'Roberto Martínez',
        email: 'roberto.martinez@example.com',
        submittedAt: '2023-05-25T15:30:00Z',
        allDocuments: [
          {
            id: 'doc-1',
            userId: userId || 'user-123',
            type: 'id_front',
            imageUrl: 'https://via.placeholder.com/800x500?text=DNI+Frente',
            uploadedAt: '2023-05-25T15:30:00Z',
            status: 'pending',
          },
          {
            id: 'doc-2',
            userId: userId || 'user-123',
            type: 'id_back',
            imageUrl: 'https://via.placeholder.com/800x500?text=DNI+Reverso',
            uploadedAt: '2023-05-25T15:32:00Z',
            status: 'pending',
          },
          {
            id: 'doc-3',
            userId: userId || 'user-123',
            type: 'selfie',
            imageUrl: 'https://via.placeholder.com/800x800?text=Selfie',
            uploadedAt: '2023-05-25T15:35:00Z',
            status: 'pending',
          },
          {
            id: 'doc-4',
            userId: userId || 'user-123',
            type: 'proof_of_address',
            imageUrl: 'https://via.placeholder.com/800x1000?text=Comprobante+Domicilio',
            uploadedAt: '2023-05-25T15:40:00Z',
            status: 'pending',
          },
        ],
      };
      
      setPendingUser(mockUser);
      // Set the first document type as active tab
      if (mockUser.allDocuments.length > 0) {
        setActiveTab(mockUser.allDocuments[0].type);
      }
    } catch (error) {
      console.error('Error fetching user documents:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los documentos del usuario',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when component mounts
  useState(() => {
    fetchUserDocuments();
  });

  const handleZoomIn = () => {
    if (zoomLevel < 3) {
      setZoomLevel(prevZoom => prevZoom + 0.5);
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > 0.5) {
      setZoomLevel(prevZoom => prevZoom - 0.5);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    // Reset zoom when toggling fullscreen
    setZoomLevel(1);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Find index of document with this type
    const index = pendingUser?.allDocuments.findIndex(doc => doc.type === value) || 0;
    if (index >= 0) {
      setCurrentDocIndex(index);
    }
  };

  const handleApproveClick = () => {
    setIsApprovalDialogOpen(true);
  };

  const handleRejectClick = () => {
    setIsRejectionDialogOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!pendingUser) return;
    
    setIsProcessing(true);
    try {
      // Get all document IDs
      const documentIds = pendingUser.allDocuments.map(doc => doc.id);
      
      // Call the onApprove function if provided
      if (onApprove) {
        await onApprove(documentIds, comments);
      }
      
      toast({
        title: 'Documentos aprobados',
        description: 'Los documentos han sido aprobados exitosamente',
      });
      
      // Close dialog and go back
      setIsApprovalDialogOpen(false);
      onBack();
    } catch (error) {
      console.error('Error approving documents:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron aprobar los documentos',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!pendingUser) return;
    
    // Validate form
    if (!rejectionReason) {
      toast({
        title: 'Se requiere un motivo',
        description: 'Por favor selecciona un motivo para el rechazo',
        variant: 'destructive',
      });
      return;
    }
    
    // If reason is "other", ensure custom reason is provided
    if (rejectionReason === 'other' && !customReason.trim()) {
      toast({
        title: 'Se requiere un motivo personalizado',
        description: 'Por favor especifica el motivo del rechazo',
        variant: 'destructive',
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      // Get all document IDs
      const documentIds = pendingUser.allDocuments.map(doc => doc.id);
      
      // Get the final reason text
      const finalReason = rejectionReason === 'other' 
        ? customReason 
        : rejectionReasons.find(r => r.value === rejectionReason)?.label || '';
      
      // Call the onReject function if provided
      if (onReject) {
        await onReject(documentIds, finalReason, comments);
      }
      
      toast({
        title: 'Documentos rechazados',
        description: 'Los documentos han sido rechazados exitosamente',
      });
      
      // Close dialog and go back
      setIsRejectionDialogOpen(false);
      onBack();
    } catch (error) {
      console.error('Error rejecting documents:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron rechazar los documentos',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseApprovalDialog = () => {
    setIsApprovalDialogOpen(false);
    setComments('');
  };

  const handleCloseRejectionDialog = () => {
    setIsRejectionDialogOpen(false);
    setRejectionReason('');
    setCustomReason('');
    setComments('');
  };

  const getDocumentTitle = (type: string): string => {
    switch (type) {
      case 'id_front':
        return 'Frente de Identificación';
      case 'id_back':
        return 'Reverso de Identificación';
      case 'selfie':
        return 'Selfie';
      case 'proof_of_address':
        return 'Comprobante de Domicilio';
      default:
        return 'Documento';
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'id_front':
      case 'id_back':
        return <FileText className="h-5 w-5" />;
      case 'selfie':
        return <Camera className="h-5 w-5" />;
      case 'proof_of_address':
        return <FileText className="h-5 w-5" />;
      default:
        return <HelpCircle className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!pendingUser) {
    return (
      <div className="text-center py-6">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium">Usuario no encontrado</h3>
        <p className="mt-1 text-sm text-gray-500">No pudimos encontrar información para este usuario.</p>
        <div className="mt-6">
          <Button onClick={onBack}>Volver a la lista</Button>
        </div>
      </div>
    );
  }

  const currentDocument = pendingUser.allDocuments[currentDocIndex];

  return (
    <div className="space-y-6">
      {/* Header with user info and back button */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver a la lista
        </Button>
        
        <div className="flex items-center gap-2">
          <Badge className="bg-amber-500">Verificación Pendiente</Badge>
        </div>
      </div>

      {/* User info card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Verificación de documentos</CardTitle>
          <CardDescription>
            Revise los documentos proporcionados por {pendingUser.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Usuario</p>
              <p className="font-medium">{pendingUser.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{pendingUser.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha de envío</p>
              <p className="font-medium">{formatDate(pendingUser.submittedAt)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Documentos enviados</p>
              <p className="font-medium">{pendingUser.allDocuments.length}</p>
            </div>
          </div>
          
          <div className="border rounded-lg">
            {/* Tabs for different document types */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="w-full p-0 rounded-none border-b">
                {pendingUser.allDocuments.map((doc) => (
                  <TabsTrigger
                    key={doc.id}
                    value={doc.type}
                    className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                  >
                    <div className="flex items-center gap-2">
                      {getDocumentIcon(doc.type)}
                      <span className="hidden sm:inline">{getDocumentTitle(doc.type)}</span>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {pendingUser.allDocuments.map((doc) => (
                <TabsContent key={doc.id} value={doc.type} className="p-0">
                  {/* Document image container */}
                  <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'h-[500px] w-full'} overflow-hidden flex items-center justify-center`}>
                    <img
                      src={doc.imageUrl}
                      alt={getDocumentTitle(doc.type)}
                      className="object-contain transition-transform duration-200"
                      style={{ 
                        transform: `scale(${zoomLevel})`,
                        maxHeight: isFullscreen ? '90vh' : '100%',
                        maxWidth: isFullscreen ? '90vw' : '100%',
                      }}
                    />
                    
                    {/* Zoom and fullscreen controls */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow-md">
                      <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={zoomLevel <= 0.5}>
                        <Minimize className="h-4 w-4" />
                      </Button>
                      
                      <div className="text-sm font-medium min-w-[40px] text-center">
                        {Math.round(zoomLevel * 100)}%
                      </div>
                      
                      <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={zoomLevel >= 3}>
                        <Maximize className="h-4 w-4" />
                      </Button>
                      
                      <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                        {isFullscreen ? (
                          <Minimize className="h-4 w-4" />
                        ) : (
                          <Maximize className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    {/* Close fullscreen button */}
                    {isFullscreen && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-full"
                        onClick={toggleFullscreen}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Document info */}
                  <div className="p-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{getDocumentTitle(doc.type)}</h3>
                        <p className="text-sm text-muted-foreground">
                          Subido el {formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </CardContent>
        
        {/* Actions footer */}
        <CardFooter className="flex justify-end gap-4 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleRejectClick}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Rechazar Documentos
          </Button>
          
          <Button 
            onClick={handleApproveClick}
            className="gap-2"
          >
            <Check className="h-4 w-4" />
            Aprobar Documentos
          </Button>
        </CardFooter>
      </Card>
      
      {/* Approval confirmation dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={handleCloseApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              Aprobar Documentos
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas aprobar todos los documentos de {pendingUser.name}?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="comments">Comentarios (opcional)</Label>
              <Textarea
                id="comments"
                placeholder="Añade comentarios adicionales..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="resize-none h-20"
              />
            </div>
            
            <div className="mt-4 bg-muted p-3 rounded-lg">
              <div className="flex items-start gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium">Información importante</p>
                  <p className="text-muted-foreground">
                    Al aprobar los documentos, el estado de verificación del usuario 
                    cambiará a "Verificado" y se le notificará automáticamente.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseApprovalDialog} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button 
              onClick={handleApproveConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                'Confirmar Aprobación'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Rejection confirmation dialog */}
      <Dialog open={isRejectionDialogOpen} onOpenChange={handleCloseRejectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <X className="h-5 w-5 text-red-500" />
              Rechazar Documentos
            </DialogTitle>
            <DialogDescription>
              Especifica el motivo del rechazo de los documentos de {pendingUser.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo del rechazo <span className="text-red-500">*</span></Label>
              <Select
                value={rejectionReason}
                onValueChange={setRejectionReason}
              >
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Selecciona un motivo" />
                </SelectTrigger>
                <SelectContent>
                  {rejectionReasons.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {rejectionReason === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="customReason">Especificar motivo <span className="text-red-500">*</span></Label>
                <Textarea
                  id="customReason"
                  placeholder="Describe el motivo del rechazo..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="resize-none"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="comments">Comentarios adicionales (opcional)</Label>
              <Textarea
                id="comments"
                placeholder="Añade comentarios adicionales para el equipo interno..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="resize-none h-20"
              />
              <p className="text-xs text-muted-foreground">
                Estos comentarios son solo para uso interno y no serán visibles para el usuario.
              </p>
            </div>
            
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex items-start gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium">Información importante</p>
                  <p className="text-muted-foreground">
                    Al rechazar los documentos, se notificará al usuario por correo electrónico 
                    indicando el motivo y las instrucciones para volver a enviarlos.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseRejectionDialog} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button 
              onClick={handleRejectConfirm}
              disabled={isProcessing}
              variant="destructive"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                'Confirmar Rechazo'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
"""
OpenPay — Python API (placeholder)
===================================

DECISIÓN ARQUITECTÓNICA
-----------------------
El backend principal de OpenPay es Supabase:
  - Lógica de negocio:  PostgreSQL Functions (transfer_funds, etc.)
  - Seguridad de datos: Row Level Security (RLS) en todas las tablas
  - Autenticación:      Supabase Auth (JWT firmado por Supabase)
  - Storage:            Supabase Storage (documentos KYC, etc.)

Este módulo Python existe como placeholder para lógica futura que requiera
procesamiento server-side que no encaje en PostgreSQL Functions, por ejemplo:
  - Webhooks de proveedores de pago externos
  - Integraciones con APIs de terceros (notificaciones SMS, etc.)
  - Procesamiento pesado fuera de la base de datos

PARA ACTIVAR EN PRODUCCIÓN
---------------------------
Cualquier endpoint que se agregue aquí debe verificar el JWT de Supabase
antes de procesar la petición. Ejemplo con FastAPI:

    import os
    from jose import jwt, JWTError
    from fastapi import HTTPException, Security
    from fastapi.security import HTTPBearer

    SUPABASE_JWT_SECRET = os.environ["SUPABASE_JWT_SECRET"]
    security = HTTPBearer()

    def verify_supabase_token(credentials = Security(security)):
        try:
            payload = jwt.decode(
                credentials.credentials,
                SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated",
            )
            return payload
        except JWTError:
            raise HTTPException(status_code=401, detail="Token inválido")

    @app.post("/webhooks/payment")
    def payment_webhook(user=Depends(verify_supabase_token)):
        ...

ESTADO ACTUAL: sin endpoints activos.
"""

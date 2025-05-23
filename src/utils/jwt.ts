/**
 * Decodifica un token JWT sin verificar la firma
 * @param token Token JWT a decodificar
 * @returns Payload del token decodificado o null si el token no es válido
 */
export function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    // Dividir el token en sus tres partes: header, payload, signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Token JWT inválido');
      return null;
    }

    // Decodificar la parte del payload (segunda parte)
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    
    // Decodificar el base64 a texto
    const rawPayload = atob(base64);
    
    // Convertir el texto a JSON
    const jsonPayload = JSON.parse(rawPayload);
    
    return jsonPayload;
  } catch (error) {
    console.error('Error al decodificar el token JWT:', error);
    return null;
  }
}
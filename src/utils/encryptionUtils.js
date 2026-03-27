//src\utils\encryptionUtils.js 
import crypto from 'crypto';


const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ENCRYPTION_IV = process.env.ENCRYPTION_IV;

export function encryptAESSecure(data, key = ENCRYPTION_KEY, ivBase64 = ENCRYPTION_IV) {
  try {
    if (!data || !key || !ivBase64) {
      throw new Error("Parámetros incompletos");
    }

    const iv = Buffer.from(ivBase64, 'base64');
    const keyHash = crypto.createHash('sha256').update(key).digest();
    const keyBuffer = keyHash.slice(0, 32);

    const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);
    
    let encrypted = cipher.update(data, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Devolver en base64
    let encryptedBase64 = encrypted.toString('base64');
    
    // Aplicar el mismo reemplazo que en el decrypt (pero inverso)
    encryptedBase64 = encryptedBase64.replace(/\//g, "+g3n0Tkm");
    
    return encryptedBase64;
    
  } catch (error) {
    console.error('Error en encriptación:', error.message);
    throw error;
  }
}

export function decryptAESSecure(encryptedDataBase64, ivBase64, key) {
  try {
    if (!encryptedDataBase64 || !ivBase64 || !key) {
      throw new Error("Parámetros incompletos");
    }

    // Revertir el reemplazo
    const encryptedDataWithSlashes = encryptedDataBase64.replace(/\+g3n0Tkm/g, '/');
    const encryptedData = Buffer.from(encryptedDataWithSlashes, 'base64');
    const iv = Buffer.from(ivBase64, 'base64');

    const keyHash = crypto.createHash('sha256').update(key).digest();
    const keyBuffer = keyHash.slice(0, 32);

    const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, iv);

    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');

  } catch (error) {
    console.error('Error en desencriptación:', error.message);
    throw error;
  }
}

// Función específica para crear el valor encrypt basado en uuid_template y build_number
export function createDocumentEncrypt(uuid_documents,uuid_template, build_number) {
  const dataToEncrypt = `${uuid_documents}|${uuid_template}|${build_number}`;
  return encryptAESSecure(dataToEncrypt);
}
// src\utils\emailController.js
import nodemailer from 'nodemailer';

// Esta función envía un correo electrónico con el contenido proporcionado y un archivo adjunto
export async function sendEmail(to, subject, text, attachments = []) {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST, // Servidor SMTP de Outlook
            port: process.env.SMTP_PORT, // Puerto para STARTTLS
            secure: false, // true para 465, false para otros puertos
            requireTLS: true, // Usar STARTTLS
            auth: {
                user: process.env.SMTP_USER, // Tu dirección completa de Outlook
                pass: process.env.SMTP_PASS // Tu contraseña de Outlook
            },
            tls: {
                ciphers: 'SSLv3', // Configuración de cifrado
                //rejectUnauthorized: false // Solo para desarrollo, no usar en producción
            }
        });

        //console.log(transporter);
        // Contenido del correo electrónico
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: to,
            subject: subject,
            html: text,
            attachments: attachments
        };

        // Enviar el correo electrónico
        await transporter.sendMail(mailOptions);

        console.log('Correo electrónico enviado correctamente.');
    } catch (error) {
        console.error('Error al enviar el correo electrónico:', error);
        throw error;
    }
}

//función para enviar correo a través de la API de DanaConnect
export async function sendEmailViaAPI(correo, url) {
    try {
        // Validar que los parámetros requeridos estén presentes
        if (!correo || !url) {
            throw new Error('El correo y la URL son obligatorios');
        }

        // Preparar el cuerpo de la solicitud
        const requestBody = {
            CORREO: correo,
            URL: url
        };

        // Configurar la autenticación básica
        const auth = Buffer.from(`${process.env.DANACONNECT_USER}:${process.env.DANACONNECT_PASS}`).toString('base64');

        // Realizar la petición a la API
        const response = await fetch('https://appserv.danaconnect.com/api/1.0/rest/conversation/570645/start/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`
            },
            body: JSON.stringify(requestBody)
        });

        // Verificar si la respuesta fue exitosa
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error en la API: ${response.status} - ${errorText}`);
        }

        // Obtener la respuesta
        const responseData = await response.json();
        console.log('Correo enviado correctamente a través de la API:', responseData);
        
        // return {
        //     success: true,
        //     data: responseData,
        //     message: 'Correo enviado correctamente a través de la API'
        // };

    } catch (error) {
        console.error('Error al enviar el correo a través de la API:', error);
        throw error;
    }
}
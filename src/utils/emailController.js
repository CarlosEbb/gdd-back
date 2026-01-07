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

const nodemailer = require('nodemailer');
// const axios = require('axios'); // Un-comment if using Fonnte via axios, or use fetch

// --- KONFIGURASI EMAIL (DIISI USER) ---
const EMAIL_CONFIG = {
    service: 'gmail',
    auth: {
        user: 'YOUR_EMAIL@gmail.com', // Ganti dengan Email Anda
        pass: 'YOUR_APP_PASSWORD'      // Ganti dengan App Password Gmail (bukan password login biasa)
    }
};

// --- KONFIGURASI WHATSAPP (CONTOH FONNTE) ---
const WA_CONFIG = {
    token: '9Ca6os3WE763mDazxvXE', // Ganti dengan Token Fonnte
    url: 'https://api.fonnte.com/send'
};

const transporter = nodemailer.createTransport(EMAIL_CONFIG);

const { log } = require('./logger');

// Fungsi Kirim Email
const sendEmail = async (to, subject, html) => {
    log(`[EMAIL] Attempting to send to ${to}`);
    if (!to || to.includes('YOUR_EMAIL')) {
        log(`[EMAIL] Mock send to ${to}`);
        console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
        return;
    }
    try {
        await transporter.sendMail({
            from: `"E-Izin Magang System" <${EMAIL_CONFIG.auth.user}>`,
            to,
            subject,
            html
        });
        log(`[EMAIL] Sent successfully to ${to}`);
        console.log(`[EMAIL SENT] To: ${to}`);
    } catch (error) {
        log(`[EMAIL ERROR] ${error.message}`);
        console.error(`[EMAIL ERROR] Failed to send to ${to}:`, error.message);
    }
};

// Fungsi Kirim WhatsApp
const sendWhatsApp = async (phone, message) => {
    log(`[WA] Attempting to send to ${phone}`);
    if (!phone) {
        log(`[WA] No phone provided`);
        return;
    }

    // FORMAT NOMOR: 08xx -> 628xx
    let formattedPhone = phone.toString().replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
        formattedPhone = '62' + formattedPhone.slice(1);
    }

    log(`[WA] Formatted phone: ${formattedPhone}`);

    if (WA_CONFIG.token === 'YOUR_FONNTE_TOKEN') {
        log(`[WA] Mock send (Token not set)`);
        console.log(`[MOCK WA] To: ${formattedPhone} | Msg: ${message}`);
        return;
    }

    try {
        // Contoh implementasi Fetch ke Fonnte
        const formData = new URLSearchParams();
        formData.append('target', formattedPhone);
        formData.append('message', message);
        formData.append('countryCode', '62');

        log(`[WA] Sending fetch to ${WA_CONFIG.url}...`);
        const response = await fetch(WA_CONFIG.url, {
            method: 'POST',
            headers: {
                'Authorization': WA_CONFIG.token
            },
            body: formData
        });
        const result = await response.json();
        log(`[WA] Result: ${JSON.stringify(result)}`);
        console.log(`[WA SENT] To: ${formattedPhone} | Status: ${result.status}`);
    } catch (error) {
        log(`[WA ERROR] ${error.message}`);
        console.error(`[WA ERROR] Failed to send to ${formattedPhone}:`, error.message);
    }
};

// Hapus axios requirement jika menggunakan native fetch (Node 18+)
module.exports = { sendEmail, sendWhatsApp };

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Rate limiting simple en mémoire (pour production, utiliser Redis/DB)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5; // 5 tentatives par fenêtre

// Validation des données côté serveur
interface ContactFormData {
    firstName: string;
    lastName: string;
    phone: string;
    message: string;
    recaptchaToken: string;
    timestamp: number;
}

const sanitizeInput = (input: string): string => {
    return input
        .trim()
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/[<>\"']/g, '');
};

const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^555-\d{4,5}$/;
    return phoneRegex.test(phone.trim());
};

const validateName = (name: string): boolean => {
    const nameRegex = /^[a-zA-ZÀ-ÿ\s-']{2,50}$/;
    return nameRegex.test(name);
};

const verifyRecaptcha = async (token: string): Promise<boolean> => {
    try {
        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
        });

        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('Erreur vérification reCAPTCHA:', error);
        return false;
    }
};

const checkRateLimit = (ip: string): boolean => {
    const now = Date.now();
    const userLimit = rateLimitMap.get(ip);

    if (!userLimit || now - userLimit.lastReset > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(ip, { count: 1, lastReset: now });
        return true;
    }

    if (userLimit.count >= MAX_REQUESTS) {
        return false;
    }

    userLimit.count++;
    return true;
};

export async function POST(request: NextRequest) {
    try {
        // Récupération de l'IP pour rate limiting
        const headersList = headers();
        const forwarded = headersList.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : 
                   headersList.get('x-real-ip') || 
                   request.ip || 
                   'unknown';

        // Vérification rate limiting
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { error: 'Trop de tentatives. Veuillez réessayer dans 15 minutes.' },
                { status: 429 }
            );
        }

        // Parsing et validation des données
        const body: ContactFormData = await request.json();
        
        // Vérification anti-replay basique (timestamp pas trop ancien)
        const now = Date.now();
        if (!body.timestamp || now - body.timestamp > 10 * 60 * 1000) { // 10 minutes max
            return NextResponse.json(
                { error: 'Requête expirée' },
                { status: 400 }
            );
        }

        // Sanitization des inputs
        const sanitizedData = {
            firstName: sanitizeInput(body.firstName),
            lastName: sanitizeInput(body.lastName),
            phone: sanitizeInput(body.phone),
            message: sanitizeInput(body.message),
        };

        // Validations
        if (!validateName(sanitizedData.firstName)) {
            return NextResponse.json(
                { error: 'Prénom invalide' },
                { status: 400 }
            );
        }

        if (!validateName(sanitizedData.lastName)) {
            return NextResponse.json(
                { error: 'Nom invalide' },
                { status: 400 }
            );
        }

        if (!validatePhoneNumber(sanitizedData.phone)) {
            return NextResponse.json(
                { error: 'Numéro de téléphone invalide' },
                { status: 400 }
            );
        }

        if (sanitizedData.message.length < 10 || sanitizedData.message.length > 1000) {
            return NextResponse.json(
                { error: 'Message invalide' },
                { status: 400 }
            );
        }

        // Vérification reCAPTCHA
        if (!body.recaptchaToken) {
            return NextResponse.json(
                { error: 'reCAPTCHA manquant' },
                { status: 400 }
            );
        }

        const isRecaptchaValid = await verifyRecaptcha(body.recaptchaToken);
        if (!isRecaptchaValid) {
            return NextResponse.json(
                { error: 'reCAPTCHA invalide' },
                { status: 400 }
            );
        }

        // Détection de spam basique
        const spamKeywords = ['viagra', 'casino', 'lottery', 'winner', 'urgent', 'click here'];
        const messageWords = sanitizedData.message.toLowerCase();
        const hasSpam = spamKeywords.some(keyword => messageWords.includes(keyword));
        
        if (hasSpam) {
            console.log(`Tentative de spam détectée de ${ip}:`, sanitizedData);
            return NextResponse.json(
                { error: 'Message rejeté' },
                { status: 400 }
            );
        }

        // Ici, vous pourriez sauvegarder en DB, envoyer un email, etc.
        console.log('Nouveau message de contact:', {
            ...sanitizedData,
            ip,
            timestamp: new Date().toISOString()
        });

        // TODO: Intégrer l'envoi d'email (Nodemailer, SendGrid, etc.)
        // TODO: Sauvegarder en base de données si nécessaire

        return NextResponse.json(
            { message: 'Message envoyé avec succès' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Erreur API contact:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

// Méthodes non autorisées
export async function GET() {
    return NextResponse.json({ error: 'Méthode non autorisée' }, { status: 405 });
}

export async function PUT() {
    return NextResponse.json({ error: 'Méthode non autorisée' }, { status: 405 });
}

export async function DELETE() {
    return NextResponse.json({ error: 'Méthode non autorisée' }, { status: 405 });
}

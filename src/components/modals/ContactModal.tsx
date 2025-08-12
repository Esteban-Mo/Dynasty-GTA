"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { Close, Send } from '@mui/icons-material';
import ReCAPTCHA from 'react-google-recaptcha';

interface ContactModalProps {
    open: boolean;
    onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ open, onClose }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        message: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Validation prénom
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'Le prénom est obligatoire';
        } else if (formData.firstName.length < 2 || formData.firstName.length > 50) {
            newErrors.firstName = 'Le prénom doit contenir entre 2 et 50 caractères';
        } else if (!/^[a-zA-ZÀ-ÿ\s-']+$/.test(formData.firstName)) {
            newErrors.firstName = 'Le prénom contient des caractères invalides';
        }

        // Validation nom
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Le nom est obligatoire';
        } else if (formData.lastName.length < 2 || formData.lastName.length > 50) {
            newErrors.lastName = 'Le nom doit contenir entre 2 et 50 caractères';
        } else if (!/^[a-zA-ZÀ-ÿ\s-']+$/.test(formData.lastName)) {
            newErrors.lastName = 'Le nom contient des caractères invalides';
        }

        // Validation téléphone
        if (!formData.phone.trim()) {
            newErrors.phone = 'Le numéro de téléphone est obligatoire';
        } else if (!/^555-\d{4,5}$/.test(formData.phone.trim())) {
            newErrors.phone = 'Format de téléphone invalide (ex: 555-1234 ou 555-12345)';
        }

        // Validation message
        if (!formData.message.trim()) {
            newErrors.message = 'Le message est obligatoire';
        } else if (formData.message.length < 10 || formData.message.length > 1000) {
            newErrors.message = 'Le message doit contenir entre 10 et 1000 caractères';
        }

        // Validation reCAPTCHA
        if (!recaptchaToken) {
            newErrors.recaptcha = 'Veuillez valider le reCAPTCHA';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        // Nettoyage basique pour éviter les injections
        const sanitizedValue = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        
        setFormData(prev => ({
            ...prev,
            [name]: sanitizedValue
        }));

        // Effacer l'erreur si l'utilisateur corrige
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    recaptchaToken,
                    timestamp: Date.now()
                }),
            });

            if (response.ok) {
                setSubmitStatus('success');
                setFormData({ firstName: '', lastName: '', phone: '', message: '' });
                setRecaptchaToken(null);
                // Fermer la modal après 2 secondes
                setTimeout(() => {
                    onClose();
                    setSubmitStatus('idle');
                }, 2000);
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        onClose();
        // Reset form on close
        setFormData({ firstName: '', lastName: '', phone: '', message: '' });
        setErrors({});
        setSubmitStatus('idle');
        setRecaptchaToken(null);
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    backgroundColor: '#1a1a1a',
                    backgroundImage: 'none',
                    border: '1px solid #f4b53f',
                    borderRadius: '12px',
                    maxHeight: '90vh'
                }
            }}
        >
            <DialogTitle 
                sx={{ 
                    color: '#ffffff', 
                    textAlign: 'center', 
                    fontSize: '1.75rem',
                    fontWeight: 'bold',
                    borderBottom: '1px solid #333',
                    position: 'relative'
                }}
            >
                Nous Contacter
                <IconButton
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: '#f4b53f'
                    }}
                >
                    <Close />
                </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ padding: '24px', backgroundColor: '#1a1a1a' }}>
                {submitStatus === 'success' && (
                    <div className="mb-4 p-4 bg-green-600/20 border border-green-500 rounded-lg">
                        <p className="text-green-400 text-center">✅ Message envoyé avec succès !</p>
                    </div>
                )}
                
                {submitStatus === 'error' && (
                    <div className="mb-4 p-4 bg-red-600/20 border border-red-500 rounded-lg">
                        <p className="text-red-400 text-center">❌ Erreur lors de l&apos;envoi. Veuillez réessayer dans quelques minutes.</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <input
                                type="text"
                                name="firstName"
                                placeholder="Prénom *"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:border-amber-400 focus:outline-none transition-colors"
                                maxLength={50}
                            />
                            {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
                        </div>
                        
                        <div>
                            <input
                                type="text"
                                name="lastName"
                                placeholder="Nom *"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:border-amber-400 focus:outline-none transition-colors"
                                maxLength={50}
                            />
                            {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
                        </div>
                    </div>

                    <div>
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Numéro de téléphone * (555-1234)"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:border-amber-400 focus:outline-none transition-colors"
                            pattern="555-\d{4,5}"
                        />
                        {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                        <textarea
                            name="message"
                            placeholder="Votre message *"
                            value={formData.message}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:border-amber-400 focus:outline-none transition-colors resize-none"
                            maxLength={1000}
                        />
                        <div className="flex justify-between items-center mt-1">
                            {errors.message && <p className="text-red-400 text-sm">{errors.message}</p>}
                            <p className="text-gray-400 text-sm ml-auto">{formData.message.length}/1000</p>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <ReCAPTCHA
                            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                            onChange={setRecaptchaToken}
                            theme="dark"
                        />
                        {errors.recaptcha && <p className="text-red-400 text-sm mt-1">{errors.recaptcha}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full p-4 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                        {isSubmitting ? (
                            <span>Envoi en cours...</span>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                <span>Envoyer le message</span>
                            </>
                        )}
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ContactModal;

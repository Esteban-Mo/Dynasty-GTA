"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { Close, ExpandMore } from '@mui/icons-material';

interface FAQModalProps {
    open: boolean;
    onClose: () => void;
}

const FAQModal: React.FC<FAQModalProps> = ({ open, onClose }) => {
    const [openFAQ, setOpenFAQ] = useState<number | null>(null);

    const questions = [
        {
            question: "Comment puis-je vendre ma propriété ?",
            answer: "Contactez notre équipe commerciale qui vous accompagnera dans toutes les démarches de vente. Nous proposons une estimation gratuite et un service personnalisé."
        },
        {
            question: "Quels sont vos frais d'agence ?",
            answer: "Nos frais varient selon le type de prestation. Pour une vente, nos honoraires sont de 3 à 5% du prix de vente selon le bien."
        },
        {
            question: "Proposez-vous des visites virtuelles ?",
            answer: "Oui, nous proposons des visites virtuelles 360° pour tous nos biens immobiliers, ainsi que des vidéos professionnelles."
        },
        {
            question: "Comment puis-je estimer mon bien ?",
            answer: "Nous offrons une estimation gratuite de votre bien. Un de nos experts se déplace pour évaluer votre propriété selon les critères du marché."
        },
        {
            question: "Quels documents dois-je fournir ?",
            answer: "Pour une vente : titre de propriété, diagnostics techniques, plans, règlement de copropriété si applicable."
        },
        {
            question: "Combien de temps pour vendre ?",
            answer: "En moyenne, nos biens se vendent entre 60 et 90 jours. Cela dépend du prix, de l'emplacement et de l'état du bien."
        }
    ];

    const toggleFAQ = (index: number) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    backgroundColor: '#1a1a1a',
                    backgroundImage: 'none',
                    border: '1px solid #f4b53f',
                    borderRadius: '12px',
                    maxHeight: '80vh'
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
                Questions Fréquentes
                <IconButton
                    onClick={onClose}
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
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {questions.map((item, index) => (
                        <div key={index} className="border border-gray-600 rounded-lg bg-white/5">
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full p-4 text-left flex justify-between items-center hover:bg-white/10 transition-colors"
                            >
                                <h3 className="text-lg font-semibold text-amber-400 pr-2">
                                    {item.question}
                                </h3>
                                <ExpandMore 
                                    className={`text-amber-400 transition-transform duration-200 flex-shrink-0 ${
                                        openFAQ === index ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                            {openFAQ === index && (
                                <div className="px-4 pb-4">
                                    <p className="text-gray-300 leading-relaxed">
                                        {item.answer}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default FAQModal;

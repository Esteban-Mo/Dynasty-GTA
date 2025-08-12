"use client"

import { BackgroundBeams } from '@/components/ui/background-beams';

export default function Contact() {
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

    const contacts = [
        {
            type: "Direction Générale",
            name: "Alexandre Dubois",
            phone: "01 23 45 67 89",
            email: "direction@dynasty-immobilier.fr"
        },
        {
            type: "Service Commercial",
            name: "Sophie Martin",
            phone: "01 23 45 67 90",
            email: "commercial@dynasty-immobilier.fr"
        },
        {
            type: "Gestion Locative",
            name: "Thomas Rousseau",
            phone: "01 23 45 67 91",
            email: "gestion@dynasty-immobilier.fr"
        },
        {
            type: "Service Juridique",
            name: "Marie Lefevre",
            phone: "01 23 45 67 92",
            email: "juridique@dynasty-immobilier.fr"
        },
        {
            type: "Support Client",
            name: "Lucas Bernard",
            phone: "01 23 45 67 93",
            email: "support@dynasty-immobilier.fr"
        },
        {
            type: "Comptabilité",
            name: "Emma Moreau",
            phone: "01 23 45 67 94",
            email: "comptabilite@dynasty-immobilier.fr"
        }
    ];

    return (
        <div className="min-h-screen w-full relative overflow-hidden">
            <video
                autoPlay
                muted
                loop
                className="absolute z-0 top-0 left-0 w-full h-full object-cover opacity-30 blur-sm"
            >
                <source src="/videos/vidbg.mp4" type="video/mp4"/>
            </video>

            <BackgroundBeams className="absolute inset-0"/>

            <div className="relative z-10 flex min-h-screen">
                {/* Questions Block - Left */}
                <div className="w-1/2 p-8">
                    <div className="bg-black/60 backdrop-blur-sm rounded-lg p-8 h-full">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">
                            Questions Fréquentes
                        </h2>
                        <div className="space-y-6">
                            {questions.map((item, index) => (
                                <div key={index} className="border-b border-gray-600 pb-4">
                                    <h3 className="text-lg font-semibold text-amber-400 mb-2">
                                        {item.question}
                                    </h3>
                                    <p className="text-gray-300 leading-relaxed">
                                        {item.answer}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Contacts Block - Right */}
                <div className="w-1/2 p-8">
                    <div className="bg-black/60 backdrop-blur-sm rounded-lg p-8 h-full">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">
                            Nos Contacts
                        </h2>
                        <div className="space-y-6">
                            {contacts.map((contact, index) => (
                                <div key={index} className="bg-white/10 rounded-lg p-6 border border-gray-600">
                                    <h3 className="text-xl font-semibold text-amber-400 mb-3">
                                        {contact.type}
                                    </h3>
                                    <div className="space-y-2">
                                        <p className="text-white font-medium">
                                            {contact.name}
                                        </p>
                                        <p className="text-gray-300">
                                            📞 {contact.phone}
                                        </p>
                                        <p className="text-gray-300">
                                            ✉️ {contact.email}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

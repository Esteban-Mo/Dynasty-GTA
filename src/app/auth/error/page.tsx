"use client";

import { useSearchParams } from "next/navigation";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Error, ArrowBack } from "@mui/icons-material";
import Link from "next/link";

const errorMessages: Record<string, string> = {
  Signin: "Erreur lors de la connexion",
  OAuthSignin: "Erreur lors de la connexion OAuth",
  OAuthCallback: "Erreur de callback OAuth",
  OAuthCreateAccount: "Erreur de création de compte OAuth",
  EmailCreateAccount: "Erreur de création de compte email",
  Callback: "Erreur de callback",
  OAuthAccountNotLinked: "Compte OAuth non lié",
  EmailSignin: "Erreur d'envoi d'email",
  CredentialsSignin: "Identifiants invalides",
  SessionRequired: "Session requise",
  default: "Une erreur inattendue s'est produite"
};

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  
  const errorMessage = error ? (errorMessages[error] || errorMessages.default) : errorMessages.default;

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center">
      <video
        autoPlay
        muted
        loop
        className="absolute z-0 top-0 left-0 w-full h-full object-cover opacity-30 blur-sm"
      >
        <source src="/videos/vidbg.mp4" type="video/mp4"/>
      </video>

      <BackgroundBeams className="absolute inset-0"/>

      <div className="relative z-10 w-full max-w-md p-8">
        <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-8 border border-red-400/30">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Error className="text-red-400 text-3xl" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Erreur d&apos;authentification</h1>
            <p className="text-gray-400">Un problème est survenu lors de la connexion</p>
          </div>

          <div className="mb-8 p-4 bg-red-600/20 border border-red-500 rounded-lg">
            <p className="text-red-400 text-center">{errorMessage}</p>
          </div>

          <div className="space-y-4">
            <Link
              href="/auth/signin"
              className="w-full p-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowBack className="w-5 h-5" />
              <span>Retour à la connexion</span>
            </Link>

            <Link
              href="/"
              className="w-full p-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>Retour à l&apos;accueil</span>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-600">
            <p className="text-center text-gray-400 text-sm">
              Si le problème persiste, contactez l&apos;administrateur système
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

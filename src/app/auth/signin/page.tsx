"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Visibility, VisibilityOff, Login, Security } from "@mui/icons-material";

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        // Connexion réussie, redirection manuelle
        console.log("Connexion réussie, redirection vers /pro");
        // Utilisation de window.location.href pour forcer la redirection
        window.location.href = "/pro";
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      setError("Une erreur est survenue lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
        <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-8 border border-amber-400/30">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Security className="text-amber-400 text-3xl" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Espace Professionnel</h1>
            <p className="text-gray-400">Connectez-vous pour accéder à votre espace</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-600/20 border border-red-500 rounded-lg">
              <p className="text-red-400 text-center text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Email professionnel
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full p-4 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:border-amber-400 focus:outline-none transition-colors"
                placeholder="votre.email@dynasty.com"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full p-4 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:border-amber-400 focus:outline-none transition-colors pr-14"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                >
                  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full p-4 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <span>Connexion en cours...</span>
              ) : (
                <>
                  <Login className="w-5 h-5" />
                  <span>Se connecter</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-600">
            <p className="text-center text-gray-400 text-sm">
              Accès réservé aux agents et administrateurs Dynasty GTA
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

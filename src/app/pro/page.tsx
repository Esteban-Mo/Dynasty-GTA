import { requireAuth } from "@/lib/auth-utils";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Dashboard, Person, AdminPanelSettings } from "@mui/icons-material";
import Link from "next/link";
// Logout via icône dans le NavMenu. Bouton local retiré.

export default async function ProDashboard() {
  const session = await requireAuth();

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <video
        autoPlay
        muted
        loop
        className="absolute z-0 top-0 left-0 w-full h-full object-cover opacity-20 blur-sm"
      >
        <source src="/videos/vidbg.mp4" type="video/mp4"/>
      </video>

      <BackgroundBeams className="absolute inset-0"/>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Espace Professionnel
            </h1>
            <p className="text-gray-400">
              Bienvenue, {session.user.name || session.user.email}
            </p>
            <div className="inline-flex items-center space-x-2 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                session.user.role === 'ADMIN' 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {session.user.role === 'ADMIN' ? 'Administrateur' : 'Agent'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4"></div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Facturation */}
          <Link href="/pro/billing" className="group">
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 border border-gray-600 hover:border-amber-400 transition-all duration-300 group-hover:transform group-hover:scale-105">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <Dashboard className="text-amber-400 text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Facturation</h3>
                  <p className="text-gray-400 text-sm">Gérer les factures clients</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm">
                Créez et gérez les factures pour vos clients
              </p>
            </div>
          </Link>

          {/* Profil & Sécurité */}
          <Link href="/pro/profile" className="group">
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 border border-gray-600 hover:border-amber-400 transition-all duration-300 group-hover:transform group-hover:scale-105">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Person className="text-blue-400 text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Profil</h3>
                  <p className="text-gray-400 text-sm">Paramètres du compte</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm">
                Gérez votre profil et vos paramètres de sécurité
              </p>
            </div>
          </Link>

          {/* Administration (Admin uniquement) */}
          {session.user.role === 'ADMIN' && (
            <Link href="/pro/admin" className="group">
              <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 border border-gray-600 hover:border-red-400 transition-all duration-300 group-hover:transform group-hover:scale-105">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <AdminPanelSettings className="text-red-400 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Administration</h3>
                    <p className="text-gray-400 text-sm">Gestion système</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">
                  Gérez les utilisateurs, prix et données système
                </p>
              </div>
            </Link>
          )}
        </div>

        {/* Fin du contenu */}
      </div>
    </div>
  );
}

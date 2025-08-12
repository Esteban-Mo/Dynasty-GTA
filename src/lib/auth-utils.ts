import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

// Utilitaire pour vérifier l'authentification côté serveur
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/signin");
  }
  return session;
}

// Utilitaire pour vérifier le rôle admin
export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== "ADMIN") {
    redirect("/pro?error=unauthorized");
  }
  return session;
}

// Utilitaire pour vérifier le rôle agent ou admin
export async function requireAgent() {
  const session = await requireAuth();
  if (!["AGENT", "ADMIN"].includes(session.user.role)) {
    redirect("/auth/signin");
  }
  return session;
}

// Validation de format email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validation de force du mot de passe
export function isStrongPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 12) {
    errors.push("Le mot de passe doit contenir au moins 12 caractères");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une majuscule");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une minuscule");
  }
  
  if (!/\d/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un chiffre");
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un caractère spécial");
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        console.log("Tentative de connexion pour:", credentials.email);

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          console.log("Utilisateur non trouvé:", credentials.email);
          throw new Error("Aucun compte trouvé avec cet email");
        }

        console.log("Utilisateur trouvé:", user.email, "Role:", user.role);

        if (!user.passwordHash) {
          console.log("Pas de mot de passe configuré pour:", user.email);
          throw new Error("Compte non configuré pour la connexion par mot de passe");
        }

        // Vérifier si le compte est verrouillé
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error("Compte temporairement verrouillé. Réessayez plus tard.");
        }

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
        
        if (!isPasswordValid) {
          // Incrémenter les tentatives de connexion
          const attempts = user.loginAttempts + 1;
          const lockUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null; // 15 min

          await prisma.user.update({
            where: { id: user.id },
            data: {
              loginAttempts: attempts,
              lockedUntil: lockUntil
            }
          });

          throw new Error("Identifiants invalides");
        }

        // Réinitialiser les tentatives de connexion et mettre à jour la dernière connexion
        await prisma.user.update({
          where: { id: user.id },
          data: {
            loginAttempts: 0,
            lockedUntil: null,
            lastLoginAt: new Date()
          }
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 heures
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error"
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/pro`;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub!;
        (session.user as any).role = token.role as "AGENT" | "ADMIN";
      }
      return session;
    }
  },
  // Laisser NextAuth choisir les cookies adaptés à l'environnement (évite les soucis en dev)
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`Connexion: ${user.email} - ${new Date().toISOString()}`);
    },
    async signOut({ session, token }) {
      console.log(`Déconnexion: ${session?.user?.email} - ${new Date().toISOString()}`);
    }
  }
};

import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      role: "AGENT" | "ADMIN";
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    role: "AGENT" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "AGENT" | "ADMIN";
  }
}

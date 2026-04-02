import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare, hash } from "bcryptjs";
import { prisma } from "@/server/db";
import { signInSchema, signUpSchema } from "@/lib/schemas";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("User not found");
        }

        if (!user.passwordHash) {
          throw new Error("User has no password set");
        }

        const isValid = await compare(credentials.password, user.passwordHash);

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

export async function signUpUser(data: { name: string; email: string; password: string }) {
  const validated = signUpSchema.parse(data);

  const existing = await prisma.user.findUnique({
    where: { email: validated.email },
  });

  if (existing) {
    throw new Error("User already exists");
  }

  const passwordHash = await hash(validated.password, 12);

  const user = await prisma.user.create({
    data: {
      name: validated.name,
      email: validated.email,
      passwordHash,
    },
  });

  return { id: user.id, email: user.email, name: user.name };
}

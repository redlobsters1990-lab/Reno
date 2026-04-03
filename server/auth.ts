import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare, hash } from "bcryptjs";
import { prisma } from "@/server/db";
import { signInSchema, signUpSchema } from "@/lib/schemas";
import { normalizeEmail, isValidEmail } from "@/lib/email-utils";
import { authLogger } from "@/lib/logger";
import { createRequestContext } from "@/lib/logger";

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const request = req as any;
        const context = createRequestContext(request?.req || new Request('http://localhost'));
        
        if (!credentials?.email || !credentials?.password) {
          authLogger.login.failed(credentials?.email || 'unknown', 'Missing credentials', context);
          throw new Error("Email and password required");
        }

        // Normalize email
        const normalizedEmail = normalizeEmail(credentials.email);
        
        if (!isValidEmail(normalizedEmail)) {
          authLogger.login.failed(normalizedEmail, 'Invalid email format', context);
          throw new Error("Invalid email format");
        }

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user) {
          authLogger.login.failed(normalizedEmail, 'User not found', context);
          throw new Error("Invalid credentials"); // Generic message for security
        }

        if (!user.passwordHash) {
          authLogger.login.failed(normalizedEmail, 'No password set', context);
          throw new Error("Account configuration error");
        }

        const isValid = await compare(credentials.password, user.passwordHash);

        if (!isValid) {
          authLogger.login.failed(normalizedEmail, 'Invalid password', context);
          throw new Error("Invalid credentials"); // Generic message for security
        }

        authLogger.login.success(normalizedEmail, user.id, context);
        
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

export async function signUpUser(data: { name: string; email: string; password: string }, request?: Request) {
  const context = request ? createRequestContext(request) : {};
  
  try {
    const validated = signUpSchema.parse(data);
    
    // Normalize email
    const normalizedEmail = normalizeEmail(validated.email);
    
    // Check for existing user with normalized email
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      authLogger.signup.duplicate(normalizedEmail, context);
      throw new Error("An account with this email already exists. Please sign in or use a different email.");
    }

    const passwordHash = await hash(validated.password, 12);

    const user = await prisma.user.create({
      data: {
        name: validated.name.trim(),
        email: normalizedEmail,
        passwordHash,
      },
    });

    authLogger.signup.success(normalizedEmail, user.id, context);
    
    return { id: user.id, email: user.email, name: user.name };
  } catch (error: any) {
    if (error.name === 'ZodError') {
      const firstError = error.errors[0];
      authLogger.signup.failed(data.email, `Validation error: ${firstError.message}`, context);
      throw new Error(firstError.message);
    }
    
    authLogger.signup.failed(data.email, error.message, context);
    throw error;
  }
}

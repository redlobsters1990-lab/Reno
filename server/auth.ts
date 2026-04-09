// NEXT-AUTH V5 CONFIGURATION
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare, hash } from "bcryptjs";
import { prisma } from "@/server/db";
import { signInSchema, signUpSchema } from "@/lib/schemas";
import { normalizeEmail, isValidEmail } from "@/lib/email-utils";

const authOptions = {
  debug: true,
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true, // Required for NextAuth v5 in development
  // CSRF configuration
  cookies: {
    sessionToken: {
      name: `authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: `authjs.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    error: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Auth: Authorize called with:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log("Auth: Missing credentials");
          return null;
        }

        const normalizedEmail = normalizeEmail(credentials.email);
        
        if (!isValidEmail(normalizedEmail)) {
          console.log(`Auth: Invalid email: ${normalizedEmail}`);
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user) {
          console.log(`Auth: User not found: ${normalizedEmail}`);
          return null;
        }

        if (!user.passwordHash) {
          console.log(`Auth: No password hash: ${normalizedEmail}`);
          return null;
        }

        const isValid = await compare(credentials.password, user.passwordHash);

        if (!isValid) {
          console.log(`Auth: Invalid password: ${normalizedEmail}`);
          return null;
        }

        console.log(`Auth: Login successful: ${normalizedEmail}`);
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
};
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
export { authOptions };

// Keep the signUpUser function for API routes
export async function signUpUser(data: { name: string; email: string; password: string }) {
  try {
    const validated = signUpSchema.parse(data);
    
    const normalizedEmail = normalizeEmail(validated.email);
    
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new Error("An account with this email already exists.");
    }

    const passwordHash = await hash(validated.password, 12);

    const user = await prisma.user.create({
      data: {
        name: validated.name.trim(),
        email: normalizedEmail,
        passwordHash,
      },
    });

    console.log(`Auth: User created: ${normalizedEmail}`);
    return { id: user.id, email: user.email, name: user.name };
  } catch (error: any) {
    console.error("Auth: Signup error:", error.message);
    
    // Format Zod validation errors
    if (error.name === 'ZodError') {
      const firstError = error.errors[0];
      let message = firstError.message;
      
      // Make error messages more user-friendly
      if (firstError.path.includes('password')) {
        if (firstError.validation === 'regex') {
          if (firstError.code === 'invalid_string') {
            if (firstError.validation === 'regex') {
              message = "Password must contain at least one " + 
                (firstError.message.includes('uppercase') ? "uppercase letter" :
                 firstError.message.includes('lowercase') ? "lowercase letter" :
                 firstError.message.includes('number') ? "number" :
                 "special character");
            }
          }
        }
      }
      
      throw new Error(message);
    }
    
    throw error;
  }
}
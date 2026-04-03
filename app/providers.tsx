"use client";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

export function Providers({ 
  children,
  session 
}: { 
  children: React.ReactNode;
  session?: Session | null;
}) {
  return (
    <SessionProvider 
      session={session}
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
}
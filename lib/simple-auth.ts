// Simple auth utilities for our bypass system

// Check if user is authenticated (client-side)
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for our auth cookie
  return document.cookie.includes('auth-token=') || 
         document.cookie.includes('next-auth.session-token=');
}

// Get user info from JWT token (simplified)
export async function getUserInfo() {
  if (typeof window === 'undefined') return null;
  
  try {
    // Try to get session from NextAuth
    const response = await fetch('/api/auth/session');
    const session = await response.json();
    
    if (session?.user) {
      return session.user;
    }
    
    // Fallback: check for our cookie
    if (isAuthenticated()) {
      // Return a dummy user object
      return {
        id: 'authenticated-user',
        email: 'user@example.com',
        name: 'Authenticated User'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get user info:', error);
    return null;
  }
}

// Simple logout
export function logout() {
  // Clear cookies
  document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  
  // Redirect to signin
  window.location.href = '/auth/signin';
}

import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Demo Login',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'dubeyaayush019@gmail.com' },
        name: { label: 'Full Name', type: 'text', placeholder: 'Aayush Dubey' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        return {
          id: 'user-aayush-01',
          name: (credentials.name as string) || 'Aayush Dubey',
          email: credentials.email as string,
          image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aayush',
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.NEXTAUTH_SECRET || 'quicksend-jobs-nextauth-secret-key-2026',
});

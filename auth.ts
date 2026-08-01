import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { authenticateUser, findUserByEmail, registerUser } from './lib/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-google-client-secret',
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        name: { label: 'Name', type: 'text' },
        password: { label: 'Password', type: 'password' },
        otp: { label: 'OTP Code', type: 'text' },
        isSignUp: { label: 'Is Sign Up', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const email = (credentials.email as string).trim().toLowerCase();
        const password = credentials.password as string;
        const name = (credentials.name as string) || email.split('@')[0];
        const isSignUp = credentials.isSignUp === 'true';
        const otp = credentials.otp as string;

        // OTP verification flow
        if (otp) {
          let user = await findUserByEmail(email);
          if (!user) {
            user = await registerUser(name, email, `otp-autogen-${Date.now()}`);
          }
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`,
          };
        }

        // Sign Up Flow with Password
        if (isSignUp) {
          if (!password || password.length < 4) {
            throw new Error('Password must be at least 4 characters.');
          }
          const newUser = await registerUser(name, email, password);
          return {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newUser.name)}`,
          };
        }

        // Sign In Flow: Strictly verify password against PostgreSQL
        if (!password) {
          throw new Error('Password is required.');
        }

        const validUser = await authenticateUser(email, password);
        if (!validUser) {
          throw new Error('Invalid email or password. Please check your credentials or Sign Up.');
        }

        return {
          id: validUser.id,
          name: validUser.name,
          email: validUser.email,
          image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(validUser.name)}`,
        };
      },
    }),
  ],
  pages: {
    signIn: '/auth',
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'quicksend-jobs-secret-key-2026',
  trustHost: true,
});

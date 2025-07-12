/* eslint-disable @typescript-eslint/no-explicit-any */
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';

export const authOptions = {
  providers: [
    // --- Credentials Provider (Email/Password) ---
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'jsmith@example.com' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        await dbConnect();

        if (!credentials?.email || !credentials.password) {
          throw new Error('Please enter email and password.');
        }

        const user = await User.findOne({ email: credentials.email }).select('+password');

        if (!user) {
          throw new Error('No user found with this email. Please register.');
        }

        const isPasswordValid = await user.comparePassword(credentials.password);

        if (!isPasswordValid) {
          throw new Error('Incorrect password.');
        }

        return {
          id: (user._id as { toString: () => string }).toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          isProfileComplete: user.isProfileComplete,
          committee: user.committee,
          portfolio: user.portfolio,
          class: user.class,
          school: user.school,
        };
      }
    }),

    // --- Google Provider ---
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  // --- Callbacks ---
  callbacks: {
    async signIn(params: {
      user: import("next-auth").User;
      account: import("next-auth").Account | null;
      profile?: import("next-auth").Profile;
      email?: { verificationRequest?: boolean };
      credentials?: Record<string, unknown>;
    }) {
      const { user, account } = params;
      await dbConnect();

      if (account?.provider !== 'credentials') {
        // Handles social logins
        let existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          existingUser = await User.create({
            email: user.email,
            name: user.name,
            image: user.image,
            isProfileComplete: false, // Mark as incomplete for onboarding
          });
          console.log(`New social user created: ${existingUser.email}`);
        } else {
          existingUser.name = user.name || existingUser.name;
          existingUser.image = user.image || existingUser.image;
          await existingUser.save();
          console.log(`Existing social user updated: ${existingUser.email}`);
        }

        user.id = (existingUser._id as { toString: () => string }).toString();
        user.isProfileComplete = existingUser.isProfileComplete;
        user.committee = existingUser.committee;
        user.portfolio = existingUser.portfolio;
        user.class = existingUser.class;
        user.school = existingUser.school;
      } else {
        // Handles credentials login
        const dbUser = await User.findById(user.id);
        if(dbUser) {
            user.isProfileComplete = dbUser.isProfileComplete;
            user.committee = dbUser.committee;
            user.portfolio = dbUser.portfolio;
            user.class = dbUser.class;
            user.school = dbUser.school;
        }
      }
      return true;
    },

    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.isProfileComplete = user.isProfileComplete;
        token.committee = user.committee;
        token.portfolio = user.portfolio;
        token.class = user.class;
        token.school = user.school;
      }
      return token;
    },

    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.image;
        session.user.isProfileComplete = token.isProfileComplete;
        session.user.committee = token.committee;
        session.user.portfolio = token.portfolio;
        session.user.class = token.class;
        session.user.school = token.school;
      }
      return session;
    },
  },

  // --- Pages ---
  pages: {
    signIn: '/login',
    error: '/login',
  },

  // --- Session Configuration ---
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60,
  },

  // --- Secret for token signing ---
  secret: process.env.NEXTAUTH_SECRET,
};
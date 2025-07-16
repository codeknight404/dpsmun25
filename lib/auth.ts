/* eslint-disable @typescript-eslint/no-unused-vars */
// lib/auth.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

import User from '@/models/User'; // Assuming your Mongoose User model is here
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
      async authorize(credentials, req) {
        await dbConnect();

        if (!credentials?.email || !credentials.password) {
          throw new Error('Please enter email and password.');
        }

        // Select password for comparison, but also fetch isApproved, isProfileComplete etc.
        const user = await User.findOne({ email: credentials.email }).select('+password isApproved isProfileComplete committee portfolio class school');

        if (!user) {
          throw new Error('No user found with this email. Please register.');
        }

        const isPasswordValid = await user.comparePassword(credentials.password);

        if (!isPasswordValid) {
          throw new Error('Incorrect password.');
        }

        // IMPORTANT: Ensure isApproved is returned here from the database user
        return {
          id: (user._id as { toString: () => string }).toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          isProfileComplete: user.isProfileComplete,
          isApproved: user.isApproved,
          committee: user.committee ?? undefined,
          portfolio: user.portfolio ?? undefined,
          class: user.class ?? undefined,
          school: user.school ?? undefined,
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
        // Handles social logins (Google)
        let existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          existingUser = await User.create({
            email: user.email,
            name: user.name,
            image: user.image,
            isProfileComplete: false, // Mark as incomplete for onboarding
            isApproved: false, // <--- Ensure new social users are NOT approved by default
          });
          console.log(`New social user created: ${existingUser.email}`);
        } else {
          // Update user details if they've changed, but only if they're not null/undefined
          existingUser.name = user.name || existingUser.name;
          existingUser.image = user.image || existingUser.image;
          await existingUser.save();
          console.log(`Existing social user updated: ${existingUser.email}`);
        }

        // IMPORTANT: Populate user object with data from DB, including isApproved
        user.id = (existingUser._id as { toString: () => string }).toString();
        user.isProfileComplete = existingUser.isProfileComplete;
        user.isApproved = existingUser.isApproved; // <--- THIS LINE WAS MISSING IN YOUR PREVIOUS UPLOAD
        user.committee = existingUser.committee ?? undefined;
        user.portfolio = existingUser.portfolio ?? undefined;
        user.class = existingUser.class ?? undefined;
        user.school = existingUser.school ?? undefined;
      } else {
        // Handles credentials login
        const dbUser = await User.findById(user.id);
        if(dbUser) {
            user.isProfileComplete = dbUser.isProfileComplete;
            user.isApproved = dbUser.isApproved; // <--- THIS LINE WAS MISSING IN YOUR PREVIOUS UPLOAD
            user.committee = dbUser.committee ?? undefined;
            user.portfolio = dbUser.portfolio ?? undefined;
            user.class = dbUser.class ?? undefined;
            user.school = dbUser.school ?? undefined;
        }
      }
      return true;
    },

    async jwt({ token, user }: { token: any; user: any }) {
      // User object is only present on the first sign-in or when session is updated
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.isProfileComplete = user.isProfileComplete;
        token.isApproved = user.isApproved; // <--- THIS LINE WAS MISSING IN YOUR PREVIOUS UPLOAD
        token.committee = user.committee;
        token.portfolio = user.portfolio;
        token.class = user.class;
        token.school = user.school;
      } else if (token.id) {
        // Subsequent requests, re-fetch user data to ensure latest status if needed
        // This is important for "update" calls or if the DB status changes during a session
        await dbConnect();
        const dbUser = await User.findById(token.id);
        if (dbUser) {
            token.isProfileComplete = dbUser.isProfileComplete;
            token.isApproved = dbUser.isApproved; // <--- THIS LINE WAS MISSING IN YOUR PREVIOUS UPLOAD
            token.committee = dbUser.committee;
            token.portfolio = dbUser.portfolio;
            token.class = dbUser.class;
            token.school = dbUser.school;
        }
      }
      return token;
    },

    async session({ session, token }: { session: any; token: any }) {
      // Assign token properties to session.user
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.image;
        session.user.isProfileComplete = token.isProfileComplete;
        session.user.isApproved = token.isApproved; // <--- THIS LINE WAS MISSING IN YOUR PREVIOUS UPLOAD
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // --- Secret for token signing ---
  secret: process.env.NEXTAUTH_SECRET,
};
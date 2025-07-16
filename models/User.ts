// models/User.ts (Updated)
/* eslint-disable @typescript-eslint/no-explicit-any */

import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import 'next-auth'
import 'next-auth/jwt' // Import for JWT type extension

// Extend the NextAuth session user type to include custom fields and isApproved
declare module "next-auth" {
  interface Session {
    user?: {
      id?: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isProfileComplete?: boolean;
      isApproved?: boolean; // Added isApproved
      committee?: string;
      portfolio?: string;
      class?: string;
      school?: string;
    };
  }
  interface User {
    isProfileComplete?: boolean;
    isApproved?: boolean; // Added isApproved
    committee?: string;
    portfolio?: string;
    class?: string;
    school?: string;
  }
}

// Extend the NextAuth JWT token type
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    isProfileComplete?: boolean;
    isApproved?: boolean; // Added isApproved to JWT
    committee?: string;
    portfolio?: string;
    class?: string;
    school?: string;
  }
}

export interface IUser extends Document {
  email: string;
  password?: string;
  name?: string;
  image?: string;

  committee: string | null;
  portfolio: string | null;
  class: string | null;
  school: string | null;

  isProfileComplete: boolean;
  isApproved: boolean; // Added isApproved to the Mongoose interface

  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false,
  },
  name: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    trim: true,
  },
  committee: {
    type: String,
    trim: true,
    default: null,
  },
  portfolio: {
    type: String,
    trim: true,
    default: null,
  },
  class: {
    type: String,
    trim: true,
    default: null,
  },
  school: {
    type: String,
    trim: true,
    default: null,
  },
  isProfileComplete: {
    type: Boolean,
    default: false, // Default to false, will be set true on onboarding completion
  },
  isApproved: { // New field
    type: Boolean,
    default: false, // Default to false, requires admin approval
  },
}, {
  timestamps: true,
  strict: true,
});

UserSchema.pre<IUser>('save', async function (next) {
  if (this.password && this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error: any) {
      next(error);
    }
  } else {
    next();
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) {
    return false;
  }

  return bcrypt.compare(candidatePassword, this.password);
};

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
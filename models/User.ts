/* eslint-disable @typescript-eslint/no-explicit-any */

import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import 'next-auth'

declare module "next-auth" {
  interface User {
    isProfileComplete?: boolean;
    committee?: string | null;
    portfolio?: string | null;
    class?: string | null;
    school?: string | null;
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
    default: false,
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
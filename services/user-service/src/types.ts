import { Context } from "hono";

export type HonoContext = Context;

export interface CreateUserBody {
  username: string;
  email: string;
  password: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  interests?: string[];
}

export interface UpdateUserBody {
  displayName?: string;
  avatar?: string;
  bio?: string;
  interests?: string[];
}

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export interface VerifyPasswordBody {
  password: string;
}

export interface SafeUser {
  id: number;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  interests: string[];
  reputation: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

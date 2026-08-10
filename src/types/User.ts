export enum UserRole {
  ADMIN = "admin",
  USER = "user"
}

export interface IUser {
  username: string;
  lastname: string;
  name: string;
  email: string;
  password: string;
  enabled: boolean;
  isVerified: boolean;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(password: string): Promise<boolean>;
}
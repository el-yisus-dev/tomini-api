import { Types } from "mongoose";

export interface IStore {
  name: string;
  description?: string;
  phone?: string;
  address?: string;
  owner: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

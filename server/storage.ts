import { type User } from "@shared/schema";
import { randomUUID } from "crypto";

export type InsertUser = Omit<User, "entryId"> & { entryId?: string };

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User & { id: string }>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.phone === phone);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user = { ...insertUser, id } as User & { id: string };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();

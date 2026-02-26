import type { Express } from "express";
import type { Server } from "http";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // No backend routes required as requested by user.
  // All state is managed in the frontend via localStorage.
  return httpServer;
}

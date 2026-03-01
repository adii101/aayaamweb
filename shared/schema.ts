import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional(),
  college: z.string().min(1, "College is required").default("Unknown"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  entryId: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;

export const teamMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().optional(),
});

export type TeamMember = z.infer<typeof teamMemberSchema>;

export const teamSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Team name is required"),
  members: z.array(teamMemberSchema),
});

export type Team = z.infer<typeof teamSchema>;

export const eventSchema = z.object({
  id: z.string(),
  name: z.string(),
  date: z.string(),
  description: z.string(),
  fullDescription: z.string(),
  type: z.enum(["Solo", "Team"]),
  prize: z.string(),
  rules: z.array(z.string()),
  rounds: z.number(),
  unstopUrl: z.string().url().optional(),
  ruleBookUrl: z.string().url().optional(),
  posterUrl: z.string().url().optional(),
});

export type FestEvent = z.infer<typeof eventSchema>;

import type { ProjectWithRole } from "@/domains/project/core/domain/project.types";

export type ProjectStats = {
  memberCount: number;
  ticketCount: number;
  inProgressCount: number;
  completedCount: number;
};

export type ProjectWithStats = ProjectWithRole & ProjectStats;

export type ReclaimableProject = {
  id: string;
  name: string;
  shortCode: string;
  orphanedAt: Date;
};

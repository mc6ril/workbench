-- Migration: Add performance indexes
-- Adds composite indexes for frequently queried column combinations to optimize query performance
-- Ticket: 48 - Database indexes for performance optimization

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Composite index for queries filtering tickets by project and epic
-- Used by: TicketRepository.listByProject(projectId, { epicId })
-- Query pattern: SELECT * FROM tickets WHERE project_id = ? AND epic_id = ?
-- This index optimizes queries that filter tickets by both project and epic
CREATE INDEX IF NOT EXISTS idx_tickets_project_epic 
ON tickets(project_id, epic_id);

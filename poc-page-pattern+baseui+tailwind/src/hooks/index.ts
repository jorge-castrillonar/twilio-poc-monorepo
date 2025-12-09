/**
 * Custom Hooks
 * Centralized exports for application hooks
 * 
 * Philosophy: Custom hooks should only exist for complex orchestration logic.
 * For simple state access + mutations, use RTK Query hooks + Redux directly.
 */

export { useFiles } from './useFiles';

// Re-export types for convenience
export type { FileRecord } from './useFiles';

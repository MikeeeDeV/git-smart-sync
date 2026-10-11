/**
 * Represents metadata and status for a local or remote Git branch.
 */
export interface BranchInfo {
  name: string;
  isRemote: boolean;
  isCurrent: boolean;
  remoteName?: string;
  aheadCount?: number;
  behindCount?: number;
  upstreamRef?: string;
  lastCommitHash?: string;
  lastCommitSubject?: string;
}

/**
 * Status outcomes for individual branch sync operations.
 */
export type SyncStatus = 'success' | 'failed' | 'skipped' | 'up-to-date';

/**
 * Result details for a specific branch sync operation.
 */
export interface SyncBranchResult {
  branch: string;
  status: SyncStatus;
  message?: string;
  durationMs?: number;
}

/**
 * Overall report for a multi-branch synchronization batch.
 */
export interface SyncBatchReport {
  timestamp: Date;
  remote: string;
  results: SyncBranchResult[];
  successCount: number;
  failedCount: number;
  skippedCount: number;
  totalDurationMs: number;
}

/**
 * Configurable strategies for synchronizing branches.
 */
export type SyncStrategy = 'fast-forward' | 'force-with-lease' | 'merge' | 'rebase';

/**
 * Options controlling the sync execution.
 */
export interface SyncOptions {
  remote: string;
  strategy?: SyncStrategy;
  dryRun?: boolean;
  pullBeforePush?: boolean;
}

/**
 * Branch preset group defined in user/workspace configuration.
 */
export interface BranchPreset {
  id: string;
  name: string;
  branches: string[];
  description?: string;
}

/**
 * Workspace Git repository context.
 */
export interface GitRepositoryContext {
  rootPath: string;
  repoName: string;
  currentBranch: string;
  remotes: string[];
}

import { GitRunner } from './gitRunner';
import { BranchInfo } from '../types';

export class BranchService {
  constructor(private readonly runner: GitRunner) {}

  /**
   * Retrieve all local branches with their latest commit subject and active status.
   */
  public async getLocalBranches(cwd: string, currentBranch: string): Promise<BranchInfo[]> {
    try {
      const format = '%(refname:short)|%(objectname:short)|%(contents:subject)';
      const output = await this.runner.execute(['branch', `--format=${format}`], cwd);
      const lines = output.split('\n').map(l => l.trim()).filter(Boolean);

      const branches: BranchInfo[] = [];

      for (const line of lines) {
        const [name, hash, subject] = line.split('|');
        if (!name) continue;

        const isCurrent = name === currentBranch;
        branches.push({
          name,
          isRemote: false,
          isCurrent,
          lastCommitHash: hash,
          lastCommitSubject: subject
        });
      }

      return branches;
    } catch {
      return [];
    }
  }

  /**
   * Retrieve all remote branches, stripped of the remote prefix.
   */
  public async getRemoteBranches(cwd: string, remote: string): Promise<BranchInfo[]> {
    try {
      const output = await this.runner.execute(['branch', '-r', '--format=%(refname:short)'], cwd);
      const lines = output.split('\n').map(l => l.trim()).filter(Boolean);

      const branches: BranchInfo[] = [];
      const remotePrefix = `${remote}/`;

      for (const line of lines) {
        if (line.includes('HEAD')) continue;
        if (line.startsWith(remotePrefix)) {
          const name = line.substring(remotePrefix.length);
          branches.push({
            name,
            isRemote: true,
            isCurrent: false,
            remoteName: remote
          });
        }
      }

      return branches;
    } catch {
      return [];
    }
  }

  /**
   * Combine local and remote branches into a unified deduplicated list.
   */
  public async getAllBranches(cwd: string, remote: string, currentBranch: string): Promise<BranchInfo[]> {
    const local = await this.getLocalBranches(cwd, currentBranch);
    const remoteBranches = await this.getRemoteBranches(cwd, remote);

    const branchMap = new Map<string, BranchInfo>();

    for (const b of local) {
      branchMap.set(b.name, b);
    }

    for (const rb of remoteBranches) {
      if (!branchMap.has(rb.name)) {
        branchMap.set(rb.name, rb);
      }
    }

    return Array.from(branchMap.values());
  }

  /**
   * Determine whether a branch can fast-forward to another commit ref
   * without losing commits (i.e., branch is an ancestor of targetRef).
   */
  public async canFastForward(branch: string, targetRef: string, cwd: string): Promise<boolean> {
    try {
      // Returns 0 if branch commit is ancestor of targetRef
      await this.runner.execute(['merge-base', '--is-ancestor', branch, targetRef], cwd);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get ahead/behind commit counts between two branches or refs.
   */
  public async getDivergenceCounts(
    refA: string,
    refB: string,
    cwd: string
  ): Promise<{ ahead: number; behind: number }> {
    try {
      const output = await this.runner.execute(['rev-list', '--left-right', '--count', `${refA}...${refB}`], cwd);
      const [aheadStr, behindStr] = output.trim().split(/\s+/);
      return {
        ahead: parseInt(aheadStr, 10) || 0,
        behind: parseInt(behindStr, 10) || 0
      };
    } catch {
      return { ahead: 0, behind: 0 };
    }
  }

  /**
   * Prune stale remote tracking branches.
   */
  public async pruneRemote(remote: string, cwd: string): Promise<string> {
    return this.runner.execute(['remote', 'prune', remote], cwd);
  }
}

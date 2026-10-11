import * as path from 'path';
import * as vscode from 'vscode';
import { GitRunner } from './gitRunner';
import { GitRepositoryContext } from '../types';

export class RepositoryService {
  constructor(private readonly runner: GitRunner) {}

  /**
   * Find all Git repositories within the active VS Code workspace folders.
   */
  public async getRepositories(): Promise<GitRepositoryContext[]> {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      return [];
    }

    const repos: GitRepositoryContext[] = [];
    const seenRoots = new Set<string>();

    for (const folder of folders) {
      const folderPath = folder.uri.fsPath;
      try {
        const rootPath = await this.runner.execute(['rev-parse', '--show-toplevel'], folderPath);
        if (seenRoots.has(rootPath)) {
          continue;
        }
        seenRoots.add(rootPath);

        const currentBranch = await this.getCurrentBranch(rootPath);
        const remotes = await this.getRemotes(rootPath);
        const repoName = path.basename(rootPath);

        repos.push({
          rootPath,
          repoName,
          currentBranch,
          remotes
        });
      } catch {
        // Not a git repository or git error, safely skip folder
      }
    }

    return repos;
  }

  /**
   * Get the primary repository context, prompting user if multiple repositories exist.
   */
  public async getActiveRepository(): Promise<GitRepositoryContext | undefined> {
    const repos = await this.getRepositories();
    if (repos.length === 0) {
      vscode.window.showErrorMessage('No active Git repository detected in the current workspace.');
      return undefined;
    }

    if (repos.length === 1) {
      return repos[0];
    }

    // If active text editor exists, check if it belongs to one of the repos
    const activeDoc = vscode.window.activeTextEditor?.document;
    if (activeDoc && !activeDoc.isUntitled) {
      const docPath = activeDoc.uri.fsPath;
      const matched = repos.find(r => docPath.startsWith(r.rootPath));
      if (matched) {
        return matched;
      }
    }

    // Prompt user to select repository
    const picks = repos.map(r => ({
      label: r.repoName,
      description: `Branch: ${r.currentBranch} (${r.rootPath})`,
      repo: r
    }));

    const selected = await vscode.window.showQuickPick(picks, {
      placeHolder: 'Select Git repository to synchronize:'
    });

    return selected?.repo;
  }

  /**
   * Detect currently checked-out branch in repository.
   */
  public async getCurrentBranch(cwd: string): Promise<string> {
    try {
      const branch = await this.runner.execute(['rev-parse', '--abbrev-ref', 'HEAD'], cwd);
      return branch.trim();
    } catch {
      return 'HEAD';
    }
  }

  /**
   * List configured remote names (e.g. ['origin', 'upstream']).
   */
  public async getRemotes(cwd: string): Promise<string[]> {
    try {
      const output = await this.runner.execute(['remote'], cwd);
      return output
        .split('\n')
        .map(r => r.trim())
        .filter(Boolean);
    } catch {
      return [];
    }
  }
}

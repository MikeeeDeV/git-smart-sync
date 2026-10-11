import * as vscode from 'vscode';
import { GitRunner } from './git/gitRunner';
import { RepositoryService } from './git/repositoryService';
import { BranchService } from './git/branchService';
import { ConfigurationService } from './config/configurationService';
import { SyncEngine } from './sync/syncEngine';
import { QuickPickService } from './ui/quickPick';
import { StatusBarManager } from './ui/statusBar';
import { BranchTreeProvider, BranchTreeItem } from './ui/branchTreeProvider';
import { SyncCommand } from './commands/syncCommand';
import { SyncAllCommand } from './commands/syncAllCommand';
import { SyncPresetCommand } from './commands/syncPresetCommand';
import { PruneCommand } from './commands/pruneCommand';
import { DryRunCommand } from './commands/dryRunCommand';

export function activate(context: vscode.ExtensionContext): void {
  // ─── Initialize Core Services ─────────────────────────────────────────────
  const runner = new GitRunner();
  const repoService = new RepositoryService(runner);
  const branchService = new BranchService(runner);
  const configService = new ConfigurationService();
  const syncEngine = new SyncEngine(runner, branchService);
  const quickPick = new QuickPickService();

  // ─── Initialize UI Providers ──────────────────────────────────────────────
  const statusBar = new StatusBarManager(configService);
  statusBar.init(context);
  context.subscriptions.push(statusBar);

  const treeProvider = new BranchTreeProvider(repoService, branchService, configService);
  const treeView = vscode.window.createTreeView('gitSmartSync.views.branches', {
    treeDataProvider: treeProvider,
    showCollapseAll: true
  });
  context.subscriptions.push(treeView);

  // ─── Initialize Commands ──────────────────────────────────────────────────
  const syncCmd = new SyncCommand(repoService, branchService, syncEngine, quickPick, configService);
  const syncAllCmd = new SyncAllCommand(repoService, branchService, syncCmd);
  const syncPresetCmd = new SyncPresetCommand(configService, quickPick, syncCmd);
  const pruneCmd = new PruneCommand(repoService, branchService, configService);
  const dryRunCmd = new DryRunCommand(repoService, branchService, syncEngine, quickPick, configService);

  // ─── Register VS Code Commands ────────────────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand('gitSmartSync.sync', async (branches?: string[]) => {
      await syncCmd.execute(branches);
      treeProvider.refresh();
    }),

    vscode.commands.registerCommand('gitSmartSync.syncAll', async () => {
      await syncAllCmd.execute();
      treeProvider.refresh();
    }),

    vscode.commands.registerCommand('gitSmartSync.syncPreset', async (item?: BranchTreeItem) => {
      const branches = item?.presetBranches;
      await syncPresetCmd.execute(branches);
      treeProvider.refresh();
    }),

    vscode.commands.registerCommand('gitSmartSync.prune', async () => {
      await pruneCmd.execute();
      treeProvider.refresh();
    }),

    vscode.commands.registerCommand('gitSmartSync.dryRun', async () => {
      await dryRunCmd.execute();
    }),

    vscode.commands.registerCommand('gitSmartSync.refreshView', () => {
      treeProvider.refresh();
    })
  );

  // ─── Auto-update status bar on active document change ─────────────────────
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(async () => {
      const repo = await repoService.getActiveRepository();
      if (repo) {
        statusBar.update(repo.currentBranch);
      }
    })
  );

  // Initial status bar setup
  repoService.getActiveRepository().then(repo => {
    if (repo) {
      statusBar.update(repo.currentBranch);
    }
  });
}

export function deactivate(): void {}

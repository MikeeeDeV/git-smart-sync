import * as vscode from 'vscode';
import { GitRunner } from './git/gitRunner';
import { RepositoryService } from './git/repositoryService';
import { BranchService } from './git/branchService';
import { ConfigurationService } from './config/configurationService';
import { SyncEngine } from './sync/syncEngine';
import { QuickPickService } from './ui/quickPick';
import { StatusBarManager } from './ui/statusBar';
import { BranchTreeProvider, BranchTreeItem } from './ui/branchTreeProvider';
import { OutputChannelLogger } from './ui/outputChannel';
import { SyncCommand } from './commands/syncCommand';
import { SyncAllCommand } from './commands/syncAllCommand';
import { SyncPresetCommand } from './commands/syncPresetCommand';
import { AddPresetCommand } from './commands/addPresetCommand';
import { DeletePresetCommand } from './commands/deletePresetCommand';
import { SelectRemoteCommand } from './commands/selectRemoteCommand';
import { PruneCommand } from './commands/pruneCommand';
import { DryRunCommand } from './commands/dryRunCommand';

export function activate(context: vscode.ExtensionContext): void {
  // ─── Initialize Output Channel & Logger ───────────────────────────────────
  const logger = new OutputChannelLogger();
  context.subscriptions.push(logger);

  // ─── Initialize Core Services ─────────────────────────────────────────────
  const runner = new GitRunner(logger);
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
  const syncCmd = new SyncCommand(repoService, branchService, syncEngine, quickPick, configService, logger);
  const syncAllCmd = new SyncAllCommand(repoService, branchService, syncCmd);
  const syncPresetCmd = new SyncPresetCommand(configService, quickPick, syncCmd);
  const addPresetCmd = new AddPresetCommand(repoService, branchService, configService, quickPick, logger);
  const deletePresetCmd = new DeletePresetCommand(configService, logger);
  const selectRemoteCmd = new SelectRemoteCommand(repoService, configService, logger);
  const pruneCmd = new PruneCommand(repoService, branchService, configService, logger);
  const dryRunCmd = new DryRunCommand(repoService, branchService, syncEngine, quickPick, configService, logger);

  // ─── Register VS Code Commands ────────────────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand('gitSmartSync.sync', async (branches?: string[] | BranchTreeItem) => {
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

    vscode.commands.registerCommand('gitSmartSync.addPreset', async () => {
      await addPresetCmd.execute();
      treeProvider.refresh();
    }),

    vscode.commands.registerCommand('gitSmartSync.deletePreset', async (item?: BranchTreeItem) => {
      await deletePresetCmd.execute(item);
      treeProvider.refresh();
    }),

    vscode.commands.registerCommand('gitSmartSync.selectRemote', async () => {
      await selectRemoteCmd.execute();
      treeProvider.refresh();
    }),

    vscode.commands.registerCommand('gitSmartSync.prune', async () => {
      await pruneCmd.execute();
      treeProvider.refresh();
    }),

    vscode.commands.registerCommand('gitSmartSync.dryRun', async () => {
      await dryRunCmd.execute();
    }),

    vscode.commands.registerCommand('gitSmartSync.showOutput', () => {
      logger.show();
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

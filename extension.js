const vscode = require('vscode');
const { exec } = require('child_process');

/**
 * Execute shell command with promise in working directory
 */
function runGit(cmd, cwd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd }, (err, stdout, stderr) => {
      if (err) {
        return reject(new Error(stderr || stdout || err.message));
      }
      resolve(stdout.trim());
    });
  });
}

/**
 * Extension Activation
 */
function activate(context) {
  const config = vscode.workspace.getConfiguration('gitSmartSync');
  const defaultRemote = config.get('defaultRemote', 'origin');

  // ─── 1. Status Bar Item ───────────────────────────────────────────────────
  if (config.get('showStatusBar', true)) {
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 10);
    statusBar.command = 'gitSmartSync.sync';
    statusBar.text = '$(sync) Sync Branches';
    statusBar.tooltip = 'Sync and push changes to selected branches';
    statusBar.show();
    context.subscriptions.push(statusBar);
  }

  // ─── 2. Interactive Multi-Branch Sync Command ─────────────────────────────
  const syncCommand = vscode.commands.registerCommand('gitSmartSync.sync', async () => {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      vscode.window.showErrorMessage('No workspace folder is currently open.');
      return;
    }

    // Resolve git repository root
    let cwd = folders[0].uri.fsPath;
    try {
      cwd = await runGit('git rev-parse --show-toplevel', cwd);
    } catch {
      vscode.window.showErrorMessage('The active workspace folder is not a valid Git repository.');
      return;
    }

    // Detect active branch
    let currentBranch = 'main';
    try {
      currentBranch = await runGit('git rev-parse --abbrev-ref HEAD', cwd);
    } catch (e) {
      console.warn('Failed to detect current branch:', e);
    }

    // Detect all local branches
    let branches = [];
    try {
      const out = await runGit('git branch --format="%(refname:short)"', cwd);
      branches = out.split('\n').map(b => b.trim()).filter(Boolean);
    } catch (e) {
      vscode.window.showErrorMessage('Failed to retrieve repository branches: ' + e.message);
      return;
    }

    if (branches.length === 0) {
      branches = [currentBranch];
    }

    // Detect all remote branches
    try {
      const remOut = await runGit(`git branch -r --format="%(refname:short)"`, cwd);
      const remBranches = remOut
        .split('\n')
        .map(b => b.replace(new RegExp(`^${defaultRemote}/`), '').trim())
        .filter(b => b && !b.includes('HEAD'));
      for (const rb of remBranches) {
        if (!branches.includes(rb)) branches.push(rb);
      }
    } catch (e) {
      console.warn('Failed to detect remote branches:', e);
    }

    // Build QuickPick items with native checkboxes
    const items = branches.map(b => ({
      label: b,
      description: b === currentBranch ? '(Current active branch)' : '',
      picked: true // Pre-selected by default
    }));

    const selected = await vscode.window.showQuickPick(items, {
      canPickMany: true,
      placeHolder: 'Select branches to sync and push changes to:'
    });

    if (!selected || selected.length === 0) {
      vscode.window.showInformationMessage('Branch synchronization cancelled.');
      return;
    }

    const selectedBranches = selected.map(s => s.label);

    // Run Sync & Push with native Progress Notification
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Syncing and pushing ${selectedBranches.length} branches to ${defaultRemote}...`,
        cancellable: false
      },
      async progress => {
        const success = [];
        const failed = [];

        for (const branch of selectedBranches) {
          progress.report({ message: `Pushing [${branch}]...` });
          try {
            if (branch === currentBranch) {
              await runGit(`git push ${defaultRemote} ${branch}`, cwd);
            } else {
              // Fast-forward local branch pointer to HEAD if exists, then push refspec
              await runGit(`git branch -f ${branch} HEAD`, cwd).catch(() => {});
              await runGit(`git push ${defaultRemote} HEAD:refs/heads/${branch}`, cwd);
            }
            success.push(branch);
          } catch (err) {
            failed.push(`${branch} (${err.message.slice(0, 70)})`);
          }
        }

        if (failed.length > 0) {
          vscode.window.showWarningMessage(
            `Sync completed for: [${success.join(', ')}] | Failed: [${failed.join(', ')}]`
          );
        } else {
          vscode.window.showInformationMessage(
            `Successfully synced and pushed branches: ${success.join(', ')}`
          );
        }
      }
    );
  });

  // ─── 3. Sync All Branches Immediately Command ─────────────────────────────
  const syncAllCommand = vscode.commands.registerCommand('gitSmartSync.syncAll', async () => {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) return;
    let cwd = folders[0].uri.fsPath;
    try {
      cwd = await runGit('git rev-parse --show-toplevel', cwd);
      const out = await runGit('git branch --format="%(refname:short)"', cwd);
      const branches = out.split('\n').map(b => b.trim()).filter(Boolean);
      const currentBranch = await runGit('git rev-parse --abbrev-ref HEAD', cwd);

      for (const branch of branches) {
        if (branch === currentBranch) {
          await runGit(`git push ${defaultRemote} ${branch}`, cwd);
        } else {
          await runGit(`git branch -f ${branch} HEAD`, cwd).catch(() => {});
          await runGit(`git push ${defaultRemote} HEAD:refs/heads/${branch}`, cwd);
        }
      }
      vscode.window.showInformationMessage(`Successfully synced and pushed all branches: ${branches.join(', ')}`);
    } catch (err) {
      vscode.window.showErrorMessage('Sync error: ' + err.message);
    }
  });

  context.subscriptions.push(syncCommand, syncAllCommand);
}

function deactivate() {}

module.exports = { activate, deactivate };

<p align="center">
  <img src="media/icon.png" width="100" height="100" alt="Git Smart Branch Sync Logo" />
</p>

<h1 align="center">Git Smart Branch Sync</h1>

<p align="center">
  <b>Multi-branch synchronization, branch presets, and divergence protection inside VS Code & Antigravity IDE.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue.svg?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/VS%20Code-%5E1.75.0-007ACC.svg?style=flat-square&logo=visual-studio-code" alt="VS Code" />
  <img src="https://img.shields.io/badge/Node.js-%E2%89%A518.0.0-339933.svg?style=flat-square&logo=node.js" alt="Node.js" />
</p>

---

## 🚀 Overview

**Git Smart Branch Sync** eliminates tedious manual Git workflows when managing multiple parallel branches (e.g. `main`, `staging`, `production`, `release`).

Instead of repeatedly checking out branches or crafting fragile terminal loops, this extension equips your editor with:
- An **interactive QuickPick** featuring native checkboxes.
- A dedicated **Source Control Sidebar Tree View**.
- **Configurable Branch Presets** to sync entire environments in one click.
- **Divergence Guardrails** to guarantee your branches are never overwritten unintentionally.
- A **Dry-Run Mode** to inspect and simulate actions safely before pushing.

---

## ✨ Key Features

* **Interactive Multi-Branch Checkboxes**: Select exactly which branches to push to with one click.
* **Dedicated SCM Sidebar View**: Browse configured Presets, Local Branches, and Remote Branches directly in the Source Control panel.
* **Environment Presets**: Define branch groups (e.g. `production: ["main", "release"]`) to push across pipelines instantaneously.
* **Divergence Guardrails**: Built-in ancestor validation (`merge-base`) prevents destructive pointer rewrites unless explicitly configured.
* **Dry-Run Simulation**: Preview exactly what branches would be pushed without executing network operations.
* **Cancellable Background Progress**: Native progress notifications with mid-flight cancellation support.
* **Status Bar Integration**: Real-time indicator in your editor's bottom bar for immediate access.
* **Secure Execution**: Parameterized `execFile` CLI operations protecting against command injection.

---

## 📸 Usage & Commands

| Command | Title | Description |
|---|---|---|
| `gitSmartSync.sync` | **Sync to Selected Branches...** | Opens interactive dropdown with checkboxes to select target branches. |
| `gitSmartSync.syncAll` | **Sync All Branches** | Synchronizes all local repository branches to the default remote. |
| `gitSmartSync.syncPreset` | **Sync Branch Preset...** | Select and sync a configured environment group. |
| `gitSmartSync.dryRun` | **Dry-Run Sync (Preview Only)** | Simulates push operations without touching remotes. |
| `gitSmartSync.prune` | **Prune Stale Remote Branches** | Cleans up local references to deleted remote branches. |
| `gitSmartSync.refreshView` | **Refresh Branches View** | Updates the SCM sidebar tree view. |

---

## ⚙️ Configuration

Customize the extension via **Settings** (`Ctrl + ,` / `Cmd + ,` -> search `gitSmartSync`):

| Setting | Type | Default | Description |
|---|---|---|---|
| `gitSmartSync.defaultRemote` | `string` | `"origin"` | Default Git remote name to push and sync to. |
| `gitSmartSync.showStatusBar` | `boolean` | `true` | Show or hide the sync button in the editor status bar. |
| `gitSmartSync.syncStrategy` | `string` | `"fast-forward"` | Safety strategy: `"fast-forward"` prevents overwriting diverged branches; `"force-with-lease"` overrides if safe. |
| `gitSmartSync.autoPullBeforePush` | `boolean` | `false` | Automatically execute `git pull` on the active branch before pushing. |
| `gitSmartSync.presets` | `object` | `{"release": ["main", "production"], "development": ["dev", "staging"]}` | Custom branch presets for quick group synchronization. |

---

## 📦 Manual Installation

To install directly in **Antigravity IDE** or **VS Code**:

```bash
# Compile and build
npm install
npm run build

# Install to Antigravity IDE
cp -r . ~/.antigravity-ide/extensions/git-smart-sync-1.1.0

# Install to VS Code
cp -r . ~/.vscode/extensions/git-smart-sync-1.1.0
```

Then reload your editor (`Ctrl + Shift + P` -> `Developer: Reload Window`).

---

## 📄 License

MIT © [Mohamed Ayman](https://github.com/MikeeeDeV)

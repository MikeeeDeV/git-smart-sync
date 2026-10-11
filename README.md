# Git Smart Branch Sync

> **Seamless multi-branch Git synchronization with interactive checkboxes right inside VS Code and Antigravity Source Control.**

---

## Overview

**Git Smart Branch Sync** is a lightweight, zero-dependency extension for **VS Code** and **Antigravity IDE** engineered to eliminate repetitive Git branching workflows. Instead of pushing to each branch one by one or maintaining custom CLI scripts, this extension provides an interactive native dropdown with **checkboxes** to select exactly which branches to sync and push in a single click.

---

## Features

- **Interactive Checkbox Selection**: Select target branches (`main`, `dev`, `staging`, `lite`, etc.) using native checkboxes.
- **One-Click Source Control Button**: Integrated directly into the **Source Control (SCM) Title Bar** (`$(sync)`).
- **Status Bar Quick Sync**: Accessible anytime from the bottom status bar (`$(sync) Sync Branches`).
- **Zero External Dependencies**: Pure Node.js and VS Code API — works instantly across Linux, macOS, and Windows.
- **Global Support**: Works automatically on any repository and workspace opened in your editor.
- **Live Progress Feedback**: Displays real-time progress notifications as each branch is updated and pushed.

---

## How to Use

1. Open any Git repository in your editor.
2. In the **Source Control** view (`Ctrl + Shift + G`), click the **`$(sync)`** icon in the header (or click **`$(sync) Sync Branches`** in the bottom status bar).
3. A dropdown appears with checkboxes for all local and remote branches.
4. Select the target branches and press **Enter**.
5. Real-time notifications will report progress and confirm the sync outcome.

---

## Extension Settings

| Setting | Type | Default | Description |
|---|---|---|---|
| `gitSmartSync.showStatusBar` | boolean | `true` | Show the Git Smart Sync button in the editor status bar. |
| `gitSmartSync.defaultRemote` | string | `"origin"` | Default Git remote name to push and sync to. |

---

## Manual Installation

To install directly in your IDE without a marketplace:

```bash
# For Antigravity IDE
cp -r . ~/.antigravity-ide/extensions/smart-git-sync-1.0.0

# For VS Code
cp -r . ~/.vscode/extensions/smart-git-sync-1.0.0
```

Then reload the editor (`Ctrl + Shift + P` -> `Developer: Reload Window`).

---

## License

MIT (c) [Mohamed Ayman](https://github.com/MikeeeDeV)

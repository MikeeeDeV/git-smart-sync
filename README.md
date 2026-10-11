# 🌿 Git Smart Branch Sync

> **Seamless multi-branch Git synchronization with interactive checkboxes right inside VS Code and Antigravity Source Control.**

---

## 🌟 Overview | نظرة عامة

**Git Smart Branch Sync** is a lightweight, zero-dependency extension for **VS Code** and **Antigravity IDE** engineered to eliminate repetitive Git branching headaches. Instead of pushing to each branch one by one or running complex CLI scripts, this extension gives you an interactive native dropdown with **checkboxes** to select exactly which branches to sync and push in a single click.

---

## ✨ Features | المميزات الرئيسية

- 🔘 **Interactive Checkbox Selection**: Select target branches (`main`, `dev`, `staging`, `lite`, etc.) using native checkboxes.
- 📌 **One-Click Source Control Button**: Integrated directly into the **Source Control (SCM) Title Bar** (`$(sync)`).
- 📍 **Status Bar Quick Sync**: Accessible anytime from the bottom status bar (`$(sync) مزامنة الفروع`).
- ⚡ **Zero External Dependencies**: Pure Node.js & VS Code API — works instantly on Linux, macOS, and Windows.
- 🌍 **Global Support**: Works automatically on **any** repository and workspace opened in your editor.
- 📊 **Live Progress Feedback**: Displays real-time progress notifications as each branch is updated and pushed.

---

## 🚀 How to Use | طريقة الاستخدام

1. Open any Git repository in your editor.
2. In the **Source Control** view (`Ctrl + Shift + G`), click the **`$(sync)`** icon in the header (or click **`$(sync) مزامنة الفروع`** in the bottom status bar).
3. A dropdown appears with checkboxes for all local and remote branches.
4. Select the branches you want and press **Enter**.
5. Watch the real-time notification confirm the successful sync of all selected branches!

---

## ⚙️ Extension Settings | الإعدادات

| الإعداد | النوع | القيمة الافتراضية | الوصف |
|---|---|---|---|
| `gitSmartSync.showStatusBar` | boolean | `true` | إظهار زر المزامنة في شريط الحالة السفلي |
| `gitSmartSync.defaultRemote` | string | `"origin"` | اسم الريموت الافتراضي للمزامنة والرفع |

---

## 📦 Manual Installation | التثبيت اليدوي

To install in your IDE without marketplace:

```bash
# For Antigravity IDE
cp -r . ~/.antigravity-ide/extensions/smart-git-sync-1.0.0

# For VS Code
cp -r . ~/.vscode/extensions/smart-git-sync-1.0.0
```

Then reload the editor (`Ctrl + Shift + P` -> `Developer: Reload Window`).

---

## 📄 License

MIT © [Mohamed Ayman](https://github.com/MikeeeDeV)

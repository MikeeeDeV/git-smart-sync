# Contributing to Git Smart Branch Sync

Thank you for your interest in contributing to **Git Smart Branch Sync**!

---

## 🛠️ Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/MikeeeDeV/git-smart-sync.git
   cd git-smart-sync
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Compile TypeScript**:
   ```bash
   npm run build
   ```

4. **Run in Watch mode**:
   ```bash
   npm run watch
   ```

5. **Launch Extension Development Host**:
   - Open the project in VS Code / Antigravity IDE.
   - Press `F5` to start a new Extension Development Host window with the extension pre-loaded.

---

## 🧪 Running Tests

Ensure all automated unit tests pass before submitting changes:
```bash
npm test
```

To typecheck without building:
```bash
npm run lint
```

---

## 📝 Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New features or capabilities
- `fix:` Bug fixes
- `refactor:` Code improvements without behavioral changes
- `test:` Adding or updating unit tests
- `docs:` Documentation improvements
- `ci:` CI/CD pipeline or build system changes
- `chore:` Dependency or metadata updates

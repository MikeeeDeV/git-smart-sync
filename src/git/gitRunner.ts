import { execFile, ExecFileOptions } from 'child_process';
import * as vscode from 'vscode';

/**
 * Custom error class wrapping Git CLI failures with rich context.
 */
export class GitError extends Error {
  constructor(
    message: string,
    public readonly command: string,
    public readonly args: string[],
    public readonly exitCode?: number,
    public readonly stderr?: string
  ) {
    super(message);
    this.name = 'GitError';
  }
}

/**
 * Service for securely executing Git CLI commands with argument arrays,
 * timeouts, and optional cancellation.
 */
export class GitRunner {
  private readonly defaultTimeoutMs = 60000;

  /**
   * Run a Git command with explicit argument array to prevent shell injection.
   *
   * @param args Command line arguments passed directly to the git executable.
   * @param cwd Working directory of the target repository.
   * @param token Optional VS Code cancellation token.
   * @param timeoutMs Execution timeout in milliseconds.
   */
  public async execute(
    args: string[],
    cwd: string,
    token?: vscode.CancellationToken,
    timeoutMs: number = this.defaultTimeoutMs
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (token?.isCancellationRequested) {
        return reject(new GitError('Operation was cancelled before execution.', 'git', args));
      }

      const options: ExecFileOptions = {
        cwd,
        timeout: timeoutMs,
        maxBuffer: 10 * 1024 * 1024, // 10 MB buffer
        env: {
          ...process.env,
          LC_ALL: 'C', // Normalize output across languages
          GIT_TERMINAL_PROMPT: '0' // Prevent hanging on interactive credential prompts
        }
      };

      const child = execFile('git', args, options, (error, stdout, stderr) => {
        if (disposableToken) {
          disposableToken.dispose();
        }

        const stdoutStr = String(stdout || '').trim();
        const stderrStr = String(stderr || '').trim();

        if (error) {
          const errMsg = stderrStr || stdoutStr || error.message;
          const exitCode = typeof error.code === 'number' ? error.code : undefined;
          return reject(new GitError(errMsg, 'git', args, exitCode, stderrStr));
        }

        resolve(stdoutStr);
      });

      let disposableToken: vscode.Disposable | undefined;
      if (token) {
        disposableToken = token.onCancellationRequested(() => {
          try {
            child.kill('SIGTERM');
          } catch {
            // Process may already have terminated
          }
          reject(new GitError('Operation was cancelled by user.', 'git', args));
        });
      }
    });
  }
}

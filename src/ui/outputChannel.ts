import * as vscode from 'vscode';

export interface IOutputLogger {
  log(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string, error?: unknown): void;
  command(args: string[], cwd: string): void;
  show(): void;
  dispose(): void;
}

export class OutputChannelLogger implements IOutputLogger, vscode.Disposable {
  private readonly channel: vscode.OutputChannel;

  constructor() {
    this.channel = vscode.window.createOutputChannel('Git Smart Sync');
  }

  public show(): void {
    this.channel.show(true);
  }

  public log(message: string): void {
    const time = new Date().toISOString().replace('T', ' ').substring(0, 19);
    this.channel.appendLine(`[${time}] ${message}`);
  }

  public info(message: string): void {
    this.log(`[INFO]  ${message}`);
  }

  public warn(message: string): void {
    this.log(`[WARN]  ${message}`);
  }

  public error(message: string, error?: unknown): void {
    this.log(`[ERROR] ${message}`);
    if (error instanceof Error) {
      if (error.stack) {
        this.channel.appendLine(`        Stack: ${error.stack}`);
      }
    } else if (error) {
      this.channel.appendLine(`        Details: ${String(error)}`);
    }
  }

  public command(args: string[], cwd: string): void {
    this.log(`[GIT]   git ${args.join(' ')} (cwd: ${cwd})`);
  }

  public dispose(): void {
    this.channel.dispose();
  }
}

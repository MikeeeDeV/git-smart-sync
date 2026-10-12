import * as vscode from 'vscode';
import { BranchPreset, SyncStrategy } from '../types';

export class ConfigurationService {
  private readonly section = 'gitSmartSync';

  public get defaultRemote(): string {
    return vscode.workspace.getConfiguration(this.section).get<string>('defaultRemote', 'origin');
  }

  public get showStatusBar(): boolean {
    return vscode.workspace.getConfiguration(this.section).get<boolean>('showStatusBar', true);
  }

  public get syncStrategy(): SyncStrategy {
    return vscode.workspace.getConfiguration(this.section).get<SyncStrategy>('syncStrategy', 'fast-forward');
  }

  public get autoPullBeforePush(): boolean {
    return vscode.workspace.getConfiguration(this.section).get<boolean>('autoPullBeforePush', false);
  }

  public get confirmBeforeSync(): boolean {
    return vscode.workspace.getConfiguration(this.section).get<boolean>('confirmBeforeSync', false);
  }

  /**
   * Retrieve configured branch presets.
   */
  public getPresets(): BranchPreset[] {
    const raw = vscode.workspace.getConfiguration(this.section).get<Record<string, string[]>>('presets', {
      release: ['main', 'production'],
      development: ['dev', 'staging']
    });

    return Object.entries(raw).map(([key, branches]) => ({
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      branches: Array.isArray(branches) ? branches : []
    }));
  }

  /**
   * Save a new branch preset to user/workspace settings.
   */
  public async addPreset(name: string, branches: string[]): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.section);
    const existing = config.get<Record<string, string[]>>('presets', {});
    const updated = { ...existing, [name]: branches };
    await config.update('presets', updated, vscode.ConfigurationTarget.Global);
  }

  /**
   * Remove a branch preset group from configuration.
   */
  public async deletePreset(name: string): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.section);
    const existing = { ...config.get<Record<string, string[]>>('presets', {}) };
    delete existing[name];
    await config.update('presets', existing, vscode.ConfigurationTarget.Global);
  }

  /**
   * Update the default Git remote in configuration.
   */
  public async setDefaultRemote(remote: string): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.section);
    await config.update('defaultRemote', remote, vscode.ConfigurationTarget.Global);
  }
}

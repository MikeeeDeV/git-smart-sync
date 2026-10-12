import * as vscode from 'vscode';
import { RepositoryService } from '../git/repositoryService';
import { BranchService } from '../git/branchService';
import { ConfigurationService } from '../config/configurationService';
import { BranchInfo } from '../types';

export type TreeItemType = 'category' | 'branch' | 'preset';

export class BranchTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly itemType: TreeItemType,
    public readonly branchInfo?: BranchInfo,
    public readonly presetBranches?: string[],
    public readonly presetId?: string,
    customContextValue?: string
  ) {
    super(label, collapsibleState);

    if (itemType === 'branch' && branchInfo) {
      this.contextValue = 'branchItem';
      this.description = branchInfo.isCurrent ? '(Active)' : branchInfo.isRemote ? '(Remote)' : '';
      this.tooltip = branchInfo.lastCommitSubject || branchInfo.name;
      this.iconPath = branchInfo.isCurrent
        ? new vscode.ThemeIcon('star-full', new vscode.ThemeColor('gitDecoration.addedResourceForeground'))
        : branchInfo.isRemote
        ? new vscode.ThemeIcon('cloud')
        : new vscode.ThemeIcon('git-branch');
    } else if (itemType === 'preset') {
      this.contextValue = 'presetItem';
      this.iconPath = new vscode.ThemeIcon('layers');
      this.tooltip = `Branches: [${presetBranches?.join(', ')}]`;
    } else {
      this.contextValue = customContextValue || 'categoryItem';
    }
  }
}

export class BranchTreeProvider implements vscode.TreeDataProvider<BranchTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<BranchTreeItem | undefined | null | void> =
    new vscode.EventEmitter<BranchTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<BranchTreeItem | undefined | null | void> =
    this._onDidChangeTreeData.event;

  constructor(
    private readonly repoService: RepositoryService,
    private readonly branchService: BranchService,
    private readonly configService: ConfigurationService
  ) {}

  public refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  public getTreeItem(element: BranchTreeItem): vscode.TreeItem {
    return element;
  }

  public async getChildren(element?: BranchTreeItem): Promise<BranchTreeItem[]> {
    const repo = await this.repoService.getActiveRepository();
    if (!repo) {
      return [];
    }

    if (!element) {
      const remote = this.configService.defaultRemote;
      // Top-level categories
      return [
        new BranchTreeItem('Configured Presets', vscode.TreeItemCollapsibleState.Expanded, 'category', undefined, undefined, undefined, 'presetsCategory'),
        new BranchTreeItem('Local Branches', vscode.TreeItemCollapsibleState.Expanded, 'category', undefined, undefined, undefined, 'localCategory'),
        new BranchTreeItem(`Remote Branches (${remote})`, vscode.TreeItemCollapsibleState.Collapsed, 'category', undefined, undefined, undefined, 'remoteCategory')
      ];
    }

    if (element.label === 'Configured Presets') {
      const presets = this.configService.getPresets();
      return presets.map(
        p =>
          new BranchTreeItem(
            `${p.name} (${p.branches.length})`,
            vscode.TreeItemCollapsibleState.None,
            'preset',
            undefined,
            p.branches,
            p.id
          )
      );
    }

    if (element.label === 'Local Branches') {
      const local = await this.branchService.getLocalBranches(repo.rootPath, repo.currentBranch);
      return local.map(
        b => new BranchTreeItem(b.name, vscode.TreeItemCollapsibleState.None, 'branch', b)
      );
    }

    if (element.label?.startsWith('Remote Branches')) {
      const remote = this.configService.defaultRemote;
      const remoteBranches = await this.branchService.getRemoteBranches(repo.rootPath, remote);
      return remoteBranches.map(
        b => new BranchTreeItem(b.name, vscode.TreeItemCollapsibleState.None, 'branch', b)
      );
    }

    return [];
  }
}

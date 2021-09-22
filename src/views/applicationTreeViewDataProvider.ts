import { ExtensionContext, ExtensionMode } from 'vscode';
import { FileTypes } from '../fileTypes';
import { EditorCommands } from '../commands';
import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { HelmRelease } from '../kubernetes/helmRelease';
import { Kustomize } from '../kubernetes/kustomize';
import { ResourceTypes } from '../kubernetes/kubernetesTypes';
import { TreeViewDataProvider } from './treeViewDataProvider';
import { TreeViewItemContext } from './treeViewItemContext';
import { TreeViewItemLabels } from './treeViewItemLabels';
import { ApplicationTreeViewItem } from './applicationNode';

/**
 * Defines Applications data provider for loading Kustomizations
 * and Helm Releases in GitOps Depoloyments tree view.
 */
export class ApplicationTreeViewDataProvider extends TreeViewDataProvider {
	constructor(private extensionContext: ExtensionContext) {
		super();
	}

	/**
   * Creates Application tree view items for the currently selected kubernetes cluster.
   * @returns Application tree view items to display.
   */
  async buildTree(): Promise<ApplicationTreeViewItem[]> {
		const treeItems: ApplicationTreeViewItem[] = [];

		// load application kustomizations
    const kustomizations = await kubernetesTools.getKustomizations();
    if (kustomizations) {
			for (const kustomizeApplication of kustomizations.items) {
				treeItems.push(new KustomizationTreeViewItem(kustomizeApplication));
			}
    }

		// load application helm releases
		const helmReleases = await kubernetesTools.getHelmReleases();
		if (helmReleases) {
			for (const helmRelease of helmReleases.items) {
				treeItems.push(new HelmReleaseTreeViewItem(helmRelease));
			}
		}
    return treeItems;
  }
}

/**
 * Defines Kustomization tree view item for display in GitOps Application tree view.
 */
export class KustomizationTreeViewItem extends ApplicationTreeViewItem {

	/**
	 * All of the kubernetes resource fetched data.
	 */
	resource: Kustomize;

	constructor(kustomization: Kustomize) {
		super({
			label: `${TreeViewItemLabels.Kustomization}: ${kustomization.metadata?.name}`,
		});

		this.resource = kustomization;

		// set context type value for kustomization commands
		this.contextValue = TreeViewItemContext.Kustomization;

		// show markdown tooltip
		this.tooltip = this.getMarkdown(kustomization);

		// set resource Uri to open kustomization document in editor
		this.resourceUri = kubernetesTools.getResourceUri(
			kustomization.metadata?.namespace,
			`${ResourceTypes.Kustomization}/${kustomization.metadata?.name}`,
			FileTypes.Yaml);

		// set open resource in editor command
		this.command = {
			command: EditorCommands.OpenResource,
			arguments: [this.resourceUri],
			title: 'View Resource',
		};
	}
}

/**
 * Defines Helm release tree view item for display in GitOps Applications tree view.
 */
export class HelmReleaseTreeViewItem extends ApplicationTreeViewItem {

	/**
	 * All of the kubernetes resource fetched data.
	 */
	resource: HelmRelease;

	constructor(helmRelease: HelmRelease) {
		super({
			label: `${TreeViewItemLabels.HelmRelease}: ${helmRelease.metadata?.name}`,
		});

		this.resource = helmRelease;

		// set context type value for helm release commands
		this.contextValue = TreeViewItemContext.HelmRelease;

		// show markdown tooltip
		this.tooltip = this.getMarkdown(helmRelease);

		// set resource Uri to open helm release config document in editor
		this.resourceUri = kubernetesTools.getResourceUri(
			helmRelease.metadata?.namespace,
			`${ResourceTypes.HelmRelease}/${helmRelease.metadata?.name}`,
			FileTypes.Yaml);

		// set open resource in editor command
		this.command = {
			command: EditorCommands.OpenResource,
			arguments: [this.resourceUri],
			title: 'View Resource',
		};

	}
}
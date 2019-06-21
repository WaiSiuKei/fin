import { IConfiguration } from '../common';
import { IViewLayout, IViewModel } from '../viewModel/viewModel';

export class ViewContext {

	public readonly configuration: IConfiguration;
	public readonly model: IViewModel;
	public readonly viewLayout: IViewLayout;


	constructor(
		configuration: IConfiguration,
		model: IViewModel,
	) {
		this.configuration = configuration;
		this.model = model;
		this.viewLayout = model.viewLayout;
	}
}

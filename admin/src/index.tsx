import { prefixPluginTranslations } from '@strapi/helper-plugin';

import pluginPkg from '../../package.json';
import Initializer from './components/Initializer';
import PluginIcon from './components/PluginIcon';
import pluginId from './pluginId';

const { name } = pluginPkg.strapi;

export default {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	register(app: any) {
		app.addMenuLink({
			to: `/plugins/${pluginId}`,
			icon: PluginIcon,
			intlLabel: {
				id: `${pluginId}.plugin.name`,
				defaultMessage: name,
			},
			Component: async () => {
				const component = await import(
					/* webpackChunkName: "[request]" */ './pages/App'
				);

				return component;
			},
			permissions: [
				// Uncomment to set the permissions of the plugin here
				// {
				//   action: '', // the action name should be plugin::plugin-name.actionType
				//   subject: null,
				// },
			],
		});
		const plugin = {
			id: pluginId,
			initializer: Initializer,
			isReady: false,
			name,
		};

		app.registerPlugin(plugin);
	},

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	bootstrap(app: any) {},

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	async registerTrads(app: any) {
		const { locales } = app;

		const importedTrads = await Promise.all(
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			(locales as any[]).map((locale) => {
				return import(`./translations/${locale}.json`)
					.then(({ default: data }) => {
						return {
							data: prefixPluginTranslations(data, pluginId),
							locale,
						};
					})
					.catch(() => {
						return {
							data: {},
							locale,
						};
					});
			}),
		);

		return Promise.resolve(importedTrads);
	},
};

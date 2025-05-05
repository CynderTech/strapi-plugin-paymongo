import type { Strapi } from '@strapi/strapi';

export default ({ strapi }: { strapi: Strapi }) => ({
	index(ctx) {
		ctx.body = strapi
			.plugin('paymongo')
			.service('myService')
			.getWelcomeMessage();
	},
});

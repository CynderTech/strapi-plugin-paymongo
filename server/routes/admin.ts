/**
 *  PayMongo Admin routes
 */

export default [
	{
		method: 'GET',
		path: '/settings',
		handler: 'paymongo.getSettings',
		config: {
			policies: [],
			auth: false,
		},
	},
	{
		method: 'POST',
		path: '/settings',
		handler: 'paymongo.setSettings',
		config: {
			policies: [],
			auth: false,
		},
	},
];

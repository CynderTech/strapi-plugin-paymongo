import paymongoAdminRoutes from './admin';
import paymongoServerRoutes from './server';

export default {
	'paymongo-admin': {
		type: 'admin',
		routes: [...paymongoAdminRoutes],
	},
	paymongo: {
		type: 'content-api',
		routes: [...paymongoServerRoutes],
	},
};

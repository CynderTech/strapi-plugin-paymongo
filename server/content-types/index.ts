import paymongoContentTypes from './paymongo';
import lifecycle from './paymongo/lifecycles';

export default {
	paymongo: {
		schema: paymongoContentTypes,
		lifecycles: lifecycle,
	},
};

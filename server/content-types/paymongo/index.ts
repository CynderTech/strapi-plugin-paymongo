export default {
	kind: 'collectionType',
	collectionName: 'paymongo',
	info: {
		singularName: 'paymongo',
		pluralName: 'paymongos',
		displayName: 'PayMongo Payment',
	},
	options: {
		draftAndPublish: false,
		comment: '',
	},
	attributes: {
		paymentId: {
			type: 'string',
		},
		type: {
			type: 'enumeration',
			enum: ['gcash', 'grab_pay', 'cc'],
		},
		paymentIntentId: {
			type: 'string',
		},
		sourceId: {
			type: 'string',
		},
		rawResponse: {
			type: 'json',
		},
		status: {
			type: 'enumeration',
			enum: ['pending', 'success', 'failed'],
			default: 'pending',
		},
		verificationToken: {
			type: 'string',
		},
	},
};

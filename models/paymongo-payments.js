/* eslint-disable no-param-reassign */
const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('1234567890ABCDEF', 15);

module.exports = {
	lifecycles: {
		beforeCreate: async (data) => {
			data.paymentId = nanoid();
			data.verificationToken = nanoid();
		},
	},
};

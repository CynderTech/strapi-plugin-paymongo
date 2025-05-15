import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890ABCDEF', 15);

const lifecycles = {
	async beforeCreate(event) {
		event.params.data.paymentId = nanoid();
		event.params.data.verificationToken = nanoid();
	},
};

export default lifecycles;

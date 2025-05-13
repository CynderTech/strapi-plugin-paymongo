import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890ABCDEF', 15);

const lifecycle = {
	async beforeCreate(event) {
		let { data } = event.params;

		data = {
			...data,
			paymentId: nanoid(),
			verificationToken: nanoid(),
		};
	},
};

export default lifecycle;

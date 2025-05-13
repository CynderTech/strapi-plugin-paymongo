import type PayMongo from 'paymongo-client';

export interface PayMongoSettings {
	test_mode: boolean;
	company_name: string | null;
	live_public_key: string | null;
	live_secret_key: string | null;
	test_public_key: string | null;
	test_secret_key: string | null;
	webhook_secret_key: string | null;
	use_3ds_redirect: boolean;
	checkout_success_url: string | null;
	checkout_failure_url: string | null;
	checkout_success_url_mobile: string | null;
	checkout_failure_url_mobile: string | null;
}

export interface StrapiStore {
	get(options: { key: string }): Promise<PayMongoSettings>;
	set(options: { key: string; value: PayMongoSettings }): Promise<void>;
	delete(options: { key: string }): Promise<void>;
}

export type PayMongoClient = InstanceType<typeof PayMongo>;
export type CreatePaymentIntent = PayMongoClient['createPaymentIntent'];
export type AttachPaymentIntent = PayMongoClient['attachPaymentIntent'];
export type CreatePaymentSource = PayMongoClient['createSource'];
export type CreatePayment = PayMongoClient['createPayment'];

export interface PayMongoKeys {
	public_key: string;
	secret_key: string;
}

export interface AttachPaymentIntentPayload {
	id: string;
	payment_method: string;
	client_key?: string;
	return_url?: string;
}

type BillingInformation = {
	address: {
		city: string;
		country: string;
		line1: string;
		line2?: string;
		postal_code: string;
		state: string;
	};
	email: string;
	name: string;
	phone: string;
};

export interface CreatePaymentSourcePayload {
	amount: number;
	billing: BillingInformation;
	type: string;
}

export interface CreatePaymentPayload {
	amount: number;
	sourceId: string;
	paymentId: string;
	statementDescriptor?: string | null;
}

export interface VerifyWebhookPayload {
	header: string;
	payload: string;
}

export interface HandleWebhookAttributes {
	type: string;
	data: {
		id: string;
		attributes: {
			amount: number;
			status: string;
			type: string;
		};
	};
}

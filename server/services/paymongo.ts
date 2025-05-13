/**
 *  PayMongo service
 */

import PayMongo from 'paymongo-client';

import { getClient, getDefaultDescription, getStoreSettings } from '../utils';

import {
	PAYMENT_INTENT_STATUSES,
	PAYMONGO_PAYMENT_STATUSES,
} from '../constants';
import type {
	AttachPaymentIntent,
	AttachPaymentIntentPayload,
	CreatePayment,
	CreatePaymentIntent,
	CreatePaymentPayload,
	CreatePaymentSource,
	CreatePaymentSourcePayload,
	HandleWebhookAttributes,
	VerifyWebhookPayload,
} from '../types';

export default ({ strapi }) => ({
	async createPaymentIntent(
		amount: number,
		statementDescriptor: string,
	): Promise<CreatePaymentIntent> {
		const newPayment = await strapi.entityService.create(
			'plugin::paymongo.paymongo',
			{
				data: {
					type: 'cc',
				},
			},
		);

		const { id, paymentId } = newPayment;

		const client = await getClient(strapi);

		const { body } = await client.createPaymentIntent({
			amount,
			paymentId: paymentId,
			statement_descriptor: statementDescriptor,
			description: `${await getDefaultDescription(strapi, paymentId)}${
				statementDescriptor ? ` - ${statementDescriptor}` : ''
			}`,
		});

		const {
			data: { id: paymentIntentId },
		} = body;

		strapi.entityService.update('plugin::paymongo.paymongo', id, {
			data: {
				paymentIntentId,
			},
		});

		return body;
	},

	async attachPaymentIntent(
		payload: AttachPaymentIntentPayload,
	): Promise<AttachPaymentIntent> {
		const client = await getClient(strapi);

		const settings = await getStoreSettings(strapi);

		const { use_3ds_redirect: use3dsRedirect } = settings;

		let overrides = {};

		if (use3dsRedirect && typeof payload.return_url === 'undefined') {
			const { url: serverUrl } = strapi.config.server;

			const [payment] = await strapi.entityService.findMany(
				'plugin::paymongo.paymongo',
				{
					filters: {
						paymentIntentId: payload.id,
					},
				},
			);

			if (payment && Object.keys(payment).length > 0) {
				overrides = {
					redirect: `${serverUrl || 'http://localhost:1337'}/paymongo/process-3ds-redirect?pid=
                        ${payment.paymentId}&vt=${payment.verificationToken}`,
				};
			}
		}

		const { body } = await client.attachPaymentIntent({
			...payload,
			...overrides,
		});

		const {
			data: { attributes },
		} = body;
		const { status } = attributes;

		if (status === 'succeeded') {
			const [payment] = await strapi.entityService.findMany(
				'plugin::paymongo.paymongo',
				{
					filters: {
						paymentIntentId: payload.id,
					},
				},
			);

			strapi.entityService.update(
				'plugin::paymongo.paymongo',
				payment.id,
				{
					data: {
						status: 'success',
					},
				},
			);
		}

		return body;
	},

	async createSource({
		amount,
		billing,
		type,
	}: CreatePaymentSourcePayload): Promise<CreatePaymentSource> {
		const settings = await getStoreSettings(strapi);

		const {
			checkout_failure_url: checkoutFailureUrl,
			checkout_success_url: checkoutSuccessUrl,
		} = settings;

		const client = await getClient(strapi);

		const { body } = await client.createSource({
			amount,
			type,
			redirect: {
				failed: checkoutFailureUrl,
				success: checkoutSuccessUrl,
			},
			billing,
		});

		const {
			data: { id: sourceId },
		} = body;

		await strapi.entityService.create('plugin::paymongo.paymongo', {
			data: {
				type,
				sourceId,
			},
		});

		return body;
	},

	async createPayment({
		amount,
		sourceId,
		paymentId,
		statementDescriptor = null,
	}: CreatePaymentPayload): Promise<CreatePayment> {
		const client = await getClient(strapi);

		const { body } = await client.createPayment({
			amount,
			description: `${await getDefaultDescription(strapi, paymentId)}${
				statementDescriptor ? ` - ${statementDescriptor}` : ''
			}`,
			source: {
				id: sourceId,
				type: 'source',
			},
		});

		return body;
	},

	async retrievePaymentIntent(
		intentId: string,
	): Promise<CreatePaymentIntent> {
		const client = await getClient(strapi);

		const { body } = await client.retrievePaymentIntent(intentId);

		return body;
	},

	async checkIfPaymentExist(pid: string, vt: string): Promise<boolean> {
		const [payment] = await strapi.entityService.findMany(
			'plugin::paymongo.paymongo',
			{
				filters: {
					verificationToken: vt,
					paymentId: pid,
				},
			},
		);

		return !payment || Object.keys(payment).length === 0;
	},

	async process3dsRedirect(pid: string, vt: string): Promise<string | null> {
		const [payment] = await strapi.entityService.findMany(
			'plugin::paymongo.paymongo',
			{
				filters: {
					verificationToken: vt,
					paymentId: pid,
				},
			},
		);

		const result = await strapi
			.service('plugin::paymongo.paymongo')
			.retrievePaymentIntent(payment.paymentIntentId);

		const {
			data: { attributes },
		} = result;
		const { status } = attributes;

		const settings = await getStoreSettings(strapi);

		const {
			checkout_failure_url: checkoutFailureUrl,
			checkout_success_url: checkoutSuccessUrl,
		} = settings;

		if (status === PAYMENT_INTENT_STATUSES.SUCCEEDED) {
			strapi.entityService.update(
				'plugin::paymongo.paymongo',
				payment.id,
				{
					data: {
						status: 'success',
						rawResponse: result,
					},
				},
			);

			return checkoutSuccessUrl;
		}

		if (status === PAYMENT_INTENT_STATUSES.AWAITING_PAYMENT_METHOD) {
			await strapi.entityService.update(
				'plugin::paymongo.paymongo',
				payment.id,
				{
					data: {
						status: 'fail',
						rawResponse: result,
					},
				},
			);

			return checkoutFailureUrl;
		}

		if (status === PAYMENT_INTENT_STATUSES.PROCESSING) {
			// Need CRON job or schedule job for this OR wait for the webhook for payments
			return null;
		}

		if (status === PAYMENT_INTENT_STATUSES.AWAITING_NEXT_ACTION) {
			// This will probably never happen, but in case that it did, do something
			return null;
		}

		return null;
	},

	async verifyWebhook({
		header,
		payload,
	}: VerifyWebhookPayload): Promise<boolean> {
		const paymongoHeader = header['paymongo-signature'];

		if (!paymongoHeader) return false;

		const settings = await getStoreSettings(strapi);

		const { test_mode: testMode, webhook_secret_key: webhookSecretKey } =
			settings;

		return PayMongo.verifyWebhook(
			webhookSecretKey,
			paymongoHeader,
			payload,
			testMode ? 'test' : 'live',
		);
	},

	async handleWebhook(attributes: HandleWebhookAttributes): Promise<void> {
		const {
			data: {
				attributes: { amount, status, type: sourceType },
				id: sourceId,
			},
		} = attributes;

		if (status === 'chargeable') {
			const [payment] = await strapi.entityService.findMany(
				'plugin::paymongo.paymongo',
				{
					filters: {
						sourceId,
						type: sourceType,
					},
				},
			);

			if (!payment || Object.keys(payment).length === 0) {
				strapi.log.error('No matching payment found');
				return;
			}

			const { id, paymentId } = payment;

			const result = await strapi
				.service('plugin::paymongo.paymongo')
				.createPayment({
					amount,
					sourceId,
					paymentId,
				});

			const {
				data: {
					attributes: { status: paymongoPaymentStatus },
				},
			} = result;

			let paymentStatus: string;

			switch (paymongoPaymentStatus) {
				case PAYMONGO_PAYMENT_STATUSES.PAID:
					paymentStatus = 'success';
					break;
				case PAYMONGO_PAYMENT_STATUSES.FAILED:
					paymentStatus = 'fail';
					break;
				case PAYMONGO_PAYMENT_STATUSES.PENDING:
					paymentStatus = 'pending';
					break;
				default:
					paymentStatus = 'pending';
			}

			await strapi.entityService.update('plugin::paymongo.paymongo', id, {
				data: {
					status: paymentStatus,
					rawResponse: result,
				},
			});
		}
	},
});

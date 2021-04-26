/*
 *
 * HomePage
 *
 */

import React, { memo, useEffect, useState } from 'react';
import { Button, Label, Padded, Text, Toggle } from '@buffetjs/core';
import { Header, Inputs } from '@buffetjs/custom';
import { request } from 'strapi-helper-plugin';
import { SETTINGS } from '../../constants';

const HomePage = () => {
	const [loading, setLoading] = useState(false);
	const [payload, setPayload] = useState(SETTINGS);

	useEffect(() => {
		const querySettings = async () => {
			const settings = await request('/paymongo/settings');

			setLoading(false);

			setPayload(settings);
		};

		setLoading(true);

		querySettings();
	}, []);

	const handleChange = (key, value) => {
		setPayload({
			...payload,
			[key]: value,
		});
	};

	const handleSubmit = async () => {
		try {
			const { ok } = await request('/paymongo/settings', {
				method: 'POST',
				body: payload,
			});

			if (ok) {
				strapi.notification.success('Successfully saved changes');
			}
		} catch (err) {
			/** Need better error handling */
			strapi.notification.error(
				'Something went wrong. Contact administrator.',
			);
		}
	};

	const renderFields = () => {
		return (
			<div className="row mb-5">
				<div className="col-12">
					<Padded bottom>
						<Text fontSize="lg" fontWeight="bold">
							API Keys
						</Text>
					</Padded>
				</div>
				<div className="col-12">
					<Inputs
						label="Company Name"
						onChange={(e) => {
							handleChange('company_name', e.target.value);
						}}
						type="text"
						value={payload.company_name}
					/>
				</div>
				<div className="col-12">
					<Inputs
						label="Live Public Key"
						onChange={(e) => {
							handleChange('live_public_key', e.target.value);
						}}
						type="text"
						value={payload.live_public_key}
					/>
				</div>
				<div className="col-12">
					<Inputs
						label="Live Secret Key"
						onChange={(e) => {
							handleChange('live_secret_key', e.target.value);
						}}
						type="text"
						value={payload.live_secret_key}
					/>
				</div>
				<div className="col-12">
					<Inputs
						label="Test Public Key"
						onChange={(e) => {
							handleChange('test_public_key', e.target.value);
						}}
						type="text"
						value={payload.test_public_key}
					/>
				</div>
				<div className="col-12">
					<Inputs
						label="Test Secret Key"
						onChange={(e) => {
							handleChange('test_secret_key', e.target.value);
						}}
						type="text"
						value={payload.test_secret_key}
					/>
				</div>
				<div className="col-12 mb-5">
					<Label htmlFor="3dsRedirect">Use Redirect for 3DS</Label>
					<Toggle
						name="3dsRedirect"
						onChange={(e) => {
							handleChange('use_3ds_redirect', e.target.value);
						}}
						value={payload.use_3ds_redirect}
					/>
				</div>
				<div className="col-12">
					<Padded bottom>
						<Text fontSize="lg" fontWeight="bold">
							Webhook Settings
						</Text>
					</Padded>
				</div>
				<div className="col-12">
					<Inputs
						label="Webhook Signing Secret"
						onChange={(e) => {
							handleChange('webhook_secret_key', e.target.value);
						}}
						type="text"
						value={payload.webhook_secret_key}
					/>
				</div>
				<div className="col-12">
					<Padded bottom>
						<Text fontSize="lg" fontWeight="bold">
							Redirect URLs
						</Text>
					</Padded>
				</div>
				<div className="col-12">
					<Inputs
						label="Checkout Success (Web)"
						onChange={(e) => {
							handleChange(
								'checkout_success_url',
								e.target.value,
							);
						}}
						type="text"
						value={payload.checkout_success_url}
					/>
				</div>
				<div className="col-12">
					<Inputs
						label="Checkout Failure (Web)"
						onChange={(e) => {
							handleChange(
								'checkout_failure_url',
								e.target.value,
							);
						}}
						type="text"
						value={payload.checkout_failure_url}
					/>
				</div>
				<div className="col-12">
					<Inputs
						label="Checkout Success (Mobile)"
						onChange={(e) => {
							handleChange(
								'checkout_success_url_mobile',
								e.target.value,
							);
						}}
						type="text"
						value={payload.checkout_success_url_mobile}
					/>
				</div>
				<div className="col-12">
					<Inputs
						label="Checkout Failure (Mobile)"
						onChange={(e) => {
							handleChange(
								'checkout_failure_url_mobile',
								e.target.value,
							);
						}}
						type="text"
						value={payload.checkout_failure_url_mobile}
					/>
				</div>
			</div>
		);
	};

	return (
		<div className="container-fluid" style={{ padding: '18px 30px' }}>
			<div className="row">
				<div className="col-6">
					<Header
						content="Configure PayMongo settings"
						isLoading={loading}
						title={{ label: 'PayMongo' }}
					/>
				</div>
				<div className="col-6 row justify-content-end">
					<Button
						color="primary"
						label="Save Changes"
						onClick={handleSubmit}
					/>
				</div>
			</div>
			<div className="row">
				<div className="col-md-12 col-lg-9">
					<div
						style={{
							padding: '22px',
							background: '#ffffff',
							borderRadius: '2px',
							boxShadow: '0 2px 4px #e3e9f3',
						}}
					>
						<div className="row mb-5">
							<div className="col-6">
								<Label htmlFor="isTestMode">Test Mode</Label>
								<Toggle
									name="isTestMode"
									onChange={(e) =>
										handleChange(
											'test_mode',
											e.target.value,
										)
									}
									value={payload.test_mode}
								/>
							</div>
						</div>
						{!loading && renderFields()}
					</div>
				</div>
			</div>
		</div>
	);
};

export default memo(HomePage);

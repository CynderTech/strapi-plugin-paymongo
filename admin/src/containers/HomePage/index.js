/*
 *
 * HomePage
 *
 */

import React, { memo, useEffect, useState } from 'react';
import { Button, Label, Padded, Text, Toggle } from '@buffetjs/core';
import { Header, Inputs } from '@buffetjs/custom';
import { request } from 'strapi-helper-plugin';

const HomePage = () => {
	const [loading, setLoading] = useState(false);
	const [testMode, setTestMode] = useState(true);
	const [livePublicKey, setLivePublicKey] = useState('');
	const [liveSecretKey, setLiveSecretKey] = useState('');
	const [testPublicKey, setTestPublicKey] = useState('');
	const [testSecretKey, setTestSecretKey] = useState('');
	const [webhookSecretKey, setWebhookSecretKey] = useState('');
	const [checkoutSuccessUrl, setCheckoutSuccessUrl] = useState('');
	const [checkoutFailureUrl, setCheckoutFailureUrl] = useState('');

	useEffect(() => {
		const querySettings = async () => {
			const {
				checkout_failure_url: retrievedCheckoutFailureUrl,
				checkout_success_url: retrievedCheckoutSuccessUrl,
				live_public_key: retrievedLivePublicKey,
				live_secret_key: retrievedLiveSecretKey,
				test_mode: retrievedTestMode,
				test_public_key: retrievedTestPublicKey,
				test_secret_key: retrievedTestSecretKey,
				webhook_secret_key: retrievedWebhookSecretKey,
			} = await request('/paymongo/settings');

			setLoading(false);

			setLivePublicKey(retrievedLivePublicKey || '');
			setLiveSecretKey(retrievedLiveSecretKey || '');
			setTestPublicKey(retrievedTestPublicKey || '');
			setTestSecretKey(retrievedTestSecretKey || '');
			setTestMode(retrievedTestMode);
			setWebhookSecretKey(retrievedWebhookSecretKey || '');
			setCheckoutSuccessUrl(retrievedCheckoutSuccessUrl || '');
			setCheckoutFailureUrl(retrievedCheckoutFailureUrl || '');
		};

		setLoading(true);

		querySettings();
	}, []);

	const handleSubmit = async () => {
		const payload = {
			live_public_key: livePublicKey,
			live_secret_key: liveSecretKey,
			test_mode: testMode,
			test_public_key: testPublicKey,
			test_secret_key: testSecretKey,
			webhook_secret_key: webhookSecretKey,
			checkout_failure_url: checkoutFailureUrl,
			checkout_success_url: checkoutSuccessUrl,
		};

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
			strapi.notification.error('Something went wrong. Contact administrator.');
		}
	};

	const renderFields = () => {
		return (
			<div class="row mb-5">
				<div className="col-12">
					<Padded bottom>
						<Text fontSize="lg" fontWeight="bold">
							API Keys
						</Text>
					</Padded>
				</div>
				<div className="col-12">
					<Inputs
						label="Live Public Key"
						onChange={(e) => setLivePublicKey(e.target.value)}
						type="text"
						value={livePublicKey}
					/>
				</div>
				<div className="col-12">
					<Inputs
						label="Live Secret Key"
						onChange={(e) => setLiveSecretKey(e.target.value)}
						type="text"
						value={liveSecretKey}
					/>
				</div>
				<div className="col-12">
					<Inputs
						label="Test Public Key"
						onChange={(e) => setTestPublicKey(e.target.value)}
						type="text"
						value={testPublicKey}
					/>
				</div>
				<div className="col-12">
					<Inputs
						label="Test Secret Key"
						onChange={(e) => setTestSecretKey(e.target.value)}
						type="text"
						value={testSecretKey}
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
						onChange={(e) => setWebhookSecretKey(e.target.value)}
						type="text"
						value={webhookSecretKey}
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
						label="Checkout Success"
						onChange={(e) => setCheckoutSuccessUrl(e.target.value)}
						type="text"
						value={checkoutSuccessUrl}
					/>
				</div>
				<div className="col-12">
					<Inputs
						label="Checkout Failure"
						onChange={(e) => setCheckoutFailureUrl(e.target.value)}
						type="text"
						value={checkoutFailureUrl}
					/>
				</div>
			</div>
		);
	};

	return (
		<div className="container-fluid" style={{ padding: '18px 30px' }}>
			<div class="row">
				<div className="col-6">
					<Header
						title={{ label: 'Paymongo' }}
						content="Configure Paymongo settings"
						isLoading={loading}
					/>
				</div>
				<div className="col-6 row justify-content-end">
					<Button color="primary" label="Save Changes" onClick={handleSubmit} />
				</div>
			</div>
			<div class="row">
				<div className="col-md-12 col-lg-9">
					<div
						style={{
							padding: '22px',
							background: '#ffffff',
							borderRadius: '2px',
							boxShadow: '0 2px 4px #e3e9f3',
						}}>
						<div class="row mb-5">
							<div className="col-6">
								<Label htmlFor="isTestMode">Test Mode</Label>
								<Toggle
									name="isTestMode"
									onChange={(e) => setTestMode(e.target.value)}
									value={testMode}
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

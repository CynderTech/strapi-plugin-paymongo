import {
	Box,
	Button,
	Card,
	ContentLayout,
	HeaderLayout,
	Main,
	Stack,
	TextInput,
	ToggleInput,
	Typography,
} from '@strapi/design-system';
import { useNotification } from '@strapi/helper-plugin';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

import { SETTINGS } from '../../constants';

const HomePage = () => {
	const [loading, setLoading] = useState(false);
	const [payload, setPayload] = useState(SETTINGS);
	const toggleNotification = useNotification();

	useEffect(() => {
		const querySettings = async () => {
			const { data: settings } = await axios.get('/paymongo/settings');

			setLoading(false);
			setPayload(settings);
		};

		setLoading(true);
		querySettings();
	}, []);

	const handleChange = (key: string, value: string | boolean) => {
		setPayload({
			...payload,
			[key]: value,
		});
	};

	const handleSubmit = async () => {
		try {
			const finalPayload = {
				...payload,
				checkout_success_url: payload.checkout_success_url
					? encodeURIComponent(payload.checkout_success_url)
					: null,
				checkout_failure_url: payload.checkout_failure_url
					? encodeURIComponent(payload.checkout_failure_url)
					: null,
				checkout_success_url_mobile: payload.checkout_success_url_mobile
					? encodeURIComponent(payload.checkout_success_url_mobile)
					: null,
				checkout_failure_url_mobile: payload.checkout_failure_url_mobile
					? encodeURIComponent(payload.checkout_failure_url_mobile)
					: null,
			};
			const { data: ok } = await axios.post(
				'/paymongo/settings',
				finalPayload,
			);

			if (ok) {
				toggleNotification({
					type: 'success',
					message: 'Successfully saved changes',
				});
			}
		} catch (error) {
			/** Need better error handling */
			toggleNotification({
				type: 'warning',
				message: 'Something went wrong. Contact administrator.',
			});
		}
	};

	const renderForm = () => {
		return (
			<Stack size={8}>
				<Box>
					<Stack size={2}>
						<Typography variant="beta">Test Mode</Typography>
						<ToggleInput
							onLabel="True"
							offLabel="False"
							checked={payload.test_mode}
							onChange={(
								e: React.ChangeEvent<HTMLInputElement>,
							) => handleChange('test_mode', !payload.test_mode)}
						/>
					</Stack>
				</Box>
				<Box>
					<Stack size={4}>
						<Typography variant="beta">API Keys</Typography>
						<TextInput
							label="Company Name"
							name="companyName"
							onChange={(
								e: React.ChangeEvent<HTMLInputElement>,
							) => handleChange('company_name', e.target.value)}
							value={payload.company_name}
						/>
						<TextInput
							label="Live Public Key"
							name="livePublicKey"
							onChange={(
								e: React.ChangeEvent<HTMLInputElement>,
							) =>
								handleChange('live_public_key', e.target.value)
							}
							value={payload.live_public_key}
						/>
						<TextInput
							label="Live Secret Key"
							name="liveSecretKey"
							onChange={(
								e: React.ChangeEvent<HTMLInputElement>,
							) =>
								handleChange('live_secret_key', e.target.value)
							}
							value={payload.live_secret_key}
						/>
						<TextInput
							label="Test Public Key"
							name="testPublicKey"
							onChange={(
								e: React.ChangeEvent<HTMLInputElement>,
							) =>
								handleChange('test_public_key', e.target.value)
							}
							value={payload.test_public_key}
						/>
						<TextInput
							label="Test Secret Key"
							name="testSecretKey"
							onChange={(
								e: React.ChangeEvent<HTMLInputElement>,
							) =>
								handleChange('test_secret_key', e.target.value)
							}
							value={payload.test_secret_key}
						/>
						<ToggleInput
							label="Use redirect for 3DS"
							onLabel="True"
							offLabel="False"
							checked={payload.use_3ds_redirect}
							onChange={(
								e: React.ChangeEvent<HTMLInputElement>,
							) =>
								handleChange(
									'use_3ds_redirect',
									!payload.use_3ds_redirect,
								)
							}
						/>
					</Stack>
				</Box>
				<Box>
					<Stack size={4}>
						<Typography variant="beta">Webhook Settings</Typography>
						<TextInput
							label="Webhook Signing Secret"
							name="webhookSigningSecret"
							onChange={(
								e: React.ChangeEvent<HTMLInputElement>,
							) =>
								handleChange(
									'webhook_secret_key',
									e.target.value,
								)
							}
							value={payload.webhook_secret_key}
						/>
					</Stack>
				</Box>
				<Box>
					<Stack size={4}>
						<Typography variant="beta">Redirect URLs</Typography>
						<TextInput
							label="Checkout Success (Web)"
							name="checkoutSuccessWeb"
							onChange={(
								e: React.ChangeEvent<HTMLInputElement>,
							) =>
								handleChange(
									'checkout_success_url',
									e.target.value,
								)
							}
							value={payload.checkout_success_url}
						/>
						<TextInput
							label="Checkout Failure (Web)"
							name="checkoutFailureWeb"
							onChange={(
								e: React.ChangeEvent<HTMLInputElement>,
							) =>
								handleChange(
									'checkout_failure_url',
									e.target.value,
								)
							}
							value={payload.checkout_failure_url}
						/>
						<TextInput
							label="Checkout Success (Mobile)"
							name="checkoutSuccessMobile"
							onChange={(
								e: React.ChangeEvent<HTMLInputElement>,
							) =>
								handleChange(
									'checkout_success_url_mobile',
									e.target.value,
								)
							}
							value={payload.checkout_success_url_mobile}
						/>
						<TextInput
							label="Checkout Failure (Mobile)"
							name="checkoutFailureMobile"
							onChange={(
								e: React.ChangeEvent<HTMLInputElement>,
							) =>
								handleChange(
									'checkout_failure_url_mobile',
									e.target.value,
								)
							}
							value={payload.checkout_failure_url_mobile}
						/>
					</Stack>
				</Box>
			</Stack>
		);
	};

	return (
		<Main>
			<HeaderLayout
				primaryAction={<Button onClick={handleSubmit}>Save</Button>}
				title="PayMongo Settings"
				subtitle="Configure PayMongo settings"
			/>
			<ContentLayout paddingRight="500px">
				<Card
					padding="2rem"
					hasRadius={true}
					paddingBottom="3rem"
					marginBottom="3rem"
					maxWidth="800px"
				>
					{!loading && renderForm()}
				</Card>
			</ContentLayout>
		</Main>
	);
};

export default React.memo(HomePage);

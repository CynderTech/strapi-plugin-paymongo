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
import { isEmpty } from 'lodash';
import React, { useState } from 'react';

const HomePage = () => {
	const [token, setToken] = useState('');

	return (
		<Main>
			<HeaderLayout
				primaryAction={<Button disabled={isEmpty(token)}>Save</Button>}
				title="PayMongo Settings"
				subtitle="Configure PayMongo settings"
			/>
			<ContentLayout paddingRight='500px'>
				<Card background='white'
					padding='2rem'
					hasRadius={true}
					paddingBottom="3rem"
					marginBottom='3rem'
					maxWidth='800px'
				>
					<Stack size={8}>
						<Box>
							<Stack size={2}>
								<Typography variant='beta'>Test Mode</Typography>
								<ToggleInput
									// label='Test Mode'
									onLabel="True"
									offLabel="False"
								// checked={checked}
								// onChange={handleChange}
								/>
							</Stack>
						</Box>
						<Box>
							<Stack size={4}>
								<Typography variant='beta'>API Keys</Typography>
								<TextInput
									label="Company Name"
									name="companyName"
									// biome-ignore lint/suspicious/noExplicitAny: <explanation>
									onChange={(e: any) => setToken(e.target.value)}
									value={token}
								/>
								<TextInput
									label="Live Public Key"
									name="livePublicKey"
									// biome-ignore lint/suspicious/noExplicitAny: <explanation>
									onChange={(e: any) => setToken(e.target.value)}
									value={token}
								/>
								<TextInput
									label="Live Secret Key"
									name="liveSecretKey"
									// biome-ignore lint/suspicious/noExplicitAny: <explanation>
									onChange={(e: any) => setToken(e.target.value)}
									value={token}
								/>
								<TextInput
									label="Test Public Key"
									name="testPublicKey"
									// biome-ignore lint/suspicious/noExplicitAny: <explanation>
									onChange={(e: any) => setToken(e.target.value)}
									value={token}
								/>
								<TextInput
									label="Test Secret Key"
									name="testSecretKey"
									// biome-ignore lint/suspicious/noExplicitAny: <explanation>
									onChange={(e: any) => setToken(e.target.value)}
									value={token}
								/>
								<ToggleInput
									label='Use redirect for 3DS'
									onLabel="True"
									offLabel="False"
								// checked={checked}
								// onChange={handleChange}
								/>
							</Stack>
						</Box>
						<Box>
							<Stack size={4}>
								<Typography variant='beta'>Webhook Settings</Typography>
								<TextInput
									label="Webhook Signing Secret"
									name="webhookSigningSecret"
									// biome-ignore lint/suspicious/noExplicitAny: <explanation>
									onChange={(e: any) => setToken(e.target.value)}
									value={token}
								/>
							</Stack>
						</Box>
						<Box>
							<Stack size={4}>
								<Typography variant='beta'>Redirect URLs</Typography>
								<TextInput
									label="Checkout Success (Web)"
									name="checkoutSuccessWeb"
									// biome-ignore lint/suspicious/noExplicitAny: <explanation>
									onChange={(e: any) => setToken(e.target.value)}
									value={token}
								/>
								<TextInput
									label="Checkout Failure (Web)"
									name="checkoutFailureWeb"
									// biome-ignore lint/suspicious/noExplicitAny: <explanation>
									onChange={(e: any) => setToken(e.target.value)}
									value={token}
								/>
								<TextInput
									label="Checkout Success (Mobile)"
									name="checkoutSuccessMobile"
									// biome-ignore lint/suspicious/noExplicitAny: <explanation>
									onChange={(e: any) => setToken(e.target.value)}
									value={token}
								/>
								<TextInput
									label="Checkout Failure (Mobile)"
									name="checkoutFailureMobile"
									// biome-ignore lint/suspicious/noExplicitAny: <explanation>
									onChange={(e: any) => setToken(e.target.value)}
									value={token}
								/>
							</Stack>
						</Box>
					</Stack>
				</Card>
			</ContentLayout>
		</Main >
	);
};

export default HomePage;

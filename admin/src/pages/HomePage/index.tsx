import {
	Box,
	Button,
	ContentLayout,
	GridLayout,
	HeaderLayout,
	Main,
	TextInput,
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
			/>
			<ContentLayout>
				<GridLayout>
					<Box>
						<TextInput
							label="Sandbox Public Key"
							name="sandboxPublicKey"
							// biome-ignore lint/suspicious/noExplicitAny: <explanation>
							onChange={(e: any) => setToken(e.target.value)}
							value={token}
						/>
					</Box>
					<Box>
						<TextInput
							label="Sandbox Secret Key"
							name="sandboxSecretKey"
							// biome-ignore lint/suspicious/noExplicitAny: <explanation>
							onChange={(e: any) => setToken(e.target.value)}
							value={token}
						/>
					</Box>
					<Box>
						<TextInput
							label="Live Public Key"
							name="livePublicKey"
							// biome-ignore lint/suspicious/noExplicitAny: <explanation>
							onChange={(e: any) => setToken(e.target.value)}
							value={token}
						/>
					</Box>
					<Box>
						<TextInput
							label="Live Secret Key"
							name="liveSecretKey"
							// biome-ignore lint/suspicious/noExplicitAny: <explanation>
							onChange={(e: any) => setToken(e.target.value)}
							value={token}
						/>
					</Box>
				</GridLayout>
			</ContentLayout>
		</Main>
	);
};

export default HomePage;

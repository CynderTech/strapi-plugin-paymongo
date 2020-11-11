/*
 *
 * HomePage
 *
 */

import React, { memo, useState } from 'react';
import { Button, Label, Toggle } from '@buffetjs/core';
import { Header, Inputs } from '@buffetjs/custom';

const HomePage = () => {
	const [loading, setLoading] = useState(false);
	const [testMode, setTestMode] = useState(true);
	const [publicKey, setPublicKey] = useState('');
	const [secretKey, setSecretKey] = useState('');

	const renderTestKeys = () => {
		const prefix = testMode ? 'Test' : 'Live';

		return (
			<div class="row mb-5">
				<div className="col-12">
					<Inputs
						label={`${prefix} Public Key`}
						onChange={(e) => setPublicKey(e.target.value)}
						type="text"
						value={publicKey}
					/>
				</div>
				<div className="col-12">
					<Inputs
						label={`${prefix} Secret Key`}
						onChange={(e) => setSecretKey(e.target.value)}
						type="text"
						value={secretKey}
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
					<Button color="primary" label="Save Changes" />
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
						{!loading && renderTestKeys()}
					</div>
				</div>
			</div>
		</div>
	);
};

export default memo(HomePage);

import { AnErrorOccurred } from '@strapi/helper-plugin';
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import pluginId from '../../pluginId';
// eslint-disable-next-line import/extensions
import HomePage from '../HomePage';

const App = () => (
	<div>
		<Switch>
			<Route path={`/plugins/${pluginId}`} component={HomePage} exact />
			<Route component={AnErrorOccurred} />
		</Switch>
	</div>
);

export default App;

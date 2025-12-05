/* eslint-disable react/react-in-jsx-scope */
/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import { Provider } from 'react-redux';
import { store } from './src/state/store';
import 'react-native-get-random-values';
import GlobalLoader from "./src/components/GlobalLoader";
// import Ionicons from 'react-native-vector-icons/Ionicons';
import { extendTheme, NativeBaseProvider } from 'native-base';
import myTheme from './src/theme';

const theme = extendTheme( myTheme );

// Ionicons.loadFont();
const RNApp = () => (
	<NativeBaseProvider theme={theme}>
	<Provider store={store}>
		<App />
	 <GlobalLoader />
	</Provider>
	</NativeBaseProvider>
);

AppRegistry.registerComponent(appName, () => RNApp);

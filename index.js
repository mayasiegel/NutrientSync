/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App'; // ✅ points to your new app logic
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);

/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

import messaging from '@react-native-firebase/messaging';

// 앱 꺼져있을 때 알림 리시버
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log(remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);

import messaging from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  AndroidChannel,
} from '@notifee/react-native';

// utils
import { storeData } from './AsyncStorage';

export const requestNotificationPermission = async () => {
  return new Promise<boolean>(async resolve => {
    const authStatus = await messaging().requestPermission();
    const enable =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    resolve(enable);
  });
};

export const getFCMToken = async () => {
  return new Promise<string>(async resolve => {
    await requestNotificationPermission().then(async status => {
      if (status) {
        return await messaging()
          .getToken()
          .then(token => {
            storeData('fcm', { token });
            resolve(token);
          });
      }
    });
  });
};

export const displayNotification = async (
  channel: AndroidChannel,
  notification: { title: string | undefined; body: string | undefined },
): Promise<void> => {
  await requestNotificationPermission().then(async () => {
    const channelId = await notifee.createChannel({
      ...channel,
      importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
      ...notification,
      android: {
        channelId,
      },
    });
  });
};

export const getInitialNotification = async () => {
  return new Promise<void>(async resolve => {
    await messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          resolve();
        }
      });
  });
};

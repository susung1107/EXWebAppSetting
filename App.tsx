import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import WebView from 'react-native-webview';
import SplashScreen from 'react-native-splash-screen';

// utils
import {
  // getFCMToken,
  displayNotification,
  getFCMToken,
  getUniqueId,
  URL,
  COLOR,
} from 'utils';

const App = () => {
  const webViewRef = useRef(null) as any;

  const [source, setSource] = useState({
    uri: URL,
  });
  const [isFirstPage, setIsFirstPage] = useState(true);
  const [refresh, setRefresh] = useState(true);
  const [deviceData, setDeviceData] = useState({
    fcm: '',
    uuid: '',
  });

  const handleNavigationStateChange = (navState: { url: string }) => {
    // 첫 페이지 판독
    setIsFirstPage(navState.url === URL);
  };

  useEffect(() => {
    // 토큰 가져오기
    getFCMToken().then(token => {
      console.log(token);
      setDeviceData(prev => ({ ...prev, fcm: token }));
    });

    // 디바이스 값 가져오기
    getUniqueId().then(uniqueId => {
      setDeviceData(prev => ({ ...prev, uuid: uniqueId }));
    });

    // 스플래시 이미지 숨김
    setTimeout(() => {
      SplashScreen.hide();
    }, 1500);

    // 알림 수신
    const onMessage = messaging().onMessage(async remoteMessage => {
      const channel = {
        id: 'default',
        name: 'default',
      };
      const notification = {
        title: remoteMessage?.notification?.title,
        body: remoteMessage?.notification?.body,
      };
      await displayNotification(channel, notification);
    });

    // 앱이 꺼져있을 때 알림을 누름
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          if (remoteMessage?.data?.uri !== undefined && refresh) {
            setTimeout(() => {
              const uri = remoteMessage?.data?.uri;
              webViewRef.current.injectJavaScript(
                `window.location.href = '${uri}'; true;`,
              );
              setRefresh(false);
            }, 2000);
          }
        }
      });

    // 앱이 최소화 되어 있는데 알림을 눌러서 활성화 했을 때
    const onNotificationOpenedApp = messaging().onNotificationOpenedApp(
      async remoteMessage => {
        // console.log('앱이 최소화 되어 있는데 알림을 눌러서 활성화함');
        const uri = remoteMessage?.data?.uri;
        webViewRef.current.injectJavaScript(
          `window.location.href = '${uri}'; true;`,
        );
      },
    );

    // 사용자가 앱을 이용중 일 떄
    const onForegroundEvent = notifee.onForegroundEvent(async observer => {
      const { type, detail } = observer;
      if (type === EventType.PRESS) {
        // console.log('앱이 켜져있는데 알림을 누름', detail);
        const uri = detail.notification?.data?.uri;
        webViewRef.current.injectJavaScript(
          `window.location.href = '${uri}'; true;`,
        );
      }
    });

    // 뒤로가기 구현
    const handleHardwareBackPress = () => {
      if (isFirstPage) {
        return false;
      }

      webViewRef.current.goBack();
      return true;
    };
    BackHandler.addEventListener('hardwareBackPress', handleHardwareBackPress);

    // 언마운트 시
    return () => {
      onNotificationOpenedApp();
      onForegroundEvent();
      onMessage();
      BackHandler.removeEventListener(
        'hardwareBackPress',
        handleHardwareBackPress,
      );
    };
  }, [isFirstPage, refresh]);

  const webViewProps = {
    userAgent:
      'Mozilla/5.0 (Linux; An33qdroid 10; Android SDK built for x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.185 Mobile Safari/537.36',
    originWhitelist: ['*'],
    allowsInlineMediaPlayback: true,
    startInLoadingState: true,
    scalesPageToFit: true,
    javaScriptEnabled: true,
    source: {
      uri: `${source.uri}?fcm=${deviceData.fcm}&uuid=${deviceData.uuid}`,
    },
  };

  return (
    <>
      <SafeAreaView style={[styles.scrollView]} />
      <WebView
        {...webViewProps}
        ref={webViewRef}
        onNavigationStateChange={handleNavigationStateChange}
      />
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: COLOR,
  },
});

export default App;

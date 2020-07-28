import messaging from '@react-native-firebase/messaging';
import {Platform} from 'react-native';

class FCMService {
  register = (onRegister, onNotification, onOpenNotification) => {
    this.checkPermission(onRegister);
    this.createNotificationListeners(
      onRegister,
      onNotification,
      onOpenNotification,
    );
  };

  registerAppWithFCM = async () => {
    if (Platform.OS === 'ios') {
      await messaging().registerDeviceForRemoteMessages();
      await messaging().setAutoInitEnabled(true);
    }
  };

  checkPermission = (onRegister) => {
    messaging()
      .hasPermission()
      .then((enabled) => {
        if (enabled) {
          // User has permissions
          this.getToken(onRegister);
        } else {
          this.requestPermission(onRegister);
        }
      })
      .catch((error) => {
        console.log('error', error);
      });
  };

  getToken = (onRegister) => {
    messaging()
      .getToken()
      .then((fcmToken) => {
        if (fcmToken) {
          onRegister(fcmToken);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  requestPermission = (onRegister) => {
    messaging()
      .requestPermission()
      .then(() => {
        this.getToken(onRegister);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  deleteToken = () => {
    messaging()
      .deleteToken()
      .catch((error) => console.log(error));
  };

  createNotificationListeners = (
    onRegister,
    onNotification,
    onOpenNotification,
  ) => {
    messaging().onNotificationOpenedApp((remoteMsg) => {
      if (remoteMsg) {
        const notification = remoteMsg.notification;
        onOpenNotification(notification);
      }
    });

    messaging()
      .getInitialNotification()
      .then((remoteMsg) => {
        if (remoteMsg) {
          const notification = remoteMsg.notification;
          onOpenNotification(notification);
        }
      });

    // Foreground state messages
    this.messageListener = messaging().onMessage(async (remoteMsg) => {
      if (remoteMsg) {
        let notification = null;
        if (Platform.OS === 'ios') {
          notification = remoteMsg.data.notification;
        } else {
          notification = remoteMsg.notification;
        }
        onNotification(notification);
      }
    });

    // Trigger when have new token
    messaging().onTokenRefresh((fcmToken) => {
      onRegister(fcmToken);
    });
  };

  unRegister = () => {
    this.messageListener();
  };
}

export const fcmService = new FCMService();

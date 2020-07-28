import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {Platform} from 'react-native';

class LocalNotificationService {
  configure = (onOpenNotification) => {
    PushNotification.configure({
      onRegister: function (token) {},
      onNotification: function (notification) {
        if (!notification?.data) {
          return;
        }

        notification.userInteraction = true;
        onOpenNotification(
          Platform.OS === 'ios' ? notification.data.item : notification.data,
        );

        if (Platform.OS === 'ios') {
          // (required) Called when a remote is received or opened, or local notification is opened
          notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: true,
    });
  };

  unRegister = () => {
    this.unRegister();
  };

  showNotification = (id, title, message, data = {}, options = {}) => {
    PushNotification.localNotification({
      ...this.buildAndroidNotification(id, title, message, data, options),
      ...this.buildIOSNotification(id, title, message, data, options),
      title: title || '',
      message: message || '',
      playSound: options.playSound || false,
      soundName: options.soundName || 'default',
      userInteraction: false,
    });
  };

  buildAndroidNotification = (id, title, message, data = {}, options = {}) => ({
    id: id,
    autoCancel: true,
    largeIcon: options.largeIcon || 'ic_launcher',
    smallIcon: options.smallIcon || 'ic_notification',
    bigText: message || '',
    subText: title || '',
    vibrate: options.vibrate || true,
    vibration: options.vibration || 300,
    priority: options.priority || 'high',
    importance: options.importance || 'high',
    data: data,
  });

  buildIOSNotification = (id, title, message, data = {}, options = {}) => ({
    alertAction: options.alertAction || 'view',
    category: options.category || '',
    userInfo: {
      id,
      item: data,
    },
  });

  cancelNotification = () => {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.removeAllDeliveredNotifications();
    } else {
      PushNotification.cancelAllLocalNotifications();
    }
  };
}

export const localNotificationService = new LocalNotificationService();

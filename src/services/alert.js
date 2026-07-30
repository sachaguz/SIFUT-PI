import { Alert as RNAlert, Platform } from 'react-native';

// react-native-web's Alert.alert() is a no-op stub, so every validation
// error, login error and delete-confirmation in the app would silently do
// nothing on web. This falls back to window.alert/confirm there instead.
function alertWeb(title, message, buttons) {
  const text = [title, message].filter(Boolean).join('\n\n');
  const cancelButton = buttons?.find((b) => b.style === 'cancel');
  const confirmButton = buttons?.find((b) => b.style !== 'cancel');

  if (buttons && buttons.length > 1) {
    if (window.confirm(text)) {
      confirmButton?.onPress?.();
    } else {
      cancelButton?.onPress?.();
    }
    return;
  }

  window.alert(text);
  buttons?.[0]?.onPress?.();
}

const Alert = {
  alert: Platform.OS === 'web' ? alertWeb : RNAlert.alert,
};

export default Alert;

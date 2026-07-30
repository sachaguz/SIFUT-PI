import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// expo-secure-store has no web implementation, so on web we fall back to
// localStorage (the web build is only meant for the ADMIN role behind
// HTTPS, so this is an acceptable tradeoff vs. pulling in a separate
// web-crypto-backed storage layer).
const isWeb = Platform.OS === 'web';

async function getItemAsync(key) {
  if (isWeb) return window.localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

async function setItemAsync(key, value) {
  if (isWeb) {
    window.localStorage.setItem(key, value);
    return;
  }
  return SecureStore.setItemAsync(key, value);
}

async function deleteItemAsync(key) {
  if (isWeb) {
    window.localStorage.removeItem(key);
    return;
  }
  return SecureStore.deleteItemAsync(key);
}

export default { getItemAsync, setItemAsync, deleteItemAsync };

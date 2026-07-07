import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function logout() {
  if (navigationRef.isReady()) {
    navigationRef.reset({ index: 0, routes: [{ name: 'Auth', params: { screen: 'Login' } }] });
  }
}

export function loginAs(roleRootName) {
  if (navigationRef.isReady()) {
    navigationRef.reset({ index: 0, routes: [{ name: roleRootName }] });
  }
}

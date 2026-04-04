import { isDemoMode, DEMO_UID } from './useDemoAuth';

export function isDemoUser(currentUser) {
  return (
    isDemoMode() === true ||
    currentUser?.uid === DEMO_UID ||
    currentUser?.isDemo === true
  );
}

import { isDemoMode, DEMO_UID } from './useDemoAuth';

export function isDemoUser(currentUser) {
  return (
    isDemoMode() === true ||
    currentUser?.uid === DEMO_UID ||
    currentUser?.isDemo === true
  );
}

export function getGroqApiKey(currentUser, profileData) {
  if (isDemoUser(currentUser)) {
    return import.meta.env.VITE_DEMO_GROQ_KEY || '';
  }
  if (currentUser) {
    if (profileData?.groqApiKey) return profileData.groqApiKey;
    return localStorage.getItem('groq-api-key') || '';
  }
  return localStorage.getItem('groq_api_key_guest') || '';
}

import Constants from 'expo-constants';
  
const { 
    FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID,
    GOOGLE_IOS_CLIENT_ID 
} = Constants.expoConfig;

export const firebaseConfig = {
apiKey: FIREBASE_API_KEY,
authDomain: FIREBASE_AUTH_DOMAIN,
projectId: FIREBASE_PROJECT_ID,
storageBucket: FIREBASE_STORAGE_BUCKET,
messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
appId: FIREBASE_APP_ID,
};

export const googleAuthConfig = {
// webClientId: GOOGLE_WEB_CLIENT_ID,
// androidClientId: GOOGLE_ANDROID_CLIENT_ID,
iosClientId: GOOGLE_IOS_CLIENT_ID,
};

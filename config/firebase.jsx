import Constants from 'expo-constants';
import firebase from 'firebase/compat/app';

const { 
    FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID,
    GOOGLE_IOS_CLIENT_ID 
} = Constants.expoConfig;

// export const firebaseConfig = {
// apiKey: Constants.expoConfig?.extra?.firebase?.FIREBASE_API_KEY,
// authDomain: Constants.expoConfig?.extra?.firebase?.FIREBASE_AUTH_DOMAIN,
// projectId: Constants.expoConfig?.extra?.firebase?.FIREBASE_PROJECT_ID,
// storageBucket: Constants.expoConfig?.extra?.firebase?.FIREBASE_STORAGE_BUCKET,
// messagingSenderId: Constants.expoConfig?.extra?.firebase?.FIREBASE_MESSAGING_SENDER_ID,
// appId: Constants.expoConfig?.extra?.firebase?.FIREBASE_APP_ID,
// };

export const firebaseConfig = {
    apiKey: "AIzaSyDFTjj_EVjrNYw3jXg41HzqRqFmW8ZxqTE",
    authDomain: "moneylog-firebase.firebaseapp.com",
    projectId: "moneylog-firebase",
    storageBucket: "moneylog-firebase.firebasestorage.app",
    messagingSenderId: "579389584086",
    appId: "1:579389584086:web:36fa4086fbb5c407d60f77"
  };

// export const googleAuthConfig = {
// // webClientId: GOOGLE_WEB_CLIENT_ID, not used
// // androidClientId: GOOGLE_ANDROID_CLIENT_ID, not used
// //iosClientId: GOOGLE_IOS_CLIENT_ID,
// iosClientId: Constants.expoConfig?.extra?.firebase?.GOOGLE_IOS_CLIENT_ID,
// };

export const googleAuthConfig = {
    // webClientId: GOOGLE_WEB_CLIENT_ID, not used
    // androidClientId: GOOGLE_ANDROID_CLIENT_ID, not used
    //iosClientId: GOOGLE_IOS_CLIENT_ID,
    iosClientId: "1089638738424-kg7p2rok7t16i03043secdfqg8svg5b2.apps.googleusercontent.com"
};

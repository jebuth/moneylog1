import Constants from 'expo-constants';

export const firebaseConfig = {
    apiKey: Constants.expoConfig.extra.firebase.apiKey,
    authDomain: Constants.expoConfig.extra.firebase.authDomain,
    projectId: Constants.expoConfig.extra.firebase.projectId,
    storageBucket: Constants.expoConfig.extra.firebase.storageBucket,
    messagingSenderId: Constants.expoConfig.extra.firebase.messagingSenderId,
    appId: Constants.expoConfig.extra.firebase.appId,
};

export const googleAuthConfig = {
    // webClientId: GOOGLE_WEB_CLIENT_ID, not used
    // androidClientId: GOOGLE_ANDROID_CLIENT_ID, not used
    //iosClientId: GOOGLE_IOS_CLIENT_ID,
    iosClientId: Constants.expoConfig.extra.firebase.googleIOSClientId,
};

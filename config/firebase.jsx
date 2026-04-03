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
    iosClientId: Constants.expoConfig.extra.firebase.googleIOSClientId,
    androidClientId: Constants.expoConfig.extra.firebase.googleAndroidClientId,
};

export default {
  expo: {
    name: "Moneylog",
    slug: "moneylog",
    version: "1.0.0",
    // orientation: "portrait",
    // icon: "./assets/images/icon.png",
    // userInterfaceStyle: "light",
    // splash: {
    //   image: "./assets/images/icon.png",
    //   resizeMode: "contain",
    //   backgroundColor: "#5C5CFF"
    // },
    assetBundlePatterns: [
      "**/*"
    ],
    // ios: {
    //   supportsTablet: false,
    //   bundleIdentifier: "com.anonymous.moneylog",
    //   infoPlist: {
    //     ITSAppUsesNonExemptEncryption: false
    //   }
    // },
    // android: {
    //   adaptiveIcon: {
    //     foregroundImage: "./assets/images/adaptive-icon.png",
    //     backgroundColor: "#5C5CFF"
    //   },
    //   package: "com.anonymous.moneylog"
    // },
    web: {
      favicon: "./assets/images/favicon.png"
    },
    // plugins: [
    //   "expo-router"
    // ],
    // scheme: "com.anonymous.moneylog",
    extra: {
      eas: {
        projectId: "78048b3b-4612-409c-840f-f831c93d1c47"
      },
      firebase: {
        FIREBASE_API_KEY: "AIzaSyDFTjj_EVjrNYw3jXg41HzqRqFmW8ZxqTE",
        FIREBASE_AUTH_DOMAIN: "moneylog-firebase.firebaseapp.com",
        FIREBASE_PROJECT_ID: "moneylog-firebase",
        FIREBASE_STORAGE_BUCKET: "moneylog-firebase.firebasestorage.app",
        FIREBASE_MESSAGING_SENDER_ID: "579389584086",
        FIREBASE_APP_ID: "1:579389584086:web:36fa4086fbb5c407d60f77",
        GOOGLE_IOS_CLIENT_ID: "1089638738424-kg7p2rok7t16i03043secdfqg8svg5b2.apps.googleusercontent.com"
      },
    }
  }
};
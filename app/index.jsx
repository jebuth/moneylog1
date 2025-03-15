import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { isAuthenticated, isLoading, currentLog } = useAuth();
  
  // Show loading indicator while checking auth status
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  
  // Not authenticated - go to auth screen
  if (!isAuthenticated) {
    return <Redirect href="/(auth)" />;
  }

  // Authenticated but no currentLog - go to logs list first
  // if (!currentLog) {
  //   return <Redirect href="/(main)/screen2" />;
  // }

  // Authenticated with currentLog - proceed to expense tracker
  //return <Redirect href="/(main)/screen1" />;
}
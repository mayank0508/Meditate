// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import RemindersScreen from './src/screens/RemindersScreen';
import * as Notifications from 'expo-notifications';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state'
]); // confetti refs sometimes warn

Notifications.setNotificationHandler({
  // New API: prefer explicit fields instead of shouldShowAlert (deprecated)
  handleNotification: async () => ({
    shouldShowAlert: true,   // kept for backwards-compat; will map to banner/list on platforms that support them
    shouldShowBanner: true,  // Android/iOS (modern)
    shouldShowList: true,    // iOS notification center list
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Reminders" component={RemindersScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

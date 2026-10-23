import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MathProgressProvider } from './storage/progressStore';
import MenuScreen from './screens/MenuScreen';
import LetterTraceScreen from './screens/LetterTraceScreen';
import ImageMatchScreen from './screens/ImageMatchScreen';
import WordBuildScreen from './screens/WordBuildScreen';
import ClockLearnScreen from './screens/ClockLearnScreen';
import MathHomeScreen from './screens/MathHomeScreen';
import MathActivityScreen from './screens/MathActivityScreen';
import ParentGateScreen from './screens/ParentGateScreen';
import ParentDashboardScreen from './screens/ParentDashboardScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <MathProgressProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Menu"
              screenOptions={{
                headerShown: false,
                orientation: 'landscape',
              }}
            >
              <Stack.Screen name="Menu" component={MenuScreen} />
              <Stack.Screen name="LetterTrace" component={LetterTraceScreen} />
              <Stack.Screen name="ImageMatch" component={ImageMatchScreen} />
              <Stack.Screen name="WordBuild" component={WordBuildScreen} />
              <Stack.Screen
                name="ClockLearn"
                component={ClockLearnScreen}
                options={{ gestureEnabled: false }}
              />
              <Stack.Screen name="MathHome" component={MathHomeScreen} />
              <Stack.Screen
                name="MathActivity"
                component={MathActivityScreen}
                options={{ gestureEnabled: false }}
              />
              <Stack.Screen name="ParentGate" component={ParentGateScreen} />
              <Stack.Screen name="ParentDashboard" component={ParentDashboardScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </MathProgressProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

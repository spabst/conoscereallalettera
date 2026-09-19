import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MenuScreen from './screens/MenuScreen';
import LetterTraceScreen from './screens/LetterTraceScreen';
import ImageMatchScreen from './screens/ImageMatchScreen';
import WordBuildScreen from './screens/WordBuildScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

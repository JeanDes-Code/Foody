import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screen/HomeScreen";
import WelcomeScreen from "../screen/WelcomeScreen";
import RecipeDetailsScreen from "../screen/RecipeDetailsScreen";

const Stack = createNativeStackNavigator();

function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="RecipeDetails" component={RecipeDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigation;

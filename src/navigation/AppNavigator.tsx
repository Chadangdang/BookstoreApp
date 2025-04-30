import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import BookListScreen from '../screens/BookListScreen';
import CartScreen from '../screens/CartScreen';
import HomeScreen from '../screens/HomeScreen';
import BookScreen from '../screens/BookScreen';
import UserScreen from '../screens/UserScreen';
import MyBooksScreen from '../screens/MyBookScreen'; 
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      {/* 👇 Hide header on login/signup for full-screen clean layout */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="MyBooks" 
      component={MyBooksScreen}
      options={{ headerShown: false }} />

      

      {/* 👇 Main Screens */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="BookList" 
      component={BookListScreen}
      options={{ headerShown: false }}
       />
      <Stack.Screen name="Cart" 
      component={CartScreen} 
      options={{ headerShown: false }}
      />
      <Stack.Screen name="Book" 
      component={BookScreen} 
      options={{ headerShown: false }}
      />
      <Stack.Screen
        name="User"
        component={UserScreen}
        options={{ headerShown: false }}
      />
      
    </Stack.Navigator>
  );
}

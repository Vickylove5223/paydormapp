import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParams } from './types';
import { WelcomeScreen } from '@/screens/auth/WelcomeScreen';
import { SignUpScreen } from '@/screens/auth/SignUpScreen';
import { SignInScreen } from '@/screens/auth/SignInScreen';
import { VerifyEmailScreen } from '@/screens/auth/VerifyEmailScreen';
import { PersonalDetailsScreen } from '@/screens/auth/PersonalDetailsScreen';
import { RolePropertyScreen } from '@/screens/auth/RolePropertyScreen';
import { PropertySetupScreen } from '@/screens/auth/PropertySetupScreen';
import { JoinCompoundScreen } from '@/screens/auth/JoinCompoundScreen';
import { ForgotPasswordScreen } from '@/screens/auth/ForgotPasswordScreen';

const Stack = createNativeStackNavigator<AuthStackParams>();

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <Stack.Screen name="PersonalDetails" component={PersonalDetailsScreen} />
      <Stack.Screen name="RoleProperty" component={RolePropertyScreen} />
      <Stack.Screen name="PropertySetup" component={PropertySetupScreen} />
      <Stack.Screen name="JoinCompound" component={JoinCompoundScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

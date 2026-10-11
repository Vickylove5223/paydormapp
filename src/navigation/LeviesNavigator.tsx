import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LeviesStackParams } from './types';
import { LeviesScreen } from '@/screens/main/LeviesScreen';
import { PaymentDetailScreen } from '@/screens/levies/PaymentDetailScreen';

const Stack = createNativeStackNavigator<LeviesStackParams>();

export function LeviesNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LeviesMain" component={LeviesScreen} />
      <Stack.Screen name="PaymentDetail" component={PaymentDetailScreen} />
    </Stack.Navigator>
  );
}

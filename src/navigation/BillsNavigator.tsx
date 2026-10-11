import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BillsStackParams } from './types';
import { BillsScreen } from '@/screens/main/BillsScreen';
import { AddBillScreen } from '@/screens/bills/AddBillScreen';
import { BillDetailScreen } from '@/screens/bills/BillDetailScreen';
import { PaymentDetailScreen } from '@/screens/levies/PaymentDetailScreen';

const Stack = createNativeStackNavigator<BillsStackParams>();

export function BillsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BillsMain" component={BillsScreen} />
      <Stack.Screen name="AddBill" component={AddBillScreen} />
      <Stack.Screen name="BillDetail" component={BillDetailScreen} />
      <Stack.Screen name="PaymentDetail" component={PaymentDetailScreen} />
    </Stack.Navigator>
  );
}

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LeviesStackParams } from './types';
import { LeviesScreen } from '@/screens/main/LeviesScreen';
import { AddBillScreen } from '@/screens/bills/AddBillScreen';
import { BillDetailScreen } from '@/screens/bills/BillDetailScreen';
import { CoPartnerScreen } from '@/screens/me/CoPartnerScreen';
import { ChargesDetailScreen } from '@/screens/levies/ChargesDetailScreen';
import { TransactionHistoryScreen } from '@/screens/levies/TransactionHistoryScreen';
import { ReceiptScreen } from '@/screens/levies/ReceiptScreen';

const Stack = createNativeStackNavigator<LeviesStackParams>();

export function LeviesNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LeviesMain" component={LeviesScreen} />
      <Stack.Screen name="AddBill" component={AddBillScreen as any} />
      <Stack.Screen name="BillDetail" component={BillDetailScreen} />
      <Stack.Screen name="ChargesDetail" component={ChargesDetailScreen} />
      <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
      <Stack.Screen name="Receipt" component={ReceiptScreen} />
      <Stack.Screen name="CoPartner" component={CoPartnerScreen} />
    </Stack.Navigator>
  );
}

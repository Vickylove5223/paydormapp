import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MeStackParams } from './types';
import { MeScreen } from '@/screens/main/MeScreen';
import { ProfileScreen } from '@/screens/me/ProfileScreen';
import { WalletScreen } from '@/screens/me/WalletScreen';
import { CoPartnerScreen } from '@/screens/me/CoPartnerScreen';
import { PropertiesScreen } from '@/screens/me/PropertiesScreen';
import { AddPropertyScreen } from '@/screens/me/AddPropertyScreen';
import { AddHouseholdScreen } from '@/screens/me/AddHouseholdScreen';
import { NotificationsScreen } from '@/screens/me/NotificationsScreen';
import { MyPaymentsScreen } from '@/screens/me/MyPaymentsScreen';
import { GatePassScreen } from '@/screens/me/GatePassScreen';
import { HelpSupportScreen } from '@/screens/me/HelpSupportScreen';
import { SecurityScreen } from '@/screens/me/SecurityScreen';

const Stack = createNativeStackNavigator<MeStackParams>();

export function MeNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MeMain" component={MeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="CoPartner" component={CoPartnerScreen} />
      <Stack.Screen name="Properties" component={PropertiesScreen} />
      <Stack.Screen name="AddProperty" component={AddPropertyScreen} />
      <Stack.Screen name="AddHousehold" component={AddHouseholdScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="MyPayments" component={MyPaymentsScreen} />
      <Stack.Screen name="GatePass" component={GatePassScreen} />
      <Stack.Screen name="GatePassHistory" component={GatePassScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="Security" component={SecurityScreen} />
    </Stack.Navigator>
  );
}

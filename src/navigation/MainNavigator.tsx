import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParams } from './types';
import { HomeNavigator } from './HomeNavigator';
import { BillsNavigator } from './BillsNavigator';
import { LeviesNavigator } from './LeviesNavigator';
import { MeNavigator } from './MeNavigator';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';

const Tab = createBottomTabNavigator<MainTabParams>();

export function MainNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeNavigator} />
      <Tab.Screen name="Bills" component={BillsNavigator} />
      <Tab.Screen name="Levies" component={LeviesNavigator} />
      <Tab.Screen name="Me" component={MeNavigator} />
    </Tab.Navigator>
  );
}

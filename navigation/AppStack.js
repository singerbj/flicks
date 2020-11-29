import * as React from 'react';
import SwipeScreen from '../screens/SwipeScreen';
import PartnerScreen from '../screens/PartnerScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { View } from 'react-native';

const Tab = createBottomTabNavigator();

export default function AppStack() {
    return (
        <>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;
                        if (route.name === 'Swipe') {
                            iconName = 'gesture-swipe';
                        } else if (route.name === 'Partner') {
                            iconName = 'account';
                        } else if (route.name === 'Settings') {
                            iconName = 'settings';
                        }
                        return (
                            <MaterialCommunityIcons name={iconName} size={size} color={color} />
                        );
                    },
                })}
            >
                <Tab.Screen name="Swipe" component={SwipeScreen} />
                <Tab.Screen name="Partner" component={PartnerScreen} />
                <Tab.Screen name="Settings" component={SettingsScreen} />
            </Tab.Navigator>
        </>
    );
}

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import ConcertsScreen from '../screens/ConcertsScreen';
import SportsScreen from '../screens/SportsScreen';
import TheaterScreen from '../screens/TheaterScreen';
import FestivalsScreen from '../screens/FestivalsScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import CheckoutScreen from '../screens/CheckoutScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HomeTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#026cdf', tabBarInactiveTintColor: '#6c6c6c',
        tabBarStyle: { borderTopColor: '#dedede', height: 62 },
        tabBarLabelStyle: { fontWeight: '600', fontSize: 11 },
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Events' }} />
      <Tab.Screen name="Concerts" component={ConcertsScreen} />
      <Tab.Screen name="Sports" component={SportsScreen} />
      <Tab.Screen name="Theater" component={TheaterScreen} />
      <Tab.Screen name="Festivals" component={FestivalsScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="MainTabs" component={HomeTabs} />
        <Stack.Screen name="EventDetail" component={EventDetailScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

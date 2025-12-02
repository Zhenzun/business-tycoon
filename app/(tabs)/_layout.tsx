import { Tabs } from 'expo-router';
import { Home, ShoppingBag, UserCircle, Trophy } from 'lucide-react-native';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f172a', // Slate 900
          borderTopWidth: 1,
          borderTopColor: '#1e293b', // Slate 800
          height: 70, // Sedikit lebih tinggi agar modern
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#3b82f6', // Blue 500
        tabBarInactiveTintColor: '#64748b', // Slate 500
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 10, fontWeight: 'bold' }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Empire',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Acquire',
          tabBarIcon: ({ color }) => <ShoppingBag size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Ranking',
          tabBarIcon: ({ color }) => <Trophy size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'HQ',
          tabBarIcon: ({ color }) => <UserCircle size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
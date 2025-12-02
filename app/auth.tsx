import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import { useGameStore } from '../store/gameStore';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { money } = useGameStore();

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('Error', error.message);
    else {
        // TODO: Di sini kita bisa panggil fungsi loadFromCloud() nanti
        router.replace('/(tabs)');
    }
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
            data: { balance: 0 } // Metadata awal
        } 
    });
    if (error) Alert.alert('Error', error.message);
    else Alert.alert('Success', 'Check your inbox for email verification!');
    setLoading(false);
  }

  return (
    <View className="flex-1 bg-slate-900 justify-center px-6">
      <View className="items-center mb-10">
        <Text className="text-4xl font-extrabold text-blue-500 tracking-tighter">TYCOON<Text className="text-white">IDLE</Text></Text>
        <Text className="text-slate-400 mt-2">Build your empire, secure in the cloud.</Text>
      </View>

      <View className="space-y-4">
        <TextInput
          onChangeText={setEmail}
          value={email}
          placeholder="ceo@business.com"
          placeholderTextColor="#64748b"
          autoCapitalize="none"
          className="bg-slate-800 text-white px-4 py-4 rounded-xl border border-slate-700 text-lg"
        />
        <TextInput
          onChangeText={setPassword}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          placeholderTextColor="#64748b"
          autoCapitalize="none"
          className="bg-slate-800 text-white px-4 py-4 rounded-xl border border-slate-700 text-lg"
        />
      </View>

      <View className="mt-8 space-y-3">
        <TouchableOpacity 
            onPress={signInWithEmail} 
            disabled={loading}
            className="bg-blue-600 py-4 rounded-xl items-center shadow-lg shadow-blue-900/50"
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">LOGIN</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={signUpWithEmail} disabled={loading} className="py-4 items-center">
          <Text className="text-slate-400 font-semibold">Create New Empire</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
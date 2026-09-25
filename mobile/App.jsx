import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import './global.css';

export default function App() {
  return (
   <View className="flex-1 items-center justify-center bg-blue-500">
      <Text className="text-xl font-bold text-white">
        Welcome to Nativewind!
      </Text>
    </View>
  );
}


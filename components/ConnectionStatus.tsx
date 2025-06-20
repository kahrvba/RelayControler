import NetInfo from '@react-native-community/netinfo';
import React from 'react';
import { Text, View } from 'react-native';

export function ConnectionStatus() {
  const [status, setStatus] = React.useState('Checking...');

  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (!state.isConnected) setStatus('Offline');
      else if (state.type === 'wifi') setStatus('WiFi');
      else if (state.type === 'cellular') setStatus('Cellular');
      else setStatus('Online');
    });
    return () => unsubscribe();
  }, []);

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontWeight: 'bold' }}>Connection: {status}</Text>
    </View>
  );
} 
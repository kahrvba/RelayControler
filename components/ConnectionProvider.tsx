import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { supabase } from '../lib/supabase';

interface ConnectionContextType {
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  autoConnect: boolean;
  setAutoConnect: (value: boolean) => void;
  manualConnect: () => Promise<void>;
  refreshConnection: () => Promise<void>;
}

const ConnectionContext = React.createContext<ConnectionContextType | undefined>(undefined);

export const useConnection = () => {
  const context = React.useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
};

interface ConnectionProviderProps {
  children: React.ReactNode;
  userId?: string;
  isUserLoaded?: boolean;
}

export const ConnectionProvider: React.FC<ConnectionProviderProps> = ({ 
  children, 
  userId, 
  isUserLoaded 
}) => {
  const [connectionStatus, setConnectionStatus] = React.useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [autoConnect, setAutoConnectState] = React.useState(true);

  // Load auto-connect preference on app start
  React.useEffect(() => {
    loadAutoConnectPreference();
  }, []);

  // Auto-connect logic
  React.useEffect(() => {
    if (autoConnect && isUserLoaded && userId) {
      handleAutoConnect();
    }
  }, [autoConnect, isUserLoaded, userId]);

  const loadAutoConnectPreference = async () => {
    try {
      const savedAutoConnect = await AsyncStorage.getItem('autoConnect');
      if (savedAutoConnect !== null) {
        setAutoConnectState(JSON.parse(savedAutoConnect));
      }
    } catch (error) {
      console.error('Error loading auto-connect preference:', error);
    }
  };

  const setAutoConnect = async (value: boolean) => {
    setAutoConnectState(value);
    try {
      await AsyncStorage.setItem('autoConnect', JSON.stringify(value));
      
      if (value) {
        // If enabling auto-connect, attempt to connect immediately
        if (isUserLoaded && userId) {
          handleAutoConnect();
        }
      } else {
        // If disabling auto-connect, disconnect
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('Error saving auto-connect preference:', error);
    }
  };

  const handleAutoConnect = async () => {
    if (!isUserLoaded || !userId) return;
    
    setConnectionStatus('connecting');
    
    try {
      // Test connection by attempting to fetch user's project data
      const { data: projectData, error } = await supabase
        .from("projects")
        .select("id, project_name")
        .eq("user_id", userId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Auto-connect failed:', error);
        setConnectionStatus('disconnected');
        return;
      }

      setConnectionStatus('connected');
    } catch (error) {
      console.error('Auto-connect error:', error);
      setConnectionStatus('disconnected');
    }
  };

  const manualConnect = async () => {
    if (!isUserLoaded || !userId) {
      throw new Error("Please sign in to connect.");
    }

    setConnectionStatus('connecting');
    
    try {
      // Test connection by attempting to fetch user's project data
      const { data: projectData, error } = await supabase
        .from("projects")
        .select("id, project_name")
        .eq("user_id", userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setConnectionStatus('connected');
    } catch (error) {
      console.error('Manual connect error:', error);
      setConnectionStatus('disconnected');
      throw error;
    }
  };

  const refreshConnection = async () => {
    if (isUserLoaded && userId) {
      await handleAutoConnect();
    }
  };

  const value: ConnectionContextType = {
    connectionStatus,
    autoConnect,
    setAutoConnect,
    manualConnect,
    refreshConnection,
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
}; 
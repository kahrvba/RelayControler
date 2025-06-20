import "@/global.css";
import { useUser } from "@clerk/clerk-expo";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from "react";
import { Alert, Platform, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useConnection } from "../../components/ConnectionProvider";
import { useTheme } from "../../components/ThemeProvider";
import { supabase } from "../../lib/supabase";

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

interface SettingsItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'toggle' | 'button' | 'info';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function SettingsScreen() {
  const { user, isLoaded } = useUser();
  const { isDarkMode, toggleDarkMode, colors } = useTheme();
  const { connectionStatus, autoConnect, setAutoConnect, manualConnect } = useConnection();
  const [project, setProject] = React.useState<{ id: number; project_name: string } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const handleManualConnect = async () => {
    try {
      await manualConnect();
      Alert.alert("Success", "Successfully connected to Supabase!");
    } catch (error) {
      Alert.alert("Connection Error", "Failed to connect. Please check your internet connection and try again.");
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return colors.accent;
      case 'connecting':
        return '#f59e0b'; // amber
      case 'disconnected':
        return '#ef4444'; // red
      default:
        return colors.textSecondary;
    }
  };

  // Fetch project for this user
  React.useEffect(() => {
    if (!isLoaded || !user) return;
    setLoading(true);
    async function fetchProject() {
      const { data } = await supabase
        .from("projects")
        .select("id, project_name")
        .eq("user_id", user!.id)
        .single();
      setProject(data || null);
      setLoading(false);
    }
    fetchProject();
  }, [isLoaded, user]);

  const handleDeleteProject = () => {
    Alert.alert(
      "Delete Project",
      "Are you sure you want to delete this project? This action cannot be undone and will delete all relays.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            if (!project) return;
            try {
              await supabase.from("relays").delete().eq("project_id", project.id);
              await supabase.from("projects").delete().eq("id", project.id);
              setProject(null);
            } catch (error) {
              console.error('Error deleting project:', error);
            }
          }
        }
      ]
    );
  };

  const handleRenameProject = () => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        "Rename Project",
        "Enter new project name:",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Rename",
            onPress: async (newName) => {
              if (!project || !newName?.trim()) return;
              try {
                const { data } = await supabase
                  .from("projects")
                  .update({ project_name: newName.trim() })
                  .eq("id", project.id)
                  .select("id, project_name")
                  .single();
                setProject(data);
              } catch (error) {
                console.error('Error renaming project:', error);
              }
            }
          }
        ],
        "plain-text",
        project?.project_name || ""
      );
    } else {
      // Fallback for Android and other platforms
      Alert.alert(
        "Rename Project",
        "Rename functionality requires iOS. Please use the web interface to rename your project.",
        [{ text: "OK" }]
      );
    }
  };

  const settingsSections: SettingsSection[] = [
    {
      title: "Project",
      items: [
        {
          id: "project-name",
          title: "Project Name",
          subtitle: project?.project_name || "No project",
          icon: "folder-outline",
          type: "info"
        },
        {
          id: "rename-project",
          title: "Rename Project",
          subtitle: "Change project name",
          icon: "pencil-outline",
          type: "button",
          onPress: handleRenameProject
        },
        {
          id: "delete-project",
          title: "Delete Project",
          subtitle: "Permanently delete project and all relays",
          icon: "delete-outline",
          type: "button",
          onPress: handleDeleteProject
        }
      ]
    },
    {
      title: "Connection",
      items: [
        {
          id: "connection-status",
          title: "Connection Status",
          subtitle: getConnectionStatusText(),
          icon: "wifi",
          type: "info"
        },
        {
          id: "auto-connect",
          title: "Auto Connect",
          subtitle: "Automatically connect on app start",
          icon: "power-plug-outline",
          type: "toggle",
          value: autoConnect,
          onToggle: setAutoConnect
        },
        {
          id: "manual-connect",
          title: "Manual Connect",
          subtitle: "Connect to Supabase now",
          icon: "wifi-refresh",
          type: "button",
          onPress: handleManualConnect
        }
      ]
    },
    {
      title: "Notifications",
      items: [
        {
          id: "notifications",
          title: "Push Notifications",
          subtitle: "Get notified about relay changes",
          icon: "bell-outline",
          type: "toggle",
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled
        }
      ]
    },
    {
      title: "App",
      items: [
        {
          id: "dark-mode",
          title: "Dark Mode",
          subtitle: "Use dark theme",
          icon: "theme-light-dark",
          type: "toggle",
          value: isDarkMode,
          onToggle: toggleDarkMode
        },
        {
          id: "version",
          title: "App Version",
          subtitle: "1.0.0",
          icon: "information-outline",
          type: "info"
        },
        {
          id: "about",
          title: "About",
          subtitle: "Relay Control App",
          icon: "help-circle-outline",
          type: "button",
          onPress: () => Alert.alert("About", "Relay Control App\nVersion 1.0.0\n\nControl your relays with ease.")
        }
      ]
    }
  ];

  const renderSettingsItem = (item: SettingsItem) => (
    <View key={item.id} style={{
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: colors.shadow,
      shadowOpacity: isDarkMode ? 0.3 : 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View style={{
            backgroundColor: isDarkMode ? '#374151' : '#f8fafc',
            borderRadius: 12,
            padding: 10,
            marginRight: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <MaterialCommunityIcons 
              name={item.icon as any} 
              size={20} 
              color={item.id === 'connection-status' ? getConnectionStatusColor() : colors.textSecondary} 
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 2,
            }}>
              {item.title}
            </Text>
            {item.subtitle && (
              <Text style={{
                fontSize: 14,
                color: item.id === 'connection-status' ? getConnectionStatusColor() : colors.textSecondary,
              }}>
                {item.subtitle}
              </Text>
            )}
          </View>
        </View>
        
        {item.type === 'toggle' && (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={item.value ? '#ffffff' : '#ffffff'}
          />
        )}
        
        {item.type === 'button' && (
          <TouchableOpacity
            onPress={item.onPress}
            style={{
              backgroundColor: item.id === 'delete-project' ? '#fee2e2' : (isDarkMode ? '#374151' : '#f3f4f6'),
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderWidth: 1,
              borderColor: item.id === 'delete-project' ? '#fecaca' : colors.border,
            }}
          >
            <Text style={{
              fontSize: 12,
              fontWeight: '600',
              color: item.id === 'delete-project' ? '#ef4444' : colors.textSecondary,
            }}>
              {item.id === 'delete-project' ? 'Delete' : item.id === 'manual-connect' ? 'Connect' : 'Action'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 24,
          paddingVertical: 16,
          backgroundColor: colors.surface,
          shadowColor: colors.shadow,
          shadowOpacity: isDarkMode ? 0.3 : 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          <Text style={{ 
            fontSize: 24, 
            fontWeight: '700', 
            color: colors.text,
            letterSpacing: -0.5
          }}>
            Settings
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: getConnectionStatusColor(),
              shadowColor: getConnectionStatusColor(),
              shadowOpacity: 0.6,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 0 },
            }} />
            <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textSecondary, letterSpacing: 0.25 }}>
              {getConnectionStatusText()}
            </Text>
          </View>
        </View>

        <ScrollView 
          style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {settingsSections.map((section) => (
            <View key={section.title} style={{ marginBottom: 32 }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 16,
                letterSpacing: -0.5
              }}>
                {section.title}
              </Text>
              {section.items.map(renderSettingsItem)}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

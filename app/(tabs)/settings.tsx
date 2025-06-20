import "@/global.css";
import { useUser } from "@clerk/clerk-expo";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from "react";
import { Alert, Modal, Platform, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConnection } from "../../components/ConnectionProvider";
import { useLanguage } from "../../components/LanguageProvider";
import { LanguageSelector } from "../../components/LanguageSelector";
import { useProject } from "../../components/ProjectProvider";
import { useTheme } from "../../components/ThemeProvider";
import { supabase } from "../../lib/supabase";

interface Relay {
  id: number;
  relay_name: string;
  state: number;
}

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
  const { t } = useLanguage();
  const { connectionStatus, autoConnect, setAutoConnect, manualConnect } = useConnection();
  const { project, loading: projectLoading, refreshProject, updateProjectName } = useProject();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = React.useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [relays, setRelays] = React.useState<Relay[]>([]);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = React.useState(false);

  // Fetch relays when project changes
  React.useEffect(() => {
    if (!project) return;
    
    async function fetchRelays() {
      try {
        const { data } = await supabase
          .from("relays")
          .select("id, relay_name, state")
          .eq("project_id", project?.id)
          .order("relay_name");
        setRelays(data || []);
      } catch (error) {
        console.error('Error fetching relays:', error);
        setRelays([]);
      }
    }
    
    fetchRelays();
  }, [project]);

  const handleManualConnect = async () => {
    try {
      await manualConnect();
      Alert.alert(t('alerts.success'), t('connection.connectionSuccess'));
    } catch (error) {
      Alert.alert(t('connection.connectionError'), t('connection.checkInternetConnection'));
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return t('connection.connected');
      case 'connecting':
        return t('connection.connecting');
      case 'disconnected':
        return t('connection.disconnected');
      default:
        return t('common.unknown');
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

  const handleRenameProject = () => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        t('settings.renameProject'),
        t('settings.enterNewProjectName'),
        [
          { text: t('common.cancel'), style: "cancel" },
          { 
            text: t('common.save'),
            onPress: async (newName) => {
              if (!project || !newName?.trim()) return;
              
              // Instantly update the UI
              updateProjectName(newName.trim());
              
              try {
                // Update the database in the background
                await supabase
                  .from("projects")
                  .update({ project_name: newName.trim() })
                  .eq("id", project.id);
                // Refresh to ensure we have the latest data
                await refreshProject();
              } catch (error) {
                console.error('Error renaming project:', error);
                // If there's an error, refresh to revert to the original name
                await refreshProject();
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
        t('settings.renameRequiresIOS'),
        t('settings.renameRequiresIOSMessage'),
        [{ text: t('common.ok') }]
      );
    }
  };

  const handleDeleteRelay = () => {
    if (!relays.length) {
      Alert.alert(t('alerts.error'), t('home.noRelaysToDelete'));
      return;
    }

    setShowDeleteModal(true);
  };

  const confirmDeleteRelay = (relay: Relay) => {
    Alert.alert(
      t('home.confirmDeleteRelay'),
      t('home.deleteRelayMessage', { name: relay.relay_name }),
      [
        { text: t('common.cancel'), style: "cancel" },
        { 
          text: t('common.delete'), 
          style: "destructive",
          onPress: () => deleteRelay(relay)
        }
      ]
    );
  };

  const deleteRelay = async (relay: Relay) => {
    if (!project) {
      Alert.alert(t('alerts.error'), t('alerts.noProjectFound'));
      return;
    }

    try {
      setLoading(true);
      
      // Delete from database
      const { error } = await supabase
        .from("relays")
        .delete()
        .eq("id", relay.id)
        .eq("project_id", project.id);

      if (error) {
        throw error;
      }

      // Send broadcast for relay deletion
      await supabase.channel('realtime:relays').send({
        type: 'broadcast',
        event: 'relay-delete',
        payload: { relay_id: relay.id }
      });

      // Update local state
      setRelays(prevRelays => prevRelays.filter(r => r.id !== relay.id));
      
      Alert.alert(t('alerts.success'), t('home.relayDeleted'));
    } catch (error) {
      console.error('Error deleting relay:', error);
      Alert.alert(t('alerts.error'), t('alerts.tryAgain'));
    } finally {
      setLoading(false);
    }
  };

  const getSignUpMethod = () => {
    if (user?.primaryEmailAddress?.emailAddress) {
      return {
        type: 'email',
        value: user.primaryEmailAddress.emailAddress,
        icon: 'email-outline',
        title: t('settings.email')
      };
    } else if (user?.primaryPhoneNumber?.phoneNumber) {
      return {
        type: 'phone',
        value: user.primaryPhoneNumber.phoneNumber,
        icon: 'phone-outline',
        title: t('settings.phone')
      };
    } else {
      return {
        type: 'unknown',
        value: t('common.unknown'),
        icon: 'account-outline',
        title: t('settings.signUpMethod')
      };
    }
  };

  const signUpMethod = getSignUpMethod();

  const settingsSections: SettingsSection[] = [
    {
      title: t('settings.account'),
      items: [
        {
          id: "signup-method",
          title: signUpMethod.title,
          subtitle: signUpMethod.value,
          icon: signUpMethod.icon,
          type: "info"
        }
      ]
    },
    {
      title: t('settings.project'),
      items: [
        {
          id: "project-name",
          title: t('settings.projectName'),
          subtitle: project?.project_name || t('alerts.noProjectFound'),
          icon: "folder-outline",
          type: "info"
        },
        {
          id: "rename-project",
          title: t('settings.renameProject'),
          subtitle: t('settings.renameProject'),
          icon: "pencil-outline",
          type: "button",
          onPress: handleRenameProject
        }
      ]
    },
    {
      title: t('settings.connection'),
      items: [
        {
          id: "connection-status",
          title: t('settings.connectionStatus'),
          subtitle: getConnectionStatusText(),
          icon: "wifi",
          type: "info"
        },
        {
          id: "auto-connect",
          title: t('settings.autoConnect'),
          subtitle: t('settings.autoConnect'),
          icon: "power-plug-outline",
          type: "toggle",
          value: autoConnect,
          onToggle: setAutoConnect
        },
        {
          id: "manual-connect",
          title: t('settings.manualConnect'),
          subtitle: t('settings.manualConnect'),
          icon: "wifi-refresh",
          type: "button",
          onPress: handleManualConnect
        }
      ]
    },
    {
      title: t('settings.notifications'),
      items: [
        {
          id: "notifications",
          title: t('settings.pushNotifications'),
          subtitle: t('settings.pushNotifications'),
          icon: "bell-outline",
          type: "toggle",
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled
        }
      ]
    },
    {
      title: t('settings.language'),
      items: [
        {
          id: "language",
          title: t('settings.selectLanguage'),
          subtitle: t('settings.selectLanguage'),
          icon: "translate",
          type: "button",
          onPress: () => setShowLanguageSelector(true)
        }
      ]
    },
    {
      title: t('settings.app'),
      items: [
        {
          id: "dark-mode",
          title: t('settings.darkMode'),
          subtitle: t('settings.useDarkTheme'),
          icon: "theme-light-dark",
          type: "toggle",
          value: isDarkMode,
          onToggle: toggleDarkMode
        },
        {
          id: "version",
          title: t('settings.appVersion'),
          subtitle: "1.0.0",
          icon: "information-outline",
          type: "info"
        },
        {
          id: "delete-relay",
          title: t('settings.deleteRelay'),
          subtitle: t('settings.deleteRelaySubtitle', { count: relays.length }),
          icon: "delete-outline",
          type: "button",
          onPress: handleDeleteRelay
        },
        {
          id: "about",
          title: t('settings.about'),
          subtitle: t('settings.aboutSubtitle'),
          icon: "help-circle-outline",
          type: "button",
          onPress: () => Alert.alert(t('settings.about'), t('settings.aboutMessage'))
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
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 }}>
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
            activeOpacity={0.7}
            style={{
              backgroundColor: item.id === 'delete-project' || item.id === 'delete-relay' ? '#fee2e2' : (isDarkMode ? '#374151' : '#f3f4f6'),
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderWidth: 1,
              borderColor: item.id === 'delete-project' || item.id === 'delete-relay' ? '#fecaca' : colors.border,
              minWidth: 70,
              minHeight: 32,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{
              fontSize: 12,
              fontWeight: '600',
              color: item.id === 'delete-project' || item.id === 'delete-relay' ? '#ef4444' : colors.textSecondary,
            }}>
              {item.id === 'delete-project' ? t('common.delete') : 
               item.id === 'delete-relay' ? t('common.delete') :
               item.id === 'manual-connect' ? t('settings.manualConnect') : 
               item.id === 'rename-project' ? t('common.save') : 
               item.id === 'language' ? t('settings.selectLanguage') : t('common.ok')}
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
            {t('settings.title')}
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
          contentContainerStyle={{ paddingBottom: 92 + insets.bottom }}
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

        {/* Custom Delete Relay Modal */}
        <Modal
          visible={showDeleteModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 40,
          }}>
            <View style={{
              backgroundColor: colors.surface,
              borderRadius: 20,
              padding: 24,
              width: '100%',
              maxWidth: 320,
              shadowColor: colors.shadow,
              shadowOpacity: isDarkMode ? 0.3 : 0.2,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 10 },
              elevation: 10,
            }}>
              <Text style={{
                fontSize: 20,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 8,
                textAlign: 'center',
              }}>
                Delete Relay
              </Text>
              
              <Text style={{
                fontSize: 14,
                color: colors.textSecondary,
                marginBottom: 20,
                textAlign: 'center',
              }}>
                Select a relay to delete:
              </Text>
              
              <ScrollView 
                style={{ maxHeight: 200 }}
                showsVerticalScrollIndicator={false}
              >
                {relays.map((relay) => (
                  <TouchableOpacity
                    key={relay.id}
                    onPress={() => {
                      setShowDeleteModal(false);
                      confirmDeleteRelay(relay);
                    }}
                    style={{
                      backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: colors.text,
                      textAlign: 'center',
                    }}>
                      {relay.relay_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                style={{
                  backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: 'center',
                  marginTop: 16,
                }}
              >
                <Text style={{
                  color: colors.text,
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Language Selector Modal */}
        <LanguageSelector 
          visible={showLanguageSelector}
          onClose={() => setShowLanguageSelector(false)}
        />
      </SafeAreaView>
    </View>
  );
}

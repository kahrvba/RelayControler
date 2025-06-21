import { useProject } from '@/components/ProjectProvider';
import "@/global.css";
import { useUser } from "@clerk/clerk-expo";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConnection } from "../../components/ConnectionProvider";
import { useLanguage } from "../../components/LanguageProvider";
import { useTheme } from "../../components/ThemeProvider";
import { supabase } from "../../lib/supabase";

const { width } = Dimensions.get('window');

interface Relay {
  id: number;
  relay_name: string;
  state: number;
}

interface AddRelayItem {
  id: string;
  relay_name: string;
  state: number;
}

type RelayOrAddItem = Relay | AddRelayItem;

export default function App() {
  const { user, isLoaded } = useUser();
  const { isDarkMode, colors } = useTheme();
  const { t } = useLanguage();
  const { connectionStatus } = useConnection();
  const { project, loading: projectLoading, updateProject, refreshProject } = useProject();
  const insets = useSafeAreaInsets();
  const [inputProject, setInputProject] = React.useState("");
  const [relays, setRelays] = React.useState<Relay[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [isAddingRelay, setIsAddingRelay] = React.useState(false);
  const [updating, setUpdating] = React.useState<number | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [showNameModal, setShowNameModal] = React.useState(false);
  const [nameInput, setNameInput] = React.useState("");
  const [nameModalType, setNameModalType] = React.useState<'add' | 'rename'>('add');
  const [relayToRename, setRelayToRename] = React.useState<Relay | null>(null);

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

  React.useEffect(() => {
    if (!project) return;
    setLoading(true);
    let ignore = false;
    async function fetchRelays() {
      const { data } = await supabase
        .from("relays")
        .select("id, relay_name, state")
        .eq("project_id", project!.id)
        .order("relay_name");
      if (!ignore) {
        setRelays(data || []);
        setLoading(false);
      }
    }
    fetchRelays();
    
    // Realtime broadcast listener for instant updates
    const broadcastChannel = supabase
      .channel('realtime:relays')
      .on('broadcast', { event: 'relay-update' }, (payload: any) => {
        const { relay_id, state } = payload.payload;
        setRelays(prevRelays => 
          prevRelays.map(relay => 
            relay.id === relay_id 
              ? { ...relay, state } 
              : relay
          )
        );
      })
      .on('broadcast', { event: 'relay-delete' }, (payload: any) => {
        const { relay_id } = payload.payload;
        setRelays(prevRelays => 
          prevRelays.filter(relay => relay.id !== relay_id)
        );
      })
      .subscribe();

    // Realtime listener for database changes (fallback)
    const dbChannel = supabase
      .channel('relay-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'relays', filter: `project_id=eq.${project.id}` }, () => {
        fetchRelays();
      })
      .subscribe();
      
    return () => {
      ignore = true;
      supabase.removeChannel(broadcastChannel);
      supabase.removeChannel(dbChannel);
    };
  }, [project]);

  const createProject = async () => {
    if (!user || !inputProject.trim()) return;
    setLoading(true);
    const { data } = await supabase
      .from("projects")
      .insert({ user_id: user.id, project_name: inputProject.trim() })
      .select("id, project_name")
      .single();
    if (data) {
      updateProject(data);
    }
    setLoading(false);
  };

  const addRelay = async () => {
    if (!project) return;
    
    console.log('Platform:', Platform.OS); // Debug log
    console.log('addRelay function called'); // Debug log
    
    // Temporarily force modal on both platforms for testing
    console.log('Showing modal for testing'); // Debug log
    setNameModalType('add');
    setNameInput("");
    setShowNameModal(true);
    
    // Comment out the platform-specific code for now
    /*
    if (Platform.OS === 'ios') {
      Alert.prompt(
        "Add New Relay",
        "Enter relay name:",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Add",
            onPress: async (relayName) => {
              if (!relayName?.trim()) return;
              await createRelay(relayName.trim());
            }
          }
        ],
        "plain-text",
        ""
      );
    } else {
      // Android: Show custom modal
      console.log('Showing Android modal'); // Debug log
      setNameModalType('add');
      setNameInput("");
      setShowNameModal(true);
    }
    */
  };

  const handleNameModalSubmit = async () => {
    console.log('Modal submit called with:', nameInput); // Debug log
    if (!nameInput.trim()) return;
    
    if (nameModalType === 'add') {
      console.log('Creating relay with name:', nameInput.trim()); // Debug log
      await createRelay(nameInput.trim());
    } else if (nameModalType === 'rename' && relayToRename) {
      await updateRelayName(relayToRename.id, nameInput.trim());
    }
    
    setShowNameModal(false);
    setNameInput("");
    setRelayToRename(null);
  };

  const handleNameModalCancel = () => {
    console.log('Modal cancelled'); // Debug log
    setShowNameModal(false);
    setNameInput("");
    setRelayToRename(null);
  };

  const createRelay = async (relayName: string) => {
    console.log('createRelay called with:', relayName); // Debug log
    setIsAddingRelay(true);
    
    try {
      // Query the current MAX(id) from relays table for this project
      const { data: maxIdResult, error: maxIdError } = await supabase
        .from("relays")
        .select("id")
        .eq("project_id", project!.id)
        .order("id", { ascending: false })
        .limit(1)
        .single();

      if (maxIdError && maxIdError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error querying max ID:', maxIdError);
        throw maxIdError;
      }

      // Calculate new ID: max + 1, or 1 if table is empty
      const newId = maxIdResult ? maxIdResult.id + 1 : 1;

      console.log('Creating relay with ID:', newId, 'and name:', relayName); // Debug log

      // Insert with custom name
      const { data: newRelay, error: insertError } = await supabase
        .from("relays")
        .insert({
          id: newId,
          project_id: project!.id,
          relay_name: relayName,
          state: 0,
        })
        .select("id, relay_name, state")
        .single();

      if (insertError) {
        console.error('Error inserting new relay:', insertError);
        throw insertError;
      }

      console.log('Relay created successfully:', newRelay); // Debug log

      // Add to local state
      setRelays(prevRelays => [...prevRelays, newRelay]);
      
    } catch (error) {
      console.error('Error adding relay:', error);
    } finally {
      setIsAddingRelay(false);
    }
  };

  const renameRelay = async (relay: Relay) => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        "Rename Relay",
        "Enter new relay name:",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Rename",
            onPress: async (newName) => {
              if (!newName?.trim()) return;
              await updateRelayName(relay.id, newName.trim());
            }
          }
        ],
        "plain-text",
        relay.relay_name
      );
    } else {
      // Android: Show custom modal
      setNameModalType('rename');
      setNameInput(relay.relay_name);
      setRelayToRename(relay);
      setShowNameModal(true);
    }
  };

  const updateRelayName = async (relayId: number, newName: string) => {
    try {
      // Update database
      await supabase
        .from("relays")
        .update({ relay_name: newName })
        .eq("id", relayId);
      
      // Update local state
      setRelays(prevRelays => 
        prevRelays.map(r => 
          r.id === relayId 
            ? { ...r, relay_name: newName } 
            : r
        )
      );
    } catch (error) {
      console.error('Error renaming relay:', error);
    }
  };

  // Send broadcast for relay state update
  const sendRelayBroadcast = async (relay_id: number, state: number) => {
    try {
      await supabase.channel('realtime:relays').send({
        type: 'broadcast',
        event: 'relay-update',
        payload: { relay_id, state }
      });
    } catch (error) {
      console.error('Error sending relay broadcast:', error);
    }
  };

  // Toggle relay state
  const toggleRelay = async (relay: Relay) => {
    setUpdating(relay.id);
    const newState = relay.state === 1 ? 0 : 1;
    
    try {
      // Update database
      await supabase
        .from("relays")
        .update({ state: newState })
        .eq("id", relay.id);
      
      // Broadcast the update for instant UI feedback
      await sendRelayBroadcast(relay.id, newState);
      
      // Update local state immediately for instant feedback
      setRelays(prevRelays => 
        prevRelays.map(r => 
          r.id === relay.id 
            ? { ...r, state: newState } 
            : r
        )
      );
    } catch (error) {
      console.error('Error toggling relay:', error);
    } finally {
      setUpdating(null);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh project data
      await refreshProject();
      
      // Refresh relays data
      if (project) {
        const { data } = await supabase
          .from("relays")
          .select("id, relay_name, state")
          .eq("project_id", project.id)
          .order("relay_name");
        setRelays(data || []);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [project, refreshProject]);

  const renderRelayCard = React.useCallback(({ item }: { item: Relay }) => (
    <TouchableOpacity
      onPress={() => toggleRelay(item)}
      onLongPress={() => renameRelay(item)}
      disabled={updating === item.id}
      style={[
        styles.relayCard,
        {
          width: (width - 72) / 2,
          borderColor: item.state === 1 ? '#06b6d4' : colors.border,
          opacity: updating === item.id ? 0.7 : 1
        }
      ]}
    >
      <Text style={[
        styles.relayTitle,
        { color: item.state === 1 ? '#06b6d4' : colors.text }
      ]}>
        {item.relay_name.toUpperCase()}
      </Text>

      <Text style={[
        styles.relayStatus,
        { color: item.state === 1 ? '#06b6d4' : colors.textSecondary }
      ]}>
        {updating === item.id ? t('common.loading') : (item.state === 1 ? t('home.relayStateOn') : t('home.relayStateOff'))}
      </Text>
    </TouchableOpacity>
  ), [toggleRelay, renameRelay, updating, width, colors.border, colors.text, colors.textSecondary, t]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex: 1, paddingTop: insets.top }}>
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
            {project ? project.project_name : t('home.projectName')}
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

        <View style={{ 
          flex: 1, 
          paddingHorizontal: 24, 
          paddingTop: 24,
          paddingBottom: 92 + insets.bottom, // Account for tab bar height + extra space
        }}>
          {!isLoaded || loading || projectLoading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : project ? (
            <>
              <FlatList
                data={[...relays, { id: 'add-relay', relay_name: 'ADD', state: -1 }] as RelayOrAddItem[]}
                keyExtractor={item => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                contentContainerStyle={{ paddingBottom: 120 }}
                refreshing={refreshing}
                onRefresh={onRefresh}
                renderItem={({ item }) => {
                  if (item.id === 'add-relay') {
                    return (
                      <TouchableOpacity
                        onPress={addRelay}
                        disabled={isAddingRelay}
                        style={{
                          backgroundColor: 'transparent',
                          borderRadius: 24,
                          padding: 20,
                          marginBottom: 16,
                          width: (width - 72) / 2,
                          borderWidth: 2,
                          borderColor: colors.border,
                          borderStyle: 'dashed',
                          opacity: isAddingRelay ? 0.7 : 1,
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: 80,
                        }}
                      >
                        <MaterialCommunityIcons 
                          name="plus" 
                          size={32} 
                          color={colors.textSecondary} 
                        />
                        <Text style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: colors.textSecondary,
                          marginTop: 8,
                          textAlign: 'center'
                        }}>
                          {t('home.addRelay')}
                        </Text>
                      </TouchableOpacity>
                    );
                  }
                  return renderRelayCard({ item: item as Relay });
                }}
                showsVerticalScrollIndicator={false}
              />
            </>
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
              <Text style={{ 
                fontSize: 28, 
                fontWeight: '700', 
                color: colors.text, 
                marginBottom: 8,
                textAlign: 'center',
                letterSpacing: -0.5
              }}>
                {t('home.welcome')}
              </Text>
              <Text style={{ 
                fontSize: 16, 
                color: colors.textSecondary, 
                marginBottom: 32,
                textAlign: 'center',
                lineHeight: 24
              }}>
                {t('home.createFirstProject')}
              </Text>
              
              <TextInput
                placeholder={t('home.enterProjectName')}
                value={inputProject}
                onChangeText={setInputProject}
                style={{ 
                  backgroundColor: isDarkMode ? '#374151' : '#f9fafb', 
                  borderRadius: 16, 
                  padding: 20, 
                  width: '100%', 
                  fontSize: 16, 
                  marginBottom: 24, 
                  borderWidth: 2, 
                  borderColor: colors.border,
                  color: colors.text,
                  fontWeight: '500'
                }}
                placeholderTextColor={colors.textSecondary}
              />
              
              <TouchableOpacity
                onPress={createProject}
                disabled={!inputProject.trim()}
                style={{ 
                  backgroundColor: colors.primary, 
                  borderRadius: 16, 
                  paddingVertical: 18, 
                  paddingHorizontal: 32, 
                  width: '100%', 
                  alignItems: 'center',
                  shadowColor: colors.primary,
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 4,
                  opacity: !inputProject.trim() ? 0.6 : 1 
                }}
              >
                <Text style={{ 
                  color: '#ffffff', 
                  fontWeight: '600', 
                  fontSize: 16,
                  letterSpacing: 0.25
                }}>
                  {t('home.createProject')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Custom Name Modal for Android */}
        <Modal
          visible={showNameModal}
          transparent={true}
          animationType="fade"
          onRequestClose={handleNameModalCancel}
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                  {nameModalType === 'add' ? t('home.addNewRelay') : t('home.renameRelay')}
                </Text>
                
                <Text style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginBottom: 20,
                  textAlign: 'center',
                }}>
                  {nameModalType === 'add' ? t('home.enterRelayName') : t('home.enterNewRelayName')}
                </Text>
                
                <TextInput
                  value={nameInput}
                  onChangeText={setNameInput}
                  placeholder={t('home.relayName')}
                  placeholderTextColor={colors.textSecondary}
                  style={{
                    backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                    borderRadius: 12,
                    padding: 16,
                    fontSize: 16,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.border,
                    marginBottom: 20,
                  }}
                  autoFocus={true}
                  onSubmitEditing={handleNameModalSubmit}
                />
                
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    onPress={handleNameModalCancel}
                    style={{
                      flex: 1,
                      backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                      borderRadius: 12,
                      paddingVertical: 14,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{
                      color: colors.text,
                      fontSize: 16,
                      fontWeight: '600',
                    }}>
                      {t('common.cancel')}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={handleNameModalSubmit}
                    disabled={!nameInput.trim()}
                    style={{
                      flex: 1,
                      backgroundColor: nameInput.trim() ? colors.primary : colors.border,
                      borderRadius: 12,
                      paddingVertical: 14,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{
                      color: nameInput.trim() ? '#ffffff' : colors.textSecondary,
                      fontSize: 16,
                      fontWeight: '600',
                    }}>
                      {nameModalType === 'add' ? t('common.add') : t('common.save')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  relayCard: {
    backgroundColor: 'transparent',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    alignSelf: 'center',
    borderWidth: 2,
  },
  relayTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  relayStatus: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.85,
  },
});

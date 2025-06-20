import "@/global.css";
import { useUser } from "@clerk/clerk-expo";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const [project, setProject] = React.useState<{ id: number; project_name: string } | null>(null);
  const [inputProject, setInputProject] = React.useState("");
  const [relays, setRelays] = React.useState<Relay[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [adding, setAdding] = React.useState(false);
  const [updating, setUpdating] = React.useState<number | null>(null);

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
    setProject(data);
    setLoading(false);
  };

  const addRelay = async () => {
    if (!project) return;
    setAdding(true);
    const nextIndex = relays.length;
    const relayName = `p${nextIndex}`;
    await supabase.from("relays").insert({
      project_id: project.id,
      relay_name: relayName,
      state: 0,
    });
    setAdding(false);
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

  const renderRelayCard = ({ item }: { item: Relay }) => (
    <TouchableOpacity
      onPress={() => toggleRelay(item)}
      disabled={updating === item.id}
      style={{
        backgroundColor: item.state === 1 ? '#a5f3fc' : '#f3f4f6',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        width: (width - 72) / 2,
        alignSelf: 'center',
        shadowColor: '#94a3b8',
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
        borderWidth: 1.25,
        borderColor: item.state === 1 ? '#06b6d4' : '#d1d5db',
        opacity: updating === item.id ? 0.7 : 1
      }}
    >
      <Text style={{
        fontSize: 18,
        fontWeight: '700',
        color: item.state === 1 ? '#0e7490' : '#374151',
        marginBottom: 8,
        textAlign: 'center'
      }}>
        {item.relay_name.toUpperCase()}
      </Text>

      <Text style={{
        fontSize: 14,
        fontWeight: '600',
        color: item.state === 1 ? '#0e7490' : '#6b7280',
        textAlign: 'center',
        opacity: 0.85
      }}>
        {updating === item.id ? 'Updating...' : (item.state === 1 ? 'ON' : 'OFF')}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 24,
          paddingVertical: 16,
          backgroundColor: '#ffffff',
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
          borderBottomWidth: 1,
          borderBottomColor: '#f3f4f6',
        }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#1f2937', letterSpacing: -0.5 }}>
            {project ? project.project_name : "Your Project"}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: '#10b981',
              shadowColor: '#10b981',
              shadowOpacity: 0.6,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 0 },
            }} />
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#6b7280', letterSpacing: 0.25 }}>
              Connected
            </Text>
          </View>
        </View>

        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
          {!isLoaded || loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          ) : project ? (
            <>
              <FlatList
                data={[...relays, { id: 'add-relay', relay_name: 'ADD', state: -1 }] as RelayOrAddItem[]}
                keyExtractor={item => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                contentContainerStyle={{ paddingBottom: 120 }}
                renderItem={({ item }) => {
                  if (item.id === 'add-relay') {
                    return (
                      <TouchableOpacity
                        onPress={addRelay}
                        disabled={adding}
                        style={{
                          backgroundColor: '#f8fafc',
                          borderRadius: 24,
                          padding: 20,
                          marginBottom: 16,
                          width: (width - 72) / 2,
                          shadowColor: '#94a3b8',
                          shadowOpacity: 0.15,
                          shadowRadius: 10,
                          elevation: 6,
                          borderWidth: 1.25,
                          borderColor: '#d1d5db',
                          borderStyle: 'dashed',
                          opacity: adding ? 0.7 : 1,
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: 80,
                        }}
                      >
                        <MaterialCommunityIcons 
                          name="plus" 
                          size={32} 
                          color="#94a3b8" 
                        />
                        <Text style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: '#94a3b8',
                          marginTop: 8,
                          textAlign: 'center'
                        }}>
                          Add Relay
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
              <Text style={{ fontSize: 28, fontWeight: '700', color: '#1f2937', marginBottom: 8, textAlign: 'center', letterSpacing: -0.5 }}>
                Welcome
              </Text>
              <Text style={{ fontSize: 16, color: '#6b7280', marginBottom: 32, textAlign: 'center', lineHeight: 24 }}>
                Create your first project to get started
              </Text>
              <TextInput
                placeholder="Enter project name"
                value={inputProject}
                onChangeText={setInputProject}
                style={{
                  backgroundColor: '#f9fafb',
                  borderRadius: 16,
                  padding: 20,
                  width: '100%',
                  fontSize: 16,
                  marginBottom: 24,
                  borderWidth: 2,
                  borderColor: '#e5e7eb',
                  color: '#1f2937',
                  fontWeight: '500'
                }}
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity
                onPress={createProject}
                disabled={!inputProject.trim()}
                style={{
                  backgroundColor: '#3b82f6',
                  borderRadius: 16,
                  paddingVertical: 18,
                  paddingHorizontal: 32,
                  width: '100%',
                  alignItems: 'center',
                  shadowColor: '#3b82f6',
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 4,
                  opacity: !inputProject.trim() ? 0.6 : 1
                }}
              >
                <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 16, letterSpacing: 0.25 }}>
                  Create Project
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

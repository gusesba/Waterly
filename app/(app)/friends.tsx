import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { COLORS } from "../../constants/theme";
import { useAppLabels } from "../../hooks/useAppLabels";
import { useAuth } from "../../providers/AuthProvider";
import { FriendRequest, SocialProfile, splitRequests } from "../../services/social";

export default function FriendsRoute() {
  const { copy } = useAppLabels();
  const { request, user } = useAuth();
  const router = useRouter();
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const [confirming, setConfirming] = useState<string | null>(null);
  const normalizedSearch = search.trim();
  const friendsQuery = useQuery({ enabled: !!user, queryFn: () => request<SocialProfile[]>("/api/v1/friends"), queryKey: ["social", "friends", user?.email] });
  const requestsQuery = useQuery({ enabled: !!user, queryFn: () => request<FriendRequest[]>("/api/v1/friends/requests"), queryKey: ["social", "requests", user?.email] });
  const searchQuery = useQuery({ enabled: !!user && normalizedSearch.length >= 3, queryFn: () => request<SocialProfile[]>(`/api/v1/profiles/search?query=${encodeURIComponent(normalizedSearch)}`), queryKey: ["social", "search", normalizedSearch] });
  const mutation = useMutation({
    mutationFn: ({ path, method = "DELETE", body }: { path: string; method?: string; body?: unknown }) => request(path, { method, body: body ? JSON.stringify(body) : undefined }),
    onSuccess: () => { setConfirming(null); void client.invalidateQueries({ queryKey: ["social"] }); },
  });
  const requests = splitRequests(requestsQuery.data ?? []);
  const act = (path: string, method = "DELETE", body?: unknown) => mutation.mutate({ path, method, body });

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
    <Pressable accessibilityLabel={copy.accessibility.back} accessibilityRole="button" onPress={() => router.back()} style={styles.back}><Ionicons color={COLORS.blueDark} name="arrow-back" size={22} /></Pressable>
    <Text style={styles.title}>{copy.friends.title}</Text><Text style={styles.description}>{copy.friends.description}</Text>
    <Text style={styles.section}>{copy.friends.search}</Text>
    <View style={styles.searchRow}><TextInput accessibilityLabel={copy.friends.search} autoCapitalize="none" autoCorrect={false} onChangeText={setSearch} placeholder={copy.friends.searchPlaceholder} style={styles.input} value={search} /><Ionicons color={COLORS.blueDark} name="search" size={20} /></View>
    {normalizedSearch.length > 0 && normalizedSearch.length < 3 && <Text style={styles.hint}>{copy.friends.searchHint}</Text>}
    {searchQuery.isFetching && <ActivityIndicator color={COLORS.blueDark} style={styles.loading} />}
    {searchQuery.data?.map((profile) => <ProfileCard key={profile.userId} profile={profile} actionLabel={profile.relationship === "none" ? copy.friends.add : profile.relationship === "friends" ? copy.friends.friend : copy.friends.pending} disabled={profile.relationship !== "none" || mutation.isPending} onAction={() => act("/api/v1/friends/requests", "POST", { username: profile.username })} />)}
    <RequestSection title={copy.friends.incoming} empty={copy.friends.emptyRequests} items={requests.incoming} primary={copy.friends.accept} secondary={copy.friends.decline} disabled={mutation.isPending} onPrimary={(id) => act(`/api/v1/friends/requests/${id}/accept`, "PUT")} onSecondary={(id) => act(`/api/v1/friends/requests/${id}`)} />
    <RequestSection title={copy.friends.outgoing} empty={copy.friends.emptyRequests} items={requests.outgoing} primary={copy.friends.cancel} disabled={mutation.isPending} onPrimary={(id) => act(`/api/v1/friends/requests/${id}`)} />
    <Text style={styles.section}>{copy.friends.friends}</Text>
    {friendsQuery.isPending || requestsQuery.isPending ? <ActivityIndicator color={COLORS.blueDark} style={styles.loading} /> : friendsQuery.isError || requestsQuery.isError ? <Text accessibilityRole="alert" style={styles.error}>{copy.friends.loadError}</Text> : !friendsQuery.data?.length ? <Text style={styles.empty}>{copy.friends.emptyFriends}</Text> : friendsQuery.data.map((profile) => <ProfileCard key={profile.userId} profile={profile} actionLabel={confirming === profile.userId ? copy.friends.confirmRemove : copy.friends.remove} disabled={mutation.isPending} danger onAction={() => confirming === profile.userId ? act(`/api/v1/friends/${profile.userId}`) : setConfirming(profile.userId)} />)}
    {mutation.isError && <Text accessibilityRole="alert" style={styles.error}>{copy.friends.actionError}</Text>}
  </ScrollView></SafeAreaView>;
}

function RequestSection({ title, empty, items, primary, secondary, disabled, onPrimary, onSecondary }: { title:string; empty:string; items:FriendRequest[]; primary:string; secondary?:string; disabled:boolean; onPrimary:(id:string)=>void; onSecondary?:(id:string)=>void }) {
  return <><Text style={styles.section}>{title}</Text>{items.length === 0 ? <Text style={styles.empty}>{empty}</Text> : items.map((item) => <View key={item.id} style={styles.card}><ProfileText profile={item.profile} /><View style={styles.actions}><Pressable accessibilityRole="button" disabled={disabled} onPress={() => onPrimary(item.id)} style={styles.primary}><Text style={styles.primaryText}>{primary}</Text></Pressable>{secondary && <Pressable accessibilityRole="button" disabled={disabled} onPress={() => onSecondary?.(item.id)}><Text style={styles.secondaryText}>{secondary}</Text></Pressable>}</View></View>)}</>;
}

function ProfileCard({ profile, actionLabel, disabled, danger, onAction }: { profile:SocialProfile; actionLabel:string; disabled:boolean; danger?:boolean; onAction:()=>void }) {
  return <View style={styles.card}><ProfileText profile={profile} /><Pressable accessibilityRole="button" disabled={disabled} onPress={onAction} style={[styles.primary, danger && styles.danger, disabled && styles.disabled]}><Text style={styles.primaryText}>{actionLabel}</Text></Pressable></View>;
}
function ProfileText({ profile }: { profile:SocialProfile }) { return <View style={styles.profileText}><Text style={styles.name}>{profile.displayName}</Text><Text style={styles.username}>@{profile.username}</Text>{profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}</View>; }

const styles=StyleSheet.create({safe:{backgroundColor:COLORS.background,flex:1},screen:{padding:24,paddingBottom:40},back:{alignItems:"center",height:44,justifyContent:"center",width:44},title:{color:COLORS.ink,fontSize:32,fontWeight:"900",marginTop:16},description:{color:COLORS.muted,fontSize:15,lineHeight:22,marginTop:8},section:{color:COLORS.ink,fontSize:12,fontWeight:"900",marginBottom:9,marginTop:26},searchRow:{alignItems:"center",backgroundColor:COLORS.surface,borderColor:COLORS.border,borderRadius:14,borderWidth:1,flexDirection:"row",paddingHorizontal:14},input:{color:COLORS.ink,flex:1,fontSize:15,minHeight:52},hint:{color:COLORS.muted,fontSize:12,marginTop:7},loading:{marginVertical:18},card:{alignItems:"center",backgroundColor:COLORS.surface,borderColor:COLORS.border,borderRadius:16,borderWidth:1,flexDirection:"row",gap:12,marginBottom:10,padding:14},profileText:{flex:1},name:{color:COLORS.ink,fontSize:15,fontWeight:"800"},username:{color:COLORS.blueDark,fontSize:12,marginTop:2},bio:{color:COLORS.muted,fontSize:12,lineHeight:17,marginTop:5},actions:{alignItems:"flex-end",gap:8},primary:{backgroundColor:COLORS.blueDark,borderRadius:12,paddingHorizontal:13,paddingVertical:10},danger:{backgroundColor:"#A33A61"},primaryText:{color:COLORS.surface,fontSize:12,fontWeight:"800"},secondaryText:{color:"#A33A61",fontSize:12,fontWeight:"800"},disabled:{opacity:.55},empty:{color:COLORS.muted,fontSize:13,lineHeight:19},error:{color:"#A33A61",fontSize:13,marginTop:14}});

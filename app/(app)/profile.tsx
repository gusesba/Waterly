import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { COLORS } from "../../constants/theme";
import { useAppLabels } from "../../hooks/useAppLabels";
import { useAuth } from "../../providers/AuthProvider";
import { ApiError } from "../../services/api";
import { isValidPublicProfile, normalizeUsername, PublicProfile, PublicProfileInput } from "../../services/publicProfile";
import { Mascot } from "../../components/Mascot";
import type { CharacterLoadout } from "../../services/cosmetics";

export default function ProfileRoute() {
  const { copy } = useAppLabels(); const { request, user } = useAuth(); const router = useRouter(); const client = useQueryClient();
  const [form, setForm] = useState<PublicProfileInput>({ username: "", displayName: "", bio: null });
  const query = useQuery({ enabled: !!user, queryKey: ["profile", "public", user?.email], queryFn: () => request<PublicProfile | null>("/api/v1/profile") });
  const loadoutQuery = useQuery({ enabled: !!user, queryKey: ["cosmetics", "loadout", user?.email], queryFn: () => request<CharacterLoadout>("/api/v1/profile/loadout") });
  useEffect(() => { if (query.data) setForm({ username: query.data.username, displayName: query.data.displayName, bio: query.data.bio }); }, [query.data]);
  const mutation = useMutation({ mutationFn: (value: PublicProfileInput) => request<PublicProfile>("/api/v1/profile", { method: "PUT", body: JSON.stringify(value) }), onSuccess: (value) => { client.setQueryData(["profile", "public", user?.email], value); setForm({ username: value.username, displayName: value.displayName, bio: value.bio }); } });
  const valid = isValidPublicProfile(form);
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.screen}>
    <Pressable accessibilityLabel={copy.accessibility.back} accessibilityRole="button" onPress={() => router.back()} style={styles.back}><Ionicons color={COLORS.blueDark} name="arrow-back" size={22} /></Pressable>
    <Text style={styles.title}>{copy.publicProfile.title}</Text><Text style={styles.description}>{copy.publicProfile.description}</Text>
    <Pressable accessibilityRole="button" onPress={() => router.push("./character")} style={styles.character}>
      <Mascot accessibilityLabel={copy.character.preview} auraCode={loadoutQuery.data?.auraCode} mood="progress" size={64} />
      <View style={styles.characterText}><Text style={styles.characterTitle}>{copy.character.axolotl}</Text><Text style={styles.characterLink}>{copy.character.open}</Text></View>
      <Ionicons color={COLORS.blueDark} name="chevron-forward" size={20} />
    </Pressable>
    {query.isPending ? <ActivityIndicator color={COLORS.blueDark} style={styles.loading} /> : <>
      <Text style={styles.label}>{copy.publicProfile.username}</Text><TextInput autoCapitalize="none" maxLength={20} onChangeText={(value) => setForm({ ...form, username: normalizeUsername(value) })} style={styles.input} value={form.username} />
      <Text style={styles.label}>{copy.publicProfile.displayName}</Text><TextInput maxLength={40} onChangeText={(value) => setForm({ ...form, displayName: value })} style={styles.input} value={form.displayName} />
      <Text style={styles.label}>{copy.publicProfile.bio}</Text><TextInput maxLength={160} multiline onChangeText={(value) => setForm({ ...form, bio: value })} style={[styles.input, styles.bio]} value={form.bio ?? ""} />
      <View style={styles.privacy}><Ionicons color={COLORS.success} name="lock-closed" size={17} /><Text style={styles.privacyText}>{copy.publicProfile.privacy}</Text></View>
      {mutation.isError && <Text accessibilityRole="alert" style={styles.error}>{mutation.error instanceof ApiError && mutation.error.status === 409 ? copy.publicProfile.conflict : copy.publicProfile.saveError}</Text>}
      <Pressable accessibilityRole="button" disabled={!valid || mutation.isPending} onPress={() => mutation.mutate(form)} style={[styles.button, (!valid || mutation.isPending) && styles.disabled]}><Text style={styles.buttonText}>{mutation.isPending ? copy.publicProfile.saving : copy.publicProfile.save}</Text></Pressable>
    </>}
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ safe:{backgroundColor:COLORS.background,flex:1},screen:{padding:24,paddingBottom:40},back:{alignItems:"center",height:44,justifyContent:"center",width:44},title:{color:COLORS.ink,fontSize:32,fontWeight:"900",marginTop:16},description:{color:COLORS.muted,fontSize:15,lineHeight:22,marginTop:8},character:{alignItems:"center",backgroundColor:COLORS.surface,borderColor:COLORS.border,borderRadius:18,borderWidth:1,flexDirection:"row",gap:14,marginTop:20,padding:14},characterText:{flex:1},characterTitle:{color:COLORS.ink,fontSize:16,fontWeight:"900"},characterLink:{color:COLORS.blueDark,fontSize:12,fontWeight:"800",marginTop:3},loading:{marginTop:40},label:{color:COLORS.ink,fontSize:12,fontWeight:"800",marginTop:20},input:{backgroundColor:COLORS.surface,borderColor:COLORS.border,borderRadius:14,borderWidth:1,color:COLORS.ink,fontSize:15,marginTop:7,minHeight:52,paddingHorizontal:15},bio:{minHeight:100,paddingTop:14,textAlignVertical:"top"},privacy:{alignItems:"center",backgroundColor:"#E8F7F1",borderRadius:14,flexDirection:"row",gap:9,marginTop:18,padding:14},privacyText:{color:COLORS.muted,flex:1,fontSize:12,lineHeight:18},error:{color:"#A33A61",fontSize:13,marginTop:14},button:{alignItems:"center",backgroundColor:COLORS.blueDark,borderRadius:16,marginTop:20,padding:17},buttonText:{color:COLORS.surface,fontSize:14,fontWeight:"900"},disabled:{opacity:.5} });

import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { Mascot } from "../../components/Mascot";
import { COLORS } from "../../constants/theme";
import { useAppLabels } from "../../hooks/useAppLabels";
import { useAuth } from "../../providers/AuthProvider";
import { canEquipAura, CharacterLoadout, CosmeticAura } from "../../services/cosmetics";

export default function CharacterRoute() {
  const { copy } = useAppLabels();
  const { request, user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = ["cosmetics", "loadout", user?.email];
  const loadoutQuery = useQuery({
    enabled: !!user,
    queryFn: () => request<CharacterLoadout>("/api/v1/profile/loadout"),
    queryKey,
  });
  const mutation = useMutation({
    mutationFn: (auraCode: string) => request<CharacterLoadout>("/api/v1/profile/loadout", {
      body: JSON.stringify({ auraCode }),
      method: "PUT",
    }),
    onSuccess: (loadout) => queryClient.setQueryData(queryKey, loadout),
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen}>
        <Pressable accessibilityLabel={copy.accessibility.back} accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
          <Ionicons color={COLORS.blueDark} name="arrow-back" size={22} />
        </Pressable>
        <Text style={styles.title}>{copy.character.title}</Text>
        <Text style={styles.description}>{copy.character.description}</Text>
        {loadoutQuery.isPending ? <ActivityIndicator color={COLORS.blueDark} style={styles.loading} /> : loadoutQuery.isError ? (
          <View style={styles.status}><Text accessibilityRole="alert" style={styles.error}>{copy.character.loadError}</Text><Pressable onPress={() => void loadoutQuery.refetch()}><Text style={styles.retry}>{copy.home.retry}</Text></Pressable></View>
        ) : loadoutQuery.data ? (
          <>
            <View style={styles.preview}>
              <Mascot accessibilityLabel={copy.character.preview} auraCode={loadoutQuery.data.auraCode} mood="progress" size={132} />
              <Text style={styles.characterName}>{copy.character.axolotl}</Text>
            </View>
            <Text style={styles.section}>{copy.character.auras}</Text>
            {loadoutQuery.data.auras.map((aura) => (
              <AuraCard key={aura.code} aura={aura} copy={copy} disabled={mutation.isPending} onEquip={() => mutation.mutate(aura.code)} />
            ))}
            {mutation.isError && <Text accessibilityRole="alert" style={styles.error}>{copy.character.saveError}</Text>}
            <Text style={styles.note}>{copy.character.noCost}</Text>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function AuraCard({ aura, copy, disabled, onEquip }: { aura: CosmeticAura; copy: ReturnType<typeof useAppLabels>["copy"]; disabled: boolean; onEquip: () => void }) {
  const achievement = aura.requiredAchievementCode ? copy.achievements.items[aura.requiredAchievementCode]?.title : null;
  return <Pressable accessibilityRole="button" disabled={!canEquipAura(aura) || disabled} onPress={onEquip} style={[styles.card, aura.isSelected && styles.selected, !aura.isOwned && styles.locked]}>
    <View style={styles.cardText}><Text style={styles.cardTitle}>{copy.character.auraNames[aura.code]}</Text><Text style={styles.cardDescription}>{aura.isOwned ? (aura.isSelected ? copy.character.equipped : copy.character.available) : copy.character.unlockWith(achievement ?? aura.requiredAchievementCode ?? "")}</Text></View>
    <Ionicons color={aura.isOwned ? COLORS.blueDark : COLORS.muted} name={aura.isSelected ? "checkmark-circle" : aura.isOwned ? "sparkles" : "lock-closed"} size={24} />
  </Pressable>;
}

const styles = StyleSheet.create({ safeArea:{backgroundColor:COLORS.background,flex:1},screen:{padding:24,paddingBottom:40},back:{alignItems:"center",height:44,justifyContent:"center",width:44},title:{color:COLORS.ink,fontSize:32,fontWeight:"900",marginTop:16},description:{color:COLORS.muted,fontSize:15,lineHeight:22,marginTop:8},loading:{marginTop:40},status:{alignItems:"center",gap:12,marginTop:40},error:{color:"#A33A61",fontSize:13,marginTop:14},retry:{color:COLORS.blueDark,fontWeight:"800"},preview:{alignItems:"center",backgroundColor:COLORS.surface,borderColor:COLORS.border,borderRadius:24,borderWidth:1,gap:14,marginTop:24,padding:28},characterName:{color:COLORS.ink,fontSize:18,fontWeight:"900"},section:{color:COLORS.ink,fontSize:13,fontWeight:"900",marginBottom:10,marginTop:26},card:{alignItems:"center",backgroundColor:COLORS.surface,borderColor:COLORS.border,borderRadius:16,borderWidth:1,flexDirection:"row",gap:12,marginBottom:10,padding:16},selected:{borderColor:COLORS.blueDark,borderWidth:2},locked:{opacity:.62},cardText:{flex:1},cardTitle:{color:COLORS.ink,fontSize:16,fontWeight:"800"},cardDescription:{color:COLORS.muted,fontSize:12,lineHeight:18,marginTop:3},note:{color:COLORS.muted,fontSize:12,lineHeight:18,marginTop:12,textAlign:"center"} });

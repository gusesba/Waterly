import { Ionicons } from "@expo/vector-icons";
import { useMutation,useQuery,useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams,useRouter } from "expo-router";
import { ActivityIndicator,Pressable,SafeAreaView,StyleSheet,Text,View } from "react-native";
import { COLORS } from "../../../../constants/theme";
import { useAppLabels } from "../../../../hooks/useAppLabels";
import { useAuth } from "../../../../providers/AuthProvider";
import { usePendingInvite } from "../../../../providers/PendingInviteProvider";
import { apiRequest,ApiError } from "../../../../services/api";
import { GroupDetail,GroupInvitePreview } from "../../../../services/groups";

export default function GroupInviteRoute(){const{token}=useLocalSearchParams<{token:string}>();const{copy}=useAppLabels();const{request,user}=useAuth();const pending=usePendingInvite();const router=useRouter();const client=useQueryClient();
const query=useQuery({enabled:!!token,queryKey:["group-invite",token,user?.email],queryFn:()=>user?request<GroupInvitePreview>(`/api/v1/invites/group/${token}`):apiRequest<GroupInvitePreview>(`/api/v1/invites/group/${token}`,{})});
const accept=useMutation({mutationFn:()=>request<GroupDetail>(`/api/v1/invites/group/${token}/accept`,{method:"POST"}),onSuccess:async group=>{await pending.clear();void client.invalidateQueries({queryKey:["groups"]});router.replace({pathname:"/group/[id]",params:{id:group.id}});}});
async function close(){await pending.clear();router.replace("/groups");}
if(query.isPending)return <SafeAreaView style={styles.safe}><ActivityIndicator color={COLORS.blueDark} style={styles.loading}/></SafeAreaView>;
if(query.isError||!query.data)return <SafeAreaView style={styles.safe}><View style={styles.screen}><Ionicons color="#A33A61" name="link-outline" size={48}/><Text style={styles.title}>{copy.groups.inviteUnavailable}</Text><Text style={styles.description}>{copy.groups.inviteUnavailableDescription}</Text><Button label={copy.groups.backToGroups} onPress={()=>void close()}/></View></SafeAreaView>;
const invite=query.data;const capacityError=accept.error instanceof ApiError&&accept.error.status===409;
return <SafeAreaView style={styles.safe}><View style={styles.screen}><Ionicons color={COLORS.blueDark} name="people-circle" size={58}/><Text style={styles.eyebrow}>{copy.groups.invitation}</Text><Text style={styles.title}>{invite.groupName}</Text><Text style={styles.description}>{copy.groups.invitedBy(invite.ownerDisplayName)}</Text><Text style={styles.meta}>{copy.groups.members(invite.memberCount)}</Text>
{invite.isMember?<Button label={copy.groups.openGroup} onPress={async()=>{await pending.clear();router.replace({pathname:"/group/[id]",params:{id:invite.groupId}});}}/>:user?<Button disabled={accept.isPending} label={accept.isPending?copy.groups.joining:copy.groups.join} onPress={()=>accept.mutate()}/>:<Button label={copy.groups.signInToJoin} onPress={()=>router.push("/(auth)")}/>} 
{accept.isError&&<Text accessibilityRole="alert" style={styles.error}>{capacityError?copy.groups.capacityReached:copy.groups.actionError}</Text>}<Pressable accessibilityRole="button" onPress={()=>void close()}><Text style={styles.cancel}>{copy.groups.notNow}</Text></Pressable></View></SafeAreaView>}
function Button({label,onPress,disabled}:{label:string;onPress:()=>void;disabled?:boolean}){return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.button,disabled&&styles.disabled]}><Text style={styles.buttonText}>{label}</Text></Pressable>}
const styles=StyleSheet.create({safe:{backgroundColor:COLORS.background,flex:1},screen:{alignItems:"center",flex:1,justifyContent:"center",padding:28},loading:{marginTop:60},eyebrow:{color:COLORS.blueDark,fontSize:12,fontWeight:"900",marginTop:18},title:{color:COLORS.ink,fontSize:30,fontWeight:"900",marginTop:8,textAlign:"center"},description:{color:COLORS.muted,fontSize:15,lineHeight:22,marginTop:10,textAlign:"center"},meta:{color:COLORS.blueDark,fontSize:13,fontWeight:"800",marginTop:10},button:{alignItems:"center",alignSelf:"stretch",backgroundColor:COLORS.blueDark,borderRadius:14,marginTop:28,padding:15},buttonText:{color:COLORS.surface,fontWeight:"900",textAlign:"center"},disabled:{opacity:.5},error:{color:"#A33A61",fontSize:13,marginTop:14,textAlign:"center"},cancel:{color:COLORS.muted,fontWeight:"800",marginTop:20}});

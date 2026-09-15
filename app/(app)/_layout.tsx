import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { COLORS } from "../../constants/theme";
import { useAppLabels } from "../../hooks/useAppLabels";

export default function AppLayout() {
  const { copy } = useAppLabels();
  return <Tabs screenOptions={{ headerShown:false, tabBarActiveTintColor:COLORS.blueDark, tabBarInactiveTintColor:COLORS.muted, tabBarStyle:{backgroundColor:COLORS.surface,borderTopColor:COLORS.border,height:64,paddingBottom:8,paddingTop:6} }}>
    <Tabs.Screen name="index" options={{title:copy.groups.tabToday,tabBarAccessibilityLabel:copy.groups.tabToday,tabBarIcon:({color,size})=><Ionicons color={color} name="water" size={size}/>}} />
    <Tabs.Screen name="groups" options={{title:copy.groups.tabGroups,tabBarAccessibilityLabel:copy.groups.tabGroups,tabBarIcon:({color,size})=><Ionicons color={color} name="people" size={size}/>}} />
    <Tabs.Screen name="profile" options={{title:copy.groups.tabProfile,tabBarAccessibilityLabel:copy.groups.tabProfile,tabBarIcon:({color,size})=><Ionicons color={color} name="person" size={size}/>}} />
    {(["account","achievements","character","friends","history","progression","reminders","group/[id]"] as const).map(name=><Tabs.Screen key={name} name={name} options={{href:null}} />)}
  </Tabs>;
}

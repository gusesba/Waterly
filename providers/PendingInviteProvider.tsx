import * as Linking from "expo-linking";
import { createContext,ReactNode,useContext,useEffect,useState } from "react";
import { clearPendingGroupInvite,loadPendingGroupInvite,parseGroupInviteToken,savePendingGroupInvite } from "../services/inviteLinks";

type Value={clear:()=>Promise<void>;isHydrated:boolean;token:string|null};
const Context=createContext<Value|null>(null);
export function PendingInviteProvider({children}:{children:ReactNode}){const url=Linking.useLinkingURL();const[token,setToken]=useState<string|null>(null);const[isHydrated,setHydrated]=useState(false);
useEffect(()=>{let mounted=true;void loadPendingGroupInvite().then(value=>{if(mounted){setToken(value);setHydrated(true);}});return()=>{mounted=false;};},[]);
useEffect(()=>{const parsed=parseGroupInviteToken(url);if(parsed){setToken(parsed);void savePendingGroupInvite(parsed);}},[url]);
async function clear(){await clearPendingGroupInvite();setToken(null);}
return <Context.Provider value={{clear,isHydrated,token}}>{children}</Context.Provider>}
export function usePendingInvite(){const value=useContext(Context);if(!value)throw new Error("usePendingInvite must be used inside PendingInviteProvider");return value;}

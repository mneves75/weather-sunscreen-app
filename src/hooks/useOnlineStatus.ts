import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export function useOnlineStatus() {
  const [online, setOnline] = useState<boolean>(true);
  useEffect(() => {
    const sub = NetInfo.addEventListener((s) => setOnline(Boolean(s.isConnected)));
    NetInfo.fetch().then((s) => setOnline(Boolean(s.isConnected)));
    return () => sub && sub();
  }, []);
  return online;
}

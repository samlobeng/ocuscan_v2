import NetInfo from '@react-native-community/netinfo';

export const checkInternetConnection = async (): Promise<boolean> => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected ?? false;
};

export const subscribeToNetworkChanges = (callback: (isConnected: boolean) => void) => {
  return NetInfo.addEventListener(state => {
    callback(state.isConnected ?? false);
  });
}; 
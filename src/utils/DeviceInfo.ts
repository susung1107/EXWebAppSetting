import DeviceInfo from 'react-native-device-info';

export const getUniqueId = async (): Promise<string> => {
  const uniqueId = await DeviceInfo.getUniqueId().then(id => {
    return id;
  });

  return uniqueId;
};

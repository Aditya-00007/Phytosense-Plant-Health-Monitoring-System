import { useMemo, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { CROPS } from '../config/crops';
import { useAuth } from '../context/AuthContext';
import { diagnose } from '../services/plantService';
import { getCoords } from '../utils/location';
import { getMainCrop, parseCropList } from '../utils/profile';
import { useAction } from '../utils/useAction';

export function useScanController(navigation) {
  const { user } = useAuth();
  const crops = useMemo(() => {
    const userCrops = [...parseCropList(user?.primaryCrops), ...parseCropList(user?.secondaryCrops)];
    return Array.from(new Set([...userCrops, ...CROPS]));
  }, [user?.primaryCrops, user?.secondaryCrops]);

  const [imageUri, setImageUri] = useState(null);
  const [crop, setCrop] = useState(() => getMainCrop(user) || CROPS[0]);

  const analyzeAction = useAction(async () => {
    const coords = await getCoords();
    const diagnosis = await diagnose({ imageUri, crop, coords });
    navigation.navigate('Result', { diagnosis });
  });

  const pickImage = async (useCamera) => {
    const ask = useCamera
      ? ImagePicker.requestCameraPermissionsAsync
      : ImagePicker.requestMediaLibraryPermissionsAsync;
    const perm = await ask();
    if (!perm.granted) return analyzeAction.setError('Permission is needed to select a photo');

    const launch = useCamera ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
    const res = await launch({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!res.canceled) {
      analyzeAction.setError(null);
      setImageUri(res.assets[0].uri);
    }
  };

  return {
    imageUri,
    crop,
    setCrop,
    crops,
    pickImage,
    analyze: () => analyzeAction.run(),
    loading: analyzeAction.loading,
    error: analyzeAction.error,
  };
}

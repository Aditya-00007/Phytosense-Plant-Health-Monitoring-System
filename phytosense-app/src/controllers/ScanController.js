import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { CROPS } from '../config/crops';
import { diagnose } from '../services/plantService';
import { getCoords } from '../utils/location';
import { useAction } from '../utils/useAction';

export function useScanController(navigation) {
  const [imageUri, setImageUri] = useState(null);
  const [crop, setCrop] = useState(CROPS[0]);

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
    crops: CROPS,
    pickImage,
    analyze: () => analyzeAction.run(),
    loading: analyzeAction.loading,
    error: analyzeAction.error,
  };
}

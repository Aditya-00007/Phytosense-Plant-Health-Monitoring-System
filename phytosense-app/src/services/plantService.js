import { Platform } from 'react-native';
import { USE_MOCK } from '../config/env';
import { request } from './api';
import { ENDPOINTS } from './endpoints';
import { mock } from './mock';
import { Diagnosis } from '../models/Diagnosis';

// Sends the plant photo + crop + optional location as multipart form data.
export async function diagnose({ imageUri, crop, coords }) {
  if (USE_MOCK) return Diagnosis.fromApi(await mock.diagnose(), imageUri);

  const form = new FormData();
  if (Platform.OS === 'web') {
    const blob = await (await fetch(imageUri)).blob();
    form.append('image', blob, 'plant.jpg');
  } else {
    form.append('image', { uri: imageUri, name: 'plant.jpg', type: 'image/jpeg' });
  }
  form.append('crop', crop);
  if (coords) {
    form.append('lat', String(coords.lat));
    form.append('lon', String(coords.lon));
  }
  const raw = await request(ENDPOINTS.diagnose, { method: 'POST', form });
  return Diagnosis.fromApi(raw, imageUri);
}

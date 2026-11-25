import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAction } from '../utils/useAction';
import { getFarmSizeCategory, getRegionFromLocation } from '../utils/profile';

function toForm(user) {
  return {
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    farmLocation: user?.farmLocation ?? '',
    farmSize: user?.farmSize ?? '',
    farmingType: user?.farmingType ?? 'Conventional',
    irrigation: user?.irrigation ?? 'Drip',
    waterAvailability: user?.waterAvailability ?? 'Medium',
    income: user?.income ?? '',
    primaryCrops: user?.primaryCrops ?? '',
    secondaryCrops: user?.secondaryCrops ?? '',
    receiveWeatherAlerts: user?.receiveWeatherAlerts ?? true,
    preferredLanguage: user?.preferredLanguage ?? 'English',
  };
}

export function useProfileController() {
  const { user, updateProfile, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [form, setForm] = useState(() => toForm(user));

  useEffect(() => {
    setForm(toForm(user));
  }, [user]);

  const setField = (key, value) => {
    setSavedNotice(false);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveAction = useAction(async () => {
    await updateProfile(form);
    setEditing(false);
    setSavedNotice(true);
  });

  const save = () => {
    if (!form.name.trim()) return saveAction.setError('Full name is required');
    saveAction.run();
  };

  const cancel = () => {
    setForm(toForm(user));
    saveAction.setError(null);
    setEditing(false);
  };

  return {
    user,
    form,
    setField,
    editing,
    startEdit: () => {
      setSavedNotice(false);
      setEditing(true);
    },
    cancel,
    save,
    saving: saveAction.loading,
    error: saveAction.error,
    savedNotice,
    signOut,
    sizeCategory: getFarmSizeCategory(user?.farmSize),
    region: getRegionFromLocation(user?.farmLocation),
  };
}


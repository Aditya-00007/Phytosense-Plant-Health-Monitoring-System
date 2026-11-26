import React from 'react';
import ScreenContainer from '../../components/ScreenContainer';
import Brand from '../../components/Brand';
import Card from '../../components/Card';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import LanguageSelector from '../../components/LanguageSelector';
import { ErrorText } from '../../components/StateViews';
import { useLanguage } from '../../context/LanguageContext';
import { useRegisterController } from '../../controllers/AuthController';
import { spacing } from '../../theme';

export default function RegisterView({ navigation }) {
  const c = useRegisterController();
  const { t } = useLanguage();
  return (
    <ScreenContainer>
      <LanguageSelector style={{ justifyContent: 'flex-end', marginBottom: spacing.xs }} />
      <Brand subtitle="Create your farmer account" />
      <Card>
        <TextField label={t('Full Name*')} value={c.name} onChangeText={c.setName} placeholder={t('Enter your full name')} />
        <TextField label={t('Email*')} value={c.email} onChangeText={c.setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" />
        <TextField label={t('Password*')} value={c.password} onChangeText={c.setPassword} secureTextEntry placeholder={t('Minimum 6 characters')} />
        <TextField label={t('Farm Location (optional)')} value={c.farmLocation} onChangeText={c.setFarmLocation} placeholder="e.g., Pune, Maharashtra" />
        <TextField label={t('Phone Number (optional)')} value={c.phone} onChangeText={c.setPhone} keyboardType="phone-pad" placeholder={t('For SMS weather alerts')} />
        <ErrorText message={t(c.error)} />
        <Button title={t('Sign up')} onPress={c.submit} loading={c.loading} />
        <Button title={t('I already have an account')} variant="outline" onPress={() => navigation.goBack()} />
      </Card>
    </ScreenContainer>
  );
}

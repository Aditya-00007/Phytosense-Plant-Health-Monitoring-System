import React from 'react';
import ScreenContainer from '../../components/ScreenContainer';
import Brand from '../../components/Brand';
import Card from '../../components/Card';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import LanguageSelector from '../../components/LanguageSelector';
import { ErrorText } from '../../components/StateViews';
import { useLanguage } from '../../context/LanguageContext';
import { useLoginController } from '../../controllers/AuthController';
import { spacing } from '../../theme';

export default function LoginView({ navigation }) {
  const c = useLoginController();
  const { t } = useLanguage();
  return (
    <ScreenContainer>
      <LanguageSelector style={{ justifyContent: 'flex-end', marginBottom: spacing.xs }} />
      <Brand subtitle="AI powered plant health monitoring" />
      <Card>
        <TextField label={t('Email')} value={c.email} onChangeText={c.setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextField label={t('Password')} value={c.password} onChangeText={c.setPassword} secureTextEntry />
        <ErrorText message={t(c.error)} />
        <Button title={t('Sign in')} onPress={c.submit} loading={c.loading} />
        <Button title={t('Create account')} variant="outline" onPress={() => navigation.navigate('Register')} />
      </Card>
    </ScreenContainer>
  );
}

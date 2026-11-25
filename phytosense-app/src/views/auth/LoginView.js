import React from 'react';
import ScreenContainer from '../../components/ScreenContainer';
import Brand from '../../components/Brand';
import Card from '../../components/Card';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { ErrorText } from '../../components/StateViews';
import { useLoginController } from '../../controllers/AuthController';

export default function LoginView({ navigation }) {
  const c = useLoginController();
  return (
    <ScreenContainer>
      <Brand subtitle="AI powered plant health monitoring" />
      <Card>
        <TextField label="Email" value={c.email} onChangeText={c.setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextField label="Password" value={c.password} onChangeText={c.setPassword} secureTextEntry />
        <ErrorText message={c.error} />
        <Button title="Sign in" onPress={c.submit} loading={c.loading} />
        <Button title="Create account" variant="outline" onPress={() => navigation.navigate('Register')} />
      </Card>
    </ScreenContainer>
  );
}

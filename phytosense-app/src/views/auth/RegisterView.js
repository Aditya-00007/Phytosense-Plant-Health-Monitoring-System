import React from 'react';
import ScreenContainer from '../../components/ScreenContainer';
import Brand from '../../components/Brand';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { ErrorText } from '../../components/StateViews';
import { useRegisterController } from '../../controllers/AuthController';

export default function RegisterView({ navigation }) {
  const c = useRegisterController();
  return (
    <ScreenContainer>
      <Brand subtitle="Create your farmer account" />
      <TextField label="Name" value={c.name} onChangeText={c.setName} />
      <TextField label="Email" value={c.email} onChangeText={c.setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextField label="Password" value={c.password} onChangeText={c.setPassword} secureTextEntry />
      <ErrorText message={c.error} />
      <Button title="Sign up" onPress={c.submit} loading={c.loading} />
      <Button title="I already have an account" variant="outline" onPress={() => navigation.goBack()} />
    </ScreenContainer>
  );
}

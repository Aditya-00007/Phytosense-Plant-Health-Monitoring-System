import React from 'react';
import ScreenContainer from '../../components/ScreenContainer';
import Brand from '../../components/Brand';
import Card from '../../components/Card';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { ErrorText } from '../../components/StateViews';
import { useRegisterController } from '../../controllers/AuthController';

export default function RegisterView({ navigation }) {
  const c = useRegisterController();
  return (
    <ScreenContainer>
      <Brand subtitle="Create your farmer account" />
      <Card>
        <TextField label="Full Name*" value={c.name} onChangeText={c.setName} placeholder="Enter your full name" />
        <TextField label="Email*" value={c.email} onChangeText={c.setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" />
        <TextField label="Password*" value={c.password} onChangeText={c.setPassword} secureTextEntry placeholder="Minimum 6 characters" />
        <TextField label="Farm Location (optional)" value={c.farmLocation} onChangeText={c.setFarmLocation} placeholder="e.g., Pune, Maharashtra" />
        <TextField label="Phone Number (optional)" value={c.phone} onChangeText={c.setPhone} keyboardType="phone-pad" placeholder="For SMS weather alerts" />
        <ErrorText message={c.error} />
        <Button title="Sign up" onPress={c.submit} loading={c.loading} />
        <Button title="I already have an account" variant="outline" onPress={() => navigation.goBack()} />
      </Card>
    </ScreenContainer>
  );
}

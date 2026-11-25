import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAction } from '../utils/useAction';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export function useLoginController() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const action = useAction(() => signIn(email.trim(), password));

  const submit = () => {
    if (!EMAIL_RE.test(email.trim())) return action.setError('Enter a valid email address');
    if (password.length < 6) return action.setError('Password must be at least 6 characters');
    action.run();
  };

  return { email, setEmail, password, setPassword, submit, loading: action.loading, error: action.error };
}

export function useRegisterController() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const action = useAction(() => signUp(name.trim(), email.trim(), password));

  const submit = () => {
    if (!name.trim()) return action.setError('Enter your name');
    if (!EMAIL_RE.test(email.trim())) return action.setError('Enter a valid email address');
    if (password.length < 6) return action.setError('Password must be at least 6 characters');
    action.run();
  };

  return { name, setName, email, setEmail, password, setPassword, submit, loading: action.loading, error: action.error };
}

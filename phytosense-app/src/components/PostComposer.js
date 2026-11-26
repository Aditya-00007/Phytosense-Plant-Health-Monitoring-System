import React from 'react';
import Card from './Card';
import TextField from './TextField';
import Button from './Button';
import { ErrorText } from './StateViews';
import { useLanguage } from '../context/LanguageContext';
import { spacing } from '../theme';

export default function PostComposer({ text, onChangeText, onSubmit, loading, error }) {
  const { t } = useLanguage();
  return (
    <Card style={{ marginBottom: spacing.md }}>
      <TextField
        placeholder={t('Share your experience...')}
        value={text}
        onChangeText={onChangeText}
        multiline
        style={{ minHeight: 70, textAlignVertical: 'top' }}
      />
      <ErrorText message={error} />
      <Button title={t('Post')} onPress={onSubmit} loading={loading} disabled={!text.trim()} />
    </Card>
  );
}

import React from 'react';
import Card from './Card';
import TextField from './TextField';
import Button from './Button';
import { ErrorText } from './StateViews';
import { spacing } from '../theme';

export default function PostComposer({ text, onChangeText, onSubmit, loading, error }) {
  return (
    <Card style={{ marginBottom: spacing.md }}>
      <TextField
        placeholder="Share your experience..."
        value={text}
        onChangeText={onChangeText}
        multiline
        style={{ minHeight: 70, textAlignVertical: 'top' }}
      />
      <ErrorText message={error} />
      <Button title="Post" onPress={onSubmit} loading={loading} disabled={!text.trim()} />
    </Card>
  );
}

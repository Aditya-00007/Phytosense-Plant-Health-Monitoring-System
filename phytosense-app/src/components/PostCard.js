import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import { timeAgo } from '../models/Post';
import { colors, spacing } from '../theme';

export default function PostCard({ post }) {
  return (
    <Card style={{ marginBottom: spacing.sm }}>
      <View style={s.head}>
        <Ionicons name="person-circle" size={32} color={colors.muted} />
        <View style={{ marginLeft: spacing.sm }}>
          <Text style={s.author}>{post.author}</Text>
          <Text style={s.time}>
            {timeAgo(post.createdAt)}{post.crop ? ` • ${post.crop}` : ''}
          </Text>
        </View>
      </View>
      <Text style={s.text}>{post.text}</Text>
      <View style={s.stats}>
        <Ionicons name="heart" size={16} color={colors.danger} />
        <Text style={s.stat}>{post.likes}</Text>
        <Ionicons name="chatbubble-outline" size={16} color={colors.muted} style={{ marginLeft: spacing.md }} />
        <Text style={s.stat}>{post.comments}</Text>
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  author: { fontWeight: '700', color: colors.text },
  time: { color: colors.muted, fontSize: 12 },
  text: { color: colors.text, lineHeight: 20 },
  stats: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  stat: { marginLeft: 4, color: colors.muted },
});

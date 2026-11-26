import React from 'react';
import ScreenContainer from '../../components/ScreenContainer';
import PostComposer from '../../components/PostComposer';
import PostCard from '../../components/PostCard';
import { EmptyText, ErrorText } from '../../components/StateViews';
import { useLanguage } from '../../context/LanguageContext';
import { useCommunityController } from '../../controllers/CommunityController';

export default function CommunityView() {
  const c = useCommunityController();
  const { t } = useLanguage();
  return (
    <ScreenContainer onRefresh={c.refresh} refreshing={c.refreshing}>
      <PostComposer
        text={c.text}
        onChangeText={c.setText}
        onSubmit={c.submit}
        loading={c.posting}
        error={t(c.postError)}
      />
      <ErrorText message={t(c.loadError)} />
      {c.posts.length ? (
        c.posts.map((p) => <PostCard key={p.id} post={p} />)
      ) : (
        <EmptyText message={t('No posts yet. Be the first to share.')} />
      )}
    </ScreenContainer>
  );
}

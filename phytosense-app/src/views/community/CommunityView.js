import React from 'react';
import ScreenContainer from '../../components/ScreenContainer';
import PostComposer from '../../components/PostComposer';
import PostCard from '../../components/PostCard';
import { EmptyText, ErrorText } from '../../components/StateViews';
import { useCommunityController } from '../../controllers/CommunityController';

export default function CommunityView() {
  const c = useCommunityController();
  return (
    <ScreenContainer onRefresh={c.refresh} refreshing={c.refreshing}>
      <PostComposer
        text={c.text}
        onChangeText={c.setText}
        onSubmit={c.submit}
        loading={c.posting}
        error={c.postError}
      />
      <ErrorText message={c.loadError} />
      {c.posts.length ? c.posts.map((p) => <PostCard key={p.id} post={p} />) : <EmptyText message="No posts yet. Be the first to share." />}
    </ScreenContainer>
  );
}

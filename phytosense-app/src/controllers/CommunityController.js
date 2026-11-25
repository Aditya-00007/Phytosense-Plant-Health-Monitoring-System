import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CROPS } from '../config/crops';
import { createPost, getPosts } from '../services/communityService';
import { useAction } from '../utils/useAction';

export function useCommunityController() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      setPosts(await getPosts());
    } catch (e) {
      setLoadError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const postAction = useAction(async () => {
    const post = await createPost({ text: text.trim(), crop: CROPS[0], author: user?.name });
    setPosts((prev) => [post, ...prev]);
    setText('');
  });

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return {
    posts,
    text,
    setText,
    submit: () => postAction.run(),
    posting: postAction.loading,
    postError: postAction.error,
    loadError,
    refreshing,
    refresh,
  };
}

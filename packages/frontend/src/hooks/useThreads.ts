import { useState, useEffect, useCallback } from 'react';
import { Thread, ThreadContent } from '../api/types';
import { threads } from '../services/api';

interface UseThreadsState {
  threads: Thread[];
  loading: boolean;
  error: string | null;
}

export const useThreads = () => {
  const [state, setState] = useState<UseThreadsState>({
    threads: [],
    loading: false,
    error: null,
  });

  const setLoading = (loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  };

  const setThreads = (threadsData: Thread[]) => {
    setState((prev) => ({ ...prev, threads: threadsData }));
  };

  // Fetch all threads
  const fetchThreads = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await threads.getAll();
      setThreads(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch threads');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch my threads
  const fetchMyThreads = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await threads.getMy();
      setThreads(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch your threads',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch other threads
  const fetchOtherThreads = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await threads.getOthers();
      setThreads(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch other threads',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new thread
  const createThread = useCallback(
    async (threadData: {
      title: string;
      description: string;
      maxLength: number;
      autoAccept: boolean;
      initialContent: string;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const newThread = await threads.create(threadData);
        setState((prev) => ({
          ...prev,
          threads: [newThread, ...prev.threads],
        }));
        return newThread;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create thread';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Delete a thread
  const deleteThread = useCallback(async (threadId: string) => {
    setLoading(true);
    setError(null);

    try {
      await threads.delete(threadId);
      setState((prev) => ({
        ...prev,
        threads: prev.threads.filter((thread) => thread.id !== threadId),
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete thread';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  return {
    // State
    threads: state.threads,
    loading: state.loading,
    error: state.error,

    // Actions
    fetchThreads,
    fetchMyThreads,
    fetchOtherThreads,
    createThread,
    deleteThread,

    // Utilities
    refetch: fetchThreads,
    clearError: () => setError(null),
  };
};

// Hook for managing pending contents
export const usePendingContents = (threadId: string) => {
  const [pendingContents, setPendingContents] = useState<ThreadContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingContents = useCallback(async () => {
    if (!threadId) return;

    setLoading(true);
    setError(null);
    try {
      const contents = await threads.getPendingContents(threadId);
      setPendingContents(contents);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch pending contents',
      );
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  const acceptContent = useCallback(async (contentId: string) => {
    try {
      await threads.acceptContent(contentId);
      // Remove from pending list after accepting
      setPendingContents((prev) =>
        prev.filter((content) => content.id !== contentId),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept content');
      throw err;
    }
  }, []);

  const rejectContent = useCallback(async (contentId: string) => {
    try {
      await threads.rejectContent(contentId);
      // Remove from pending list after rejecting
      setPendingContents((prev) =>
        prev.filter((content) => content.id !== contentId),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject content');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchPendingContents();
  }, [fetchPendingContents]);

  return {
    pendingContents,
    loading,
    error,
    fetchPendingContents,
    acceptContent,
    rejectContent,
    refetch: fetchPendingContents,
    clearError: () => setError(null),
  };
};

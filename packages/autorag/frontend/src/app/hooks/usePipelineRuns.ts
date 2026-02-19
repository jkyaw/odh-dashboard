import { useFetchState, FetchStateCallbackPromise } from 'mod-arch-core';
import React from 'react';
import { getPipelineRuns } from '~/app/api/pipelines';
import type { PipelineDefinition, PipelineRun } from '~/app/types';

export function usePipelineRuns(
  namespace: string,
  pipelineDefinitions: PipelineDefinition[],
): {
  runs: PipelineRun[];
  loaded: boolean;
  error: Error | undefined;
  refresh: () => Promise<void>;
} {
  const pipelineIds = React.useMemo(
    () => pipelineDefinitions.map((p) => p.id),
    [pipelineDefinitions],
  );

  const [data, loaded, error, refresh] = useFetchState<PipelineRun[]>(
    React.useCallback<FetchStateCallbackPromise<PipelineRun[]>>(
      async () => {
        if (!namespace || pipelineIds.length === 0) {
          return [];
        }
        return getPipelineRuns('', namespace, pipelineIds);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps -- pipelineIds from useMemo, stable when pipelineDefinitions unchanged
      [namespace, pipelineIds.join(',')],
    ),
    [],
  );

  const refreshWrapped = React.useCallback(async () => {
    await refresh();
  }, [refresh]);

  return {
    runs: data,
    loaded,
    error: error ?? undefined,
    refresh: refreshWrapped,
  };
}

import React from 'react';
import { useNamespaceSelector } from 'mod-arch-core';
import ApplicationsPage from '@odh-dashboard/internal/pages/ApplicationsPage';
import { AutoRagRunsTable } from '~/app/components/AutoRagRunsTable';
import { usePipelineDefinitions } from '~/app/hooks/usePipelineDefinitions';
import { usePipelineRuns } from '~/app/hooks/usePipelineRuns';

const MainPage: React.FC = () => {
  const { preferredNamespace } = useNamespaceSelector();
  const namespace = preferredNamespace?.name ?? '';
  const {
    pipelineDefinitions,
    loaded: defsLoaded,
    error: defsError,
    refresh: refreshDefs,
  } = usePipelineDefinitions(namespace);
  const {
    runs,
    loaded: runsLoaded,
    error: runsError,
    refresh: refreshRuns,
  } = usePipelineRuns(namespace, pipelineDefinitions);

  const loaded = defsLoaded && runsLoaded;
  const loadError = defsError ?? runsError;
  const hasRuns = runs.length > 0;

  const refresh = React.useCallback(async () => {
    await Promise.all([refreshDefs(), refreshRuns()]);
  }, [refreshDefs, refreshRuns]);

  return (
    <ApplicationsPage
      title="AutoRAG"
      description={
        <p>Automatically configure and optimize your Retrieval-Augmented Generation workflows.</p>
      }
      empty={!hasRuns}
      loadError={loadError}
      loaded={loaded}
      provideChildrenPadding
      removeChildrenTopPadding
    >
      {hasRuns && <AutoRagRunsTable runs={runs} namespace={namespace} refresh={refresh} />}
    </ApplicationsPage>
  );
};

export default MainPage;

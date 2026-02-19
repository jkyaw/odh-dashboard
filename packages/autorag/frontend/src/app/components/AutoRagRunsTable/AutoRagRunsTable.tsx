import * as React from 'react';
import Table from '@odh-dashboard/internal/components/table/Table';
import DashboardEmptyTableView from '@odh-dashboard/internal/concepts/dashboard/DashboardEmptyTableView';
import { deletePipelineRun } from '~/app/api/pipelines';
import type { PipelineRun } from '~/app/types';
import { autoRagRunsColumns } from './columns';
import AutoRagRunsTableRow from './AutoRagRunsTableRow';
import DeletePipelineRunModal from './DeletePipelineRunModal';
import RunDetailPlaceholderModal from './RunDetailPlaceholderModal';

type AutoRagRunsTableProps = {
  runs: PipelineRun[];
  namespace: string;
  useMock: boolean;
  refresh: () => Promise<void>;
};

const AutoRagRunsTable: React.FC<AutoRagRunsTableProps> = ({
  runs,
  namespace,
  useMock,
  refresh,
}) => {
  const [detailRun, setDetailRun] = React.useState<PipelineRun | null>(null);
  const [runToDelete, setRunToDelete] = React.useState<PipelineRun | null>(null);

  const handleDeleteConfirm = React.useCallback(async () => {
    if (!runToDelete) {
      return;
    }
    await deletePipelineRun(useMock, '', namespace, runToDelete.id);
    await refresh();
  }, [namespace, runToDelete, refresh, useMock]);

  return (
    <>
      <Table
        data-testid="autorag-runs-table"
        id="autorag-runs-table"
        enablePagination
        data={runs}
        columns={autoRagRunsColumns}
        defaultSortColumn={0}
        emptyTableView={<DashboardEmptyTableView onClearFilters={() => undefined} />}
        rowRenderer={(run) => (
          <AutoRagRunsTableRow
            key={run.id}
            run={run}
            onNameClick={setDetailRun}
            onDeleteClick={setRunToDelete}
          />
        )}
      />
      <RunDetailPlaceholderModal
        isOpen={detailRun !== null}
        onClose={() => setDetailRun(null)}
        runName={detailRun?.name}
      />
      <DeletePipelineRunModal
        isOpen={runToDelete !== null}
        run={runToDelete}
        onClose={() => {
          setRunToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default AutoRagRunsTable;

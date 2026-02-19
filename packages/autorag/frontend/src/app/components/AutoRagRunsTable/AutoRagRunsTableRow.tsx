import * as React from 'react';
import { Button } from '@patternfly/react-core';
import { Td, Tr } from '@patternfly/react-table';
import { TrashIcon } from '@patternfly/react-icons';
import type { PipelineRun } from '~/app/types';
import { autoRagRunsColumns } from './columns';

type AutoRagRunsTableRowProps = {
  run: PipelineRun;
  onNameClick: (run: PipelineRun) => void;
  onDeleteClick: (run: PipelineRun) => void;
};

const AutoRagRunsTableRow: React.FC<AutoRagRunsTableRowProps> = ({
  run,
  onNameClick,
  onDeleteClick,
}) => (
  <Tr>
    <Td dataLabel={autoRagRunsColumns[0].label}>
      <Button
        variant="link"
        isInline
        onClick={() => onNameClick(run)}
        data-testid={`run-name-${run.id}`}
      >
        {run.name}
      </Button>
    </Td>
    <Td dataLabel={autoRagRunsColumns[1].label}>{run.description ?? '—'}</Td>
    <Td dataLabel={autoRagRunsColumns[2].label}>{run.tags?.length ? run.tags.join(', ') : '—'}</Td>
    <Td dataLabel={autoRagRunsColumns[3].label}>{run.stats ?? '—'}</Td>
    <Td dataLabel={autoRagRunsColumns[4].label} isActionCell>
      <Button
        variant="plain"
        icon={<TrashIcon />}
        aria-label={`Delete run ${run.name}`}
        onClick={() => onDeleteClick(run)}
        data-testid={`delete-run-${run.id}`}
      />
    </Td>
  </Tr>
);

export default AutoRagRunsTableRow;

import type { SortableData } from '@odh-dashboard/internal/components/table';
import type { PipelineRun } from '~/app/types';

export const autoRagRunsColumns: SortableData<PipelineRun>[] = [
  {
    label: 'Name',
    field: 'name',
    sortable: (a, b) => a.name.localeCompare(b.name),
    width: 20,
  },
  {
    label: 'Description',
    field: 'description',
    sortable: (a, b) => (a.description ?? '').localeCompare(b.description ?? ''),
    width: 25,
  },
  {
    label: 'Tags',
    field: 'tags',
    sortable: (a, b) => (a.tags?.join(',') ?? '').localeCompare(b.tags?.join(',') ?? ''),
    width: 15,
  },
  {
    label: 'Stats',
    field: 'stats',
    sortable: (a, b) => (a.stats ?? '').localeCompare(b.stats ?? ''),
    width: 15,
  },
  {
    label: 'Action',
    field: 'action',
    sortable: false,
    width: 10,
  },
];

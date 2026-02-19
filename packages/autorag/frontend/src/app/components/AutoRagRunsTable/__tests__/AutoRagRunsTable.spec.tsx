/* eslint-disable camelcase -- PipelineRun type uses snake_case */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { deletePipelineRun } from '~/app/api/pipelines';
import type { PipelineRun } from '~/app/types';
import { AutoRagRunsTable } from '~/app/components/AutoRagRunsTable/index';

jest.mock('~/app/api/pipelines', () => ({
  deletePipelineRun: jest.fn(),
}));

jest.mock('@odh-dashboard/internal/components/table/Table', () => {
  const MockTable = ({
    data,
    rowRenderer,
    'data-testid': dataTestId,
  }: {
    data: PipelineRun[];
    rowRenderer: (run: PipelineRun) => React.ReactNode;
    'data-testid'?: string;
  }) => (
    <div data-testid={dataTestId ?? 'mock-table'}>
      {data.map((run) => (
        <div key={run.id} data-testid={`table-row-${run.id}`}>
          {rowRenderer(run)}
        </div>
      ))}
    </div>
  );
  return { __esModule: true, default: MockTable };
});

jest.mock('@odh-dashboard/internal/concepts/dashboard/DashboardEmptyTableView', () => ({
  __esModule: true,
  default: () => <div data-testid="empty-view">Empty</div>,
}));

const mockRuns: PipelineRun[] = [
  {
    id: 'r1',
    name: 'Run One',
    description: 'First run',
    tags: ['prod'],
    stats: '1h',
    pipeline_id: 'p1',
    pipeline_name: 'Pipeline 1',
    status: 'Succeeded',
    created_at: '2025-01-17',
  },
  {
    id: 'r2',
    name: 'Run Two',
    description: 'Second run',
    tags: ['test'],
    stats: '30m',
    pipeline_id: 'p2',
    pipeline_name: 'Pipeline 2',
    status: 'Running',
    created_at: '2025-01-16',
  },
];

describe('AutoRagRunsTable', () => {
  const mockRefresh = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render table with runs', () => {
    render(<AutoRagRunsTable runs={mockRuns} namespace="my-ns" useMock refresh={mockRefresh} />);

    expect(screen.getByTestId('autorag-runs-table')).toBeInTheDocument();
  });

  it('should render run names as clickable buttons', () => {
    render(<AutoRagRunsTable runs={mockRuns} namespace="my-ns" useMock refresh={mockRefresh} />);

    expect(screen.getByTestId('run-name-r1')).toHaveTextContent('Run One');
    expect(screen.getByTestId('run-name-r2')).toHaveTextContent('Run Two');
  });

  it('should open detail placeholder modal when run name is clicked', async () => {
    const user = userEvent.setup();
    render(<AutoRagRunsTable runs={mockRuns} namespace="my-ns" useMock refresh={mockRefresh} />);

    await user.click(screen.getByTestId('run-name-r1'));

    expect(screen.getByRole('dialog', { name: 'Run detail placeholder' })).toBeInTheDocument();
    expect(screen.getByText(/Detail page for run "Run One"/)).toBeInTheDocument();
  });

  it('should open delete modal when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<AutoRagRunsTable runs={mockRuns} namespace="my-ns" useMock refresh={mockRefresh} />);

    await user.click(screen.getByTestId('delete-run-r1'));

    expect(screen.getByRole('dialog', { name: 'Delete pipeline run' })).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete run "Run One"/)).toBeInTheDocument();
  });

  it('should call deletePipelineRun and refresh when delete is confirmed', async () => {
    const deleteMock = jest.mocked(deletePipelineRun);
    deleteMock.mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<AutoRagRunsTable runs={mockRuns} namespace="my-ns" useMock refresh={mockRefresh} />);

    await user.click(screen.getByTestId('delete-run-r1'));
    await user.click(screen.getByRole('button', { name: /delete/i }));

    expect(deleteMock).toHaveBeenCalledWith(true, '', 'my-ns', 'r1');
    expect(mockRefresh).toHaveBeenCalled();
  });
});

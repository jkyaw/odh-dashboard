import type { PipelineDefinition, PipelineRun } from '~/app/types';
import {
  getMockPipelineDefinitions,
  getMockPipelineRuns,
  deleteMockPipelineRun,
} from '~/app/api/pipelinesMock';

export async function getPipelineDefinitions(
  useMock: boolean,
  _hostPath: string,
  namespace: string,
): Promise<PipelineDefinition[]> {
  if (useMock) {
    return getMockPipelineDefinitions(namespace);
  }
  // TODO: Replace with real BFF call when available
  // const response = await restGET(hostPath, `${URL_PREFIX}/api/${BFF_API_VERSION}/namespaces/${namespace}/pipeline-definitions`, {}, opts);
  return getMockPipelineDefinitions(namespace);
}

export async function getPipelineRuns(
  useMock: boolean,
  _hostPath: string,
  namespace: string,
  pipelineIds: string[],
): Promise<PipelineRun[]> {
  if (useMock) {
    return getMockPipelineRuns(namespace, pipelineIds);
  }
  // TODO: Replace with real BFF call when available
  return getMockPipelineRuns(namespace, pipelineIds);
}

export async function deletePipelineRun(
  useMock: boolean,
  _hostPath: string,
  namespace: string,
  runId: string,
): Promise<void> {
  if (useMock) {
    return deleteMockPipelineRun(namespace, runId);
  }
  // TODO: Replace with real BFF call when available
  return deleteMockPipelineRun(namespace, runId);
}

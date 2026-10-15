# AutoML

## Overview

- Automates ML pipeline optimization for OpenShift AI using Kubeflow Pipelines and AutoGluon; evaluates configurations toward deployable model artifacts.
- Generally available in Red Hat OpenShift AI 3.6, with a federated React UI and Go BFF for pipeline and model-registry workflows.

## Design Intent

- **BFF (single ingress)**: Cluster auth chain; proxies experiment orchestration to Kubeflow Pipelines; uses the Kubernetes API for resources.
- **Serving by deployment mode**:
  - Standalone and kubeflow: BFF serves compiled frontend assets.
  - Federated: BFF exposes API routes only; main ODH Dashboard hosts the UI.
- **Data flow**: React → BFF (`/api/v1/...`) → Kubeflow Pipelines and/or Kubernetes → JSON to the UI.
- **Local dev**: Without live endpoints, `cmd/main.go` can use in-memory mocks for Kubernetes and HTTP (KFP) clients.
- **Module Federation**: Remote name `automl`; the dashboard exposes AutoML navigation and routes when Data Science Pipelines are available and pipelines are enabled.

## GA Enablement And Compatibility

AutoML visibility uses the Data Science Pipelines component and the dashboard's pipelines setting. The legacy `automl` config field defaults to `false` and remains accepted for compatibility, but no longer controls the UI. Existing `automl: false` values therefore do not hide AutoML.

| Gate                                             | Behavior                                                                                                                                                                                                                                                             |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OdhDashboardConfig.spec.dashboardConfig.automl` | Legacy field defaults to `false` and is retained for compatibility. The current dashboard ignores it for UI visibility.                                                                                                                                              |
| AutoML area extension                            | Requires `disablePipelines: false` and `DataScienceStackComponent.DS_PIPELINES` to be `Managed` or `Unmanaged`; navigation and routes are gated by this area.                                                                                                        |
| `Dashboard.spec.modules.automl.state`            | When the Dashboard is not `Removed`, the operator deploys `automl-ui` if there is no explicit `Disabled` override and `aipipelines` is `Managed` or `Unmanaged`. An explicit module disable takes precedence.                                                        |
| Managed pipeline definitions                     | AutoML pipeline-server setup enables managed pipelines by default for newly configured servers. A dashboard upgrade does not modify existing DSPAs; an administrator must enable managed pipelines on an existing server if AutoML pipeline definitions are missing. |
| Module sidecar                                   | Sidecar deployment follows the operator module registry and `aipipelines` availability, independently of dashboard UI visibility.                                                                                                                                    |

AutoML GA does not migrate or rewrite existing AutoML configurations or AutoGluon InferenceService resources. Data Science Pipelines and managed pipeline definitions remain service prerequisites. This promotion does not change the shared `autox-core/services` library.

## Key Concepts

| Term                      | Definition                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **AutoML run**            | A single optimization campaign: Kubeflow Pipeline experiments exploring parameter combinations for a dataset. |
| **AutoGluon**             | ML library that performs automated model selection and hyperparameter search within pipeline runs.            |
| **Optimal configuration** | Parameter set with the best evaluation metric across a campaign; candidate for model registration.            |
| **BFF**                   | Go backend-for-frontend: auth, cluster API proxy, static assets (non-federated).                              |
| **Deployment mode**       | `standalone`, `kubeflow`, or `federated` — controls theme, asset serving, and integration points.             |

## Interactions

| Dependency         | Type             | Details                                                                      |
| ------------------ | ---------------- | ---------------------------------------------------------------------------- |
| Kubeflow Pipelines | External API     | BFF proxies experiment creation, run monitoring, and artifact retrieval.     |
| Main ODH Dashboard | Host application | Loads AutoML via Module Federation in federated mode; provides auth context. |
| model-registry     | Package          | Registers optimal model configurations after a successful campaign.          |

## Known Issues / Gotchas

- Existing DSPAs are not automatically patched during a dashboard upgrade; enable managed AutoML pipelines if an existing server is missing their definitions.
- Kubeflow mode uses Material UI, not PatternFly v6 — guard PF imports if you share code across modes.
- Without a live Kubeflow Pipelines endpoint, enable the HTTP client mock or the BFF may fail at startup when mocks are off.
- Docker deployment is not documented here; use the package `Makefile` targets for local workflows.
- The BFF exposes `/healthcheck` for probes; contract tests expect it on that path.

## Time Series Dataset Guidance

- Dataset metadata comes from the AutoML BFF at `/automl/api/v1/s3/files/{key}?view=schema` after upload or S3 file selection. The BFF infers column types from a bounded CSV sample; the frontend does not parse CSV files.
- After the user selects a numeric target, a confirmed timestamp column takes precedence over the target's classification/regression suggestion. The user can override the recommendation; the selected `task_type` is sent to the pipeline.
- A two-column dataset needs a timestamp and a numeric target. A single-item time series needs no manual item ID column. For two-column datasets, the ID dropdown is disabled and displays "Auto-generated ID column". For datasets with three or more columns, the UI requires an ID selection. The BFF also checks the CSV for direct time series requests without an ID and allows omission only for two columns matching the requested target and timestamp; read failures prevent run creation. Synthetic ID injection is owned by the pipeline (RHOAIENG-81174).
- Recognized timestamps include ISO 8601 dates and datetimes (with or without timezone), `YYYY-MM-DD HH:mm:ss`, `YYYY/MM/DD`, slash- or hyphen-separated month/day/year or day/month/year dates, and RFC 1123/822 dates. Prefer ISO 8601 to avoid day/month ambiguity. This is a supported subset of pandas-parseable strings, not every format pandas accepts.
- Unix epoch integers, arbitrary string columns named `date`, and non-numeric targets do not trigger automatic time series recommendation. For unrecognized timestamps, select time series manually and choose the timestamp column; ensure the pipeline supports the representation or convert it to ISO 8601.
- Recommendations are sample-based guidance, not full-dataset validation. Multi-item detection without an ID and multivariate/multi-target inference are outside this heuristic.

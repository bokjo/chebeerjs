import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

interface MyAlertPolicyArgs {
  name: pulumi.Input<string>;
  namespace: pulumi.Input<string>;
  app: pulumi.Input<string>;
  project: pulumi.Input<string>;
  environment: pulumi.Input<string>;
  alertPolicyConfig: {
    alertOn: {
      cpu: {
        limitUtilization: pulumi.Input<number>;
        requestUtilization: pulumi.Input<number>;
      };
      memory: {
        appContainer: pulumi.Input<number>;
        istioProxyContainer: pulumi.Input<number>;
      };
      restartCount: pulumi.Input<number>;
    };
    resourceLimits: {
      requests: {
        cpu: pulumi.Input<string>;
        memory: pulumi.Input<string>;
      };
      limits: {
        cpu: pulumi.Input<string>;
        memory: pulumi.Input<string>;
      };
    };
    notificationChannels: pulumi.Input<string>[];
  };
}

export default class MyAlertPolicy extends pulumi.ComponentResource {
  public readonly alertPolicy: gcp.monitoring.AlertPolicy;

  constructor(
    name: string,
    args: MyAlertPolicyArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("custom:My:AlertPolicy", name, args, opts);

    const alertPolicyInstance = new gcp.monitoring.AlertPolicy(
      args.name as string,
      {
        alertStrategy: {
          autoClose: "604800s",
        },
        combiner: "OR",
        conditions: [
          {
            conditionThreshold: {
              aggregations: [
                {
                  alignmentPeriod: "300s",
                  perSeriesAligner: "ALIGN_MEAN",
                },
              ],
              comparison: "COMPARISON_GT",
              duration: "0s",
              filter: pulumi.interpolate`resource.type = "k8s_container" AND (resource.labels.container_name = "${args.app}" AND resource.labels.namespace_name = "${args.namespace}" AND resource.labels.project_id = "${args.project}") AND metric.type = "kubernetes.io/container/memory/used_bytes" AND metric.labels.memory_type = "non-evictable" AND metadata.user_labels.app = "${args.app}"`,
              thresholdValue:
                Number(args.alertPolicyConfig.resourceLimits.limits.memory) *
                Number(args.alertPolicyConfig.alertOn.memory.appContainer),
              trigger: {
                count: 1,
              },
            },
            displayName: pulumi.interpolate`k8s-memory-usage-app-${args.app}`,
          },
          {
            conditionThreshold: {
              aggregations: [
                {
                  alignmentPeriod: "300s",
                  perSeriesAligner: "ALIGN_MEAN",
                },
              ],
              comparison: "COMPARISON_GT",
              duration: "0s",
              filter: pulumi.interpolate`resource.type = "k8s_container" AND (resource.labels.container_name = "istio-proxy" AND resource.labels.namespace_name = "${args.namespace}" AND resource.labels.project_id = "${args.project}") AND metric.type = "kubernetes.io/container/memory/used_bytes" AND metric.labels.memory_type = "non-evictable" AND metadata.user_labels.app = "${args.app}"`,
              thresholdValue:
                Number(args.alertPolicyConfig.resourceLimits.requests.memory) *
                Number(
                  args.alertPolicyConfig.alertOn.memory.istioProxyContainer,
                ),
              // TODO: This might not be relevant for istio limit, because it is different from the app container limit... maybe limit it to something like 100MB?
              trigger: {
                count: 1,
              },
            },
            displayName: pulumi.interpolate`k8s-memory-usage-app-${args.app}-istio-proxy`,
          },
          {
            conditionThreshold: {
              aggregations: [
                {
                  alignmentPeriod: "60s",
                  perSeriesAligner: "ALIGN_SUM",
                },
                {
                  alignmentPeriod: "60s",
                  crossSeriesReducer: "REDUCE_COUNT",
                  groupByFields: ["resource.label.pod_name"],
                  perSeriesAligner: "ALIGN_INTERPOLATE",
                },
              ],
              comparison: "COMPARISON_LT",
              duration: "60s",
              filter: pulumi.interpolate`resource.type = "k8s_container" AND (resource.labels.container_name = "${args.app}" AND resource.labels.namespace_name = "${args.namespace}" AND resource.labels.project_id = "${args.project}") AND metric.type = "kubernetes.io/container/uptime" AND metadata.user_labels.app = "${args.app}"`,
              thresholdValue: 1,
              trigger: {
                percent: 100,
              },
            },
            displayName: pulumi.interpolate`k8s-uptime-app-${args.app}`,
          },
          {
            conditionThreshold: {
              aggregations: [
                {
                  alignmentPeriod: "60s",
                  perSeriesAligner: "ALIGN_RATE",
                },
                {
                  alignmentPeriod: "60s",
                  perSeriesAligner: "ALIGN_SUM",
                },
              ],
              comparison: "COMPARISON_GT",
              duration: "0s",
              filter: pulumi.interpolate`resource.type = "k8s_container" AND (resource.labels.project_id = "${args.project}" AND resource.labels.namespace_name = "${args.namespace}" AND resource.labels.container_name = "${args.app}") AND metric.type = "kubernetes.io/container/restart_count" AND metadata.user_labels.app = "${args.app}"`,
              thresholdValue: args.alertPolicyConfig.alertOn.restartCount,
              trigger: {
                count: 1,
              },
            },
            displayName: pulumi.interpolate`k8s-restart-count-app-${args.app}`,
          },
          {
            conditionThreshold: {
              aggregations: [
                {
                  alignmentPeriod: "60s",
                  perSeriesAligner: "ALIGN_MEAN",
                },
              ],
              comparison: "COMPARISON_GT",
              duration: "0s",
              filter: pulumi.interpolate`resource.type = "k8s_container" AND (resource.labels.project_id = "${args.project}" AND resource.labels.namespace_name = "${args.namespace}" AND resource.labels.container_name = "${args.app}") AND metric.type = "kubernetes.io/container/cpu/limit_utilization" AND metadata.user_labels.app = "${args.app}"`,
              thresholdValue:
                Number(args.alertPolicyConfig.resourceLimits.limits.cpu) *
                Number(args.alertPolicyConfig.alertOn.cpu.limitUtilization),
              trigger: {
                count: 1,
              },
            },
            displayName: pulumi.interpolate`k8s-cpu-limit-1m-50p-utilization-app-${args.app}`,
          },
        ],
        displayName: args.name,
        documentation: {
          content: pulumi.interpolate`K8s pod/container memory usage

          app: ${args.app}
          project: ${args.project}
          environment: ${args.environment}

          1. ${args.app} container > ${
            Number(args.alertPolicyConfig.alertOn.memory.appContainer) * 100
          }% memory usage over 5 min.
          2. istio-proxy container > ${
            Number(args.alertPolicyConfig.alertOn.memory.istioProxyContainer) *
            100
          }% memory usage over 5 min.
          3. ${args.app} uptime < 1 (alert on svc down)
          4. ${args.app} restarts > ${args.alertPolicyConfig.alertOn.restartCount} in 5 min.
          5. ${args.app} CPU limit utilization over > ${
            Number(args.alertPolicyConfig.alertOn.cpu.limitUtilization) * 100
          }% over 1 min.`,
        },
        notificationChannels: args.alertPolicyConfig.notificationChannels,
        project: args.project,
        userLabels: {
          app: args.app,
          environment: args.environment,
        },
      },
      opts,
    );

    this.alertPolicy = alertPolicyInstance;
  }
}

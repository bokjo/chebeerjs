import * as pulumi from "@pulumi/pulumi";
import { HorizontalPodAutoscaler } from "@pulumi/kubernetes/autoscaling/v1";

interface MyHorizontalPodAutoscalerArgs {
  name: string;
  app: string;
  namespace: pulumi.Input<string>;
  hpaConfig: {
    minReplicas: pulumi.Input<number>;
    maxReplicas: pulumi.Input<number>;
    targetCPUUtilizationPercentage: pulumi.Input<number>;
    deploymentName: pulumi.Input<string>;
  };
  extraLabels?: pulumi.Input<{ [key: string]: pulumi.Input<string> }>;
  annotations?: pulumi.Input<{ [key: string]: pulumi.Input<string> }>;
}

export default class MyHorizontalPodAutoscaler extends pulumi.ComponentResource {
  public readonly hpa: HorizontalPodAutoscaler;

  constructor(
    name: string,
    args: MyHorizontalPodAutoscalerArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("custom:My:HorizontalPodAutoscaler", name, args, opts);

    const hpaInstance = new HorizontalPodAutoscaler(
      args.name,
      {
        metadata: {
          name: args.name,
          labels: {
            app: args.app,
            name: args.name,
            ...args.extraLabels,
          },
          namespace: args.namespace,
          annotations: args.annotations,
        },
        spec: {
          minReplicas: args.hpaConfig.minReplicas,
          maxReplicas: args.hpaConfig.maxReplicas,
          targetCPUUtilizationPercentage:
            args.hpaConfig.targetCPUUtilizationPercentage,
          scaleTargetRef: {
            apiVersion: "apps/v1",
            kind: "Deployment",
            name: args.hpaConfig.deploymentName,
          },
        },
      },
      opts,
    );

    this.hpa = hpaInstance;
  }
}

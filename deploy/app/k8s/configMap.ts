import { ConfigMap } from "@pulumi/kubernetes/core/v1";
import * as pulumi from "@pulumi/pulumi";

interface MyConfigMapArgs {
  name: string;
  app: string;
  namespace: pulumi.Input<string>;
  data: pulumi.Input<{ [key: string]: pulumi.Input<string> }>;
  immutable?: pulumi.Input<boolean>;
  extraLabels?: pulumi.Input<{ [key: string]: pulumi.Input<string> }>;
  annotations?: pulumi.Input<{ [key: string]: pulumi.Input<string> }>;
}

/**
 * Creates a custom ConfigMap resource with the given unique name and parameters.
 *
 * @param args Predefined arguments to use for ConfigMap creation.
 */
export default class MyConfigMap extends pulumi.ComponentResource {
  public readonly configMap: ConfigMap;

  constructor(
    name: string,
    args: MyConfigMapArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("custom:My:ConfigMap", name, args, opts);

    const configMapInstance = new ConfigMap(
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
        data: args.data ? args.data : {},
        immutable: args.immutable,
      },
      opts,
    );

    this.configMap = configMapInstance;
  }
}

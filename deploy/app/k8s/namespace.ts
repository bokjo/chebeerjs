import { Namespace } from "@pulumi/kubernetes/core/v1";
import * as pulumi from "@pulumi/pulumi";

interface MyNamespaceArgs {
  name: string;
  app: string;
  extraLabels?: pulumi.Input<{ [key: string]: pulumi.Input<string> }>;
  annotations?: pulumi.Input<{ [key: string]: pulumi.Input<string> }>;
}

/**
 * Creates a custom Namespace resource with the given unique name and parameters.
 *
 * @param args Predefined arguments to use for Namespace creation.
 */
export default class MyNamespace extends pulumi.ComponentResource {
  public readonly namespace: Namespace;

  constructor(
    name: string,
    args: MyNamespaceArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("custom:My:Namespace", name, args, opts);

    const namespaceInstance = new Namespace(
      args.name,
      {
        metadata: {
          name: args.name,
          labels: {
            app: args.app,
            name: args.name,
            ...args.extraLabels,
          },
          annotations: args.annotations,
        },
      },
      opts,
    );

    this.namespace = namespaceInstance;
  }
}

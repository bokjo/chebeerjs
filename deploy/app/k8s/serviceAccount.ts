import * as pulumi from "@pulumi/pulumi";
import { ServiceAccount } from "@pulumi/kubernetes/core/v1";

interface MyServiceAccountArgs {
  name: string;
  app: string;
  namespace: pulumi.Input<string>;
  extraLabels?: pulumi.Input<{ [key: string]: pulumi.Input<string> }>;
  annotations?: pulumi.Input<{ [key: string]: pulumi.Input<string> }>;
}

export default class MyServiceAccount extends pulumi.ComponentResource {
  public readonly serviceAccount: ServiceAccount;

  constructor(
    name: string,
    args: MyServiceAccountArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("custom:My:ServiceAccount", name, args, opts);

    const serviceAccountInstance = new ServiceAccount(
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
      },
      opts,
    );

    this.serviceAccount = serviceAccountInstance;
  }
}

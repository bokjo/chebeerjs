import { Secret } from "@pulumi/kubernetes/core/v1";
import * as pulumi from "@pulumi/pulumi";

interface MySecretArgs {
  name: string;
  app: string;
  namespace: pulumi.Input<string>;
  secretDataKey: string;
  secretDataValue: pulumi.Input<string>;
  type?: pulumi.Input<string>;
  immutable?: pulumi.Input<boolean>;
  extraLabels?: pulumi.Input<{ [key: string]: pulumi.Input<string> }>;
  annotations?: pulumi.Input<{ [key: string]: pulumi.Input<string> }>;
}

export default class MySecret extends pulumi.ComponentResource {
  public readonly secret: Secret;

  constructor(
    name: string,
    args: MySecretArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("custom:My:Secret", name, args, opts);

    const secretInstance = new Secret(
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
        type: args.type ? args.type : "Opaque",
        data: {
          // TODO: improve it... maybe add option for multiple key/values!
          [args.secretDataKey]: args.secretDataValue, // TODO: make sure that the value is base64 encoded string!
        },
        immutable: args.immutable,
      },
      opts,
    );

    this.secret = secretInstance;
  }
}

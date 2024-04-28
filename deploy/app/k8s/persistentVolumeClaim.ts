import { PersistentVolumeClaim } from "@pulumi/kubernetes/core/v1";
import * as pulumi from "@pulumi/pulumi";

interface MyPersistentVolumeClaimArgs {
  name: string;
  app: string;
  namespace: pulumi.Input<string>;
  storageCapacity?: string; // TODO: Questionable! Add meaningful defaults or rely on the spec provided only!
  persistentVolumeName?: pulumi.Input<string>; // TODO: might not be needed for GKE!
  extraLabels?: pulumi.Input<{ [key: string]: pulumi.Input<string> }>;
  annotations?: pulumi.Input<{ [key: string]: pulumi.Input<string> }>;
}

export default class MyPersistentVolumeClaim extends pulumi.ComponentResource {
  public readonly persistentVolumeClaim: PersistentVolumeClaim;

  constructor(
    name: string,
    args: MyPersistentVolumeClaimArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("custom:My:PersistentVolumeClaim", name, args, opts);

    const persistentVolumeClaimInstance = new PersistentVolumeClaim(
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
          accessModes: ["ReadWriteMany"],
          resources: {
            requests: {
              storage: args.storageCapacity ? args.storageCapacity : "1Gi",
            },
          },
          storageClassName: "",
          volumeName: args.persistentVolumeName
            ? args.persistentVolumeName
            : `${args.app}-pv`,
        },
      },
      opts,
    );

    this.persistentVolumeClaim = persistentVolumeClaimInstance;
  }
}

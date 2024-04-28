import { PersistentVolume } from "@pulumi/kubernetes/core/v1";
import * as pulumi from "@pulumi/pulumi";

interface MyPersistentVolumeArgs {
  name: string;
  app: string;
  namespace: pulumi.Input<string>; // TODO: Remove later - PV is not an namespaced K8s object!
  pvcName?: pulumi.Input<string>;
  storageCapacity?: string; // TODO: Questionable! Add meaningful defaults or rely on the spec provided only!
  volumeMountPath?: string;
  persistentVolumeReclaimPolicy?: "Retain" | "Recycle" | "Delete";
  nfsRoot?: boolean;
  extraLabels?: pulumi.Input<{ [key: string]: pulumi.Input<string> }>;
  annotations?: pulumi.Input<{ [key: string]: pulumi.Input<string> }>;
}

export default class MyPersistentVolume extends pulumi.ComponentResource {
  public readonly persistentVolume: PersistentVolume;

  constructor(
    name: string,
    args: MyPersistentVolumeArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("custom:My:PersistentVolume", name, args, opts);

    const persistentVolumeInstance = new PersistentVolume(
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
          capacity: {
            storage: args.storageCapacity ? args.storageCapacity : "1Gi",
          },
          accessModes: ["ReadWriteMany"],
          claimRef: {
            kind: "PersistentVolumeClaim",
            apiVersion: "v1",
            name: args.pvcName ? args.pvcName : `${args.app}-pvc`, // TODO: Test on GKE without explicit claimRef. it should work
            namespace: args.namespace,
          },
          // hostPath: {
          //   // TODO: [TEMP] testing... change to NFS for GKE cluster (add proper default for NFS mount path)
          //   path: args.volumeMountPath ? args.volumeMountPath : "/tmp/share",
          // },
          nfs: {
            // path: `/${args.app}`,
            path: args.nfsRoot ? `/` : `/${args.app}`, // TODO: add `/${args.app}-propellor` later after initial testing, stupid ass app!
            server: "nfs-server-svc.default.svc.cluster.local",
          },
          persistentVolumeReclaimPolicy: args.persistentVolumeReclaimPolicy
            ? args.persistentVolumeReclaimPolicy
            : "Retain",
        },
      },
      opts,
    );

    this.persistentVolume = persistentVolumeInstance;
  }
}

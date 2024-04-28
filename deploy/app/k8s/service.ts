import { Service } from "@pulumi/kubernetes/core/v1";
import * as pulumi from "@pulumi/pulumi";

interface MyServiceArgs {
  name: string;
  app: string;
  namespace: pulumi.Input<string>;
  loadBalancerIp?: pulumi.Input<string>;
  servicePort: pulumi.Input<number>;
  serviceType?: "NodePort" | "ClusterIP" | "LoadBalancer"; // TODO: make it custom ENUM or pulumi helper!
  extraLabels?: pulumi.Input<{ [key: string]: pulumi.Input<string> }>;
  annotations?: pulumi.Input<{ [key: string]: pulumi.Input<string> }>;
}

export default class MyService extends pulumi.ComponentResource {
  public readonly service: Service;

  constructor(
    name: string,
    args: MyServiceArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("custom:My:Service", name, args, opts);
    const serviceInstance = new Service(
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
          selector: {
            app: args.app,
          },
          type: args.serviceType ? args.serviceType : "ClusterIP",
          loadBalancerIP: args.loadBalancerIp,
          ports: [
            {
              name: `http-${args.app}`,
              port: args.servicePort,
              protocol: "TCP",
              targetPort: 80,
            },
          ],
        },
      },
      opts,
    );

    this.service = serviceInstance;
  }
}

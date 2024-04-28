import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";
import { Deployment } from "@pulumi/kubernetes/apps/v1";

interface MyDeploymentArgs {
  name: string;
  app: string;
  namespace: pulumi.Input<string>;
  deployConfig: {
    images: {
      appContainer: {
        image: string;
        tag: string;
      };
    };
    resources: {
      requests: {
        cpu?: pulumi.Input<string>;
        memory?: pulumi.Input<string>;
      };
      limits: {
        cpu?: pulumi.Input<string>;
        memory?: pulumi.Input<string>;
      };
    };
    db: {
      instanceName: pulumi.Input<string>;
      port: string;
      gcpProject: string;
      gcpRegion: string;
    };
  };
  replicas?: number;
  serviceAccountName?: pulumi.Input<string>;
  myServiceConfigMapName: pulumi.Input<string>;
  spec?: pulumi.Input<k8s.types.input.apps.v1.DeploymentSpec>;
  extraLabels?: pulumi.Input<{ [key: string]: pulumi.Input<string> }>;
  annotations?: pulumi.Input<{ [key: string]: pulumi.Input<string> }>;
}

export default class MyDeployment extends pulumi.ComponentResource {
  public readonly deployment: Deployment;

  constructor(
    name: string,
    args: MyDeploymentArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("custom:My:Deployment", name, args, opts);

    const {
      images,
      // db,
    } = args.deployConfig;

    const deploymentInstance = new Deployment(
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
          replicas: args.replicas ? args.replicas : 1,
          selector: {
            matchLabels: {
              app: args.app,
            },
          },
          template: {
            metadata: {
              labels: {
                app: args.app,
              },
            },
            spec: {
              serviceAccountName: args.serviceAccountName
                ? args.serviceAccountName
                : "default",
              containers: [
                {
                  name: args.app,
                  image: `${images.appContainer.image}:${images.appContainer.tag}`,
                  imagePullPolicy: "IfNotPresent",
                  resources: {
                    requests: {
                      cpu: args.deployConfig.resources.requests.cpu
                        ? args.deployConfig.resources.requests.cpu
                        : "0.1",
                      memory: args.deployConfig.resources.requests.memory
                        ? args.deployConfig.resources.requests.memory
                        : String(128 * 1024 * 1024), //128Mi
                    },
                    limits: {
                      cpu: args.deployConfig.resources.limits.cpu
                        ? args.deployConfig.resources.limits.cpu
                        : "0.2",
                      memory: args.deployConfig.resources.limits.memory
                        ? args.deployConfig.resources.limits.memory
                        : String(256 * 1024 * 1024), //256Mi
                    },
                  },
                  env: [
                    {
                      name: "APP_NAME",
                      valueFrom: {
                        configMapKeyRef: {
                          key: "APP_NAME",
                          name: args.myServiceConfigMapName,
                        },
                      },
                    },
                    {
                      name: "GCP_PROJECT",
                      valueFrom: {
                        configMapKeyRef: {
                          key: "GCP_PROJECT",
                          name: args.myServiceConfigMapName,
                        },
                      },
                    },
                    {
                      name: "DEFAULT_SECRET_VERSION",
                      valueFrom: {
                        configMapKeyRef: {
                          key: "DEFAULT_SECRET_VERSION",
                          name: args.myServiceConfigMapName,
                        },
                      },
                    },
                    {
                      name: "CACHE_TTL",
                      valueFrom: {
                        configMapKeyRef: {
                          key: "CACHE_TTL",
                          name: args.myServiceConfigMapName,
                        },
                      },
                    },
                    {
                      name: "DB_HOST",
                      valueFrom: {
                        configMapKeyRef: {
                          key: "DB_HOST",
                          name: args.myServiceConfigMapName,
                        },
                      },
                    },
                    {
                      name: "DB_USERNAME",
                      valueFrom: {
                        configMapKeyRef: {
                          key: "DB_USERNAME",
                          name: args.myServiceConfigMapName,
                        },
                      },
                    },
                    {
                      name: "DB_PASSWORD",
                      valueFrom: {
                        configMapKeyRef: {
                          key: "DB_PASSWORD",
                          name: args.myServiceConfigMapName,
                        },
                      },
                    },
                  ],
                },
                // {
                //   name: "cloud-sql-proxy",
                //   image: "gcr.io/cloudsql-docker/gce-proxy:latest", // https://console.cloud.google.com/gcr/images/cloudsql-docker/GLOBAL/gce-proxy
                //   imagePullPolicy: "IfNotPresent",
                //   command: [
                //     "/cloud_sql_proxy",
                //     pulumi.interpolate`-instances=${db.gcpProject}:${db.gcpRegion}:${db.instanceName}=tcp:${db.port}`,
                //     `-ip_address_types=PRIVATE`,
                //     "-log_debug_stdout=true",
                //     "-structured_logs",
                //   ],
                //   resources: {
                //     requests: {
                //       cpu: "10m",
                //       memory: String(10 * 1024 * 1024), //10Mi
                //     },
                //   },
                // },
              ],
              restartPolicy: "Always",
              terminationGracePeriodSeconds: 20,
            },
          },
        },
      },
      {
        customTimeouts: {
          create: "5m",
          update: "1m",
          delete: "1m",
        },
        ...opts,
      },
    );

    this.deployment = deploymentInstance;
  }
}

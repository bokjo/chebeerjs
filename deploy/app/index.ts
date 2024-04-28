import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";
import MyDeployment from "./k8s/deployment";
import MyService from "./k8s/service";
import MyHorizontalPodAutoscaler from "./k8s/hpa";
import MyServiceAccount from "./k8s/serviceAccount";
import MyConfigMap from "./k8s/configMap";
import { DeployConfig } from "../interfaces";

interface MyAppArgs {
  name: string;
  app: string;
  namespace: pulumi.Input<string>;
  project: pulumi.Input<string>;
  environment: pulumi.Input<string>;
  k8sProvider: k8s.Provider;
  config: {
    loadBalancerIp?: pulumi.Input<string>;
    servicePort: pulumi.Input<number>;
    serviceType?: "NodePort" | "ClusterIP" | "LoadBalancer";
    replicas?: number;
    appConfig: pulumi.Input<{ [key: string]: pulumi.Input<string> }>; // TODO: TBD! Config object structure
    deployConfig: DeployConfig;
    hpaConfig: {
      minReplicas: pulumi.Input<number>;
      maxReplicas: pulumi.Input<number>;
      targetCPUUtilizationPercentage: pulumi.Input<number>;
    };
    // alertPolicyConfig: {
    //   alertOn: {
    //     cpu: {
    //       limitUtilization: pulumi.Input<number>;
    //       requestUtilization: pulumi.Input<number>;
    //     };
    //     memory: {
    //       appContainer: pulumi.Input<number>;
    //       istioProxyContainer: pulumi.Input<number>;
    //     };
    //     restartCount: pulumi.Input<number>;
    //   };
    //   resourceLimits: {
    //     requests: {
    //       cpu: pulumi.Input<string>;
    //       memory: pulumi.Input<string>;
    //     };
    //     limits: {
    //       cpu: pulumi.Input<string>;
    //       memory: pulumi.Input<string>;
    //     };
    //   };
    //   notificationChannels: pulumi.Input<string>[];
    // };
  };
}

export default class MyApp extends pulumi.ComponentResource {
  public readonly appServiceAccount: k8s.core.v1.ServiceAccount;

  public readonly appConfigMap: k8s.core.v1.ConfigMap;

  public readonly appDeployment: k8s.apps.v1.Deployment;

  public readonly appService: k8s.core.v1.Service;

  public readonly appHpa: k8s.autoscaling.v1.HorizontalPodAutoscaler;

  constructor(
    name: string,
    args: MyAppArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("custom:My:App", name, args, opts);

    const serviceAccountName = `${args.app}-sa`;
    const appServiceAccountInstance = new MyServiceAccount(
      serviceAccountName,
      {
        name: serviceAccountName,
        app: args.app,
        namespace: args.namespace,
      },
      {
        provider: args.k8sProvider,
      },
    );

    const cmName = `${args.app}-cm`;
    const appCMInstance = new MyConfigMap(
      cmName,
      {
        name: cmName,
        app: args.app,
        namespace: args.namespace,
        data: args.config.appConfig ? args.config.appConfig : {},
      },
      {
        provider: args.k8sProvider,
      },
    );

    const deploymentName = `${args.app}-deploy`;
    const appDeploymentInstance = new MyDeployment(
      deploymentName,
      {
        name: deploymentName,
        app: args.app,
        namespace: args.namespace,
        deployConfig: args.config.deployConfig,
        serviceAccountName:
          appServiceAccountInstance.serviceAccount.metadata.name,
        replicas: args.config.replicas ? args.config.replicas : undefined,
        myServiceConfigMapName: appCMInstance.configMap.metadata.name,
      },
      {
        provider: args.k8sProvider,
        dependsOn: [
          appServiceAccountInstance.serviceAccount,
          appCMInstance.configMap,
        ],
      },
    );

    const hpaName = `${args.app}-hpa`;
    const appHpaInstance = new MyHorizontalPodAutoscaler(
      hpaName,
      {
        name: hpaName,
        app: args.app,
        namespace: args.namespace,
        hpaConfig: {
          minReplicas: args.config.hpaConfig.minReplicas,
          maxReplicas: args.config.hpaConfig.maxReplicas,
          targetCPUUtilizationPercentage:
            args.config.hpaConfig.targetCPUUtilizationPercentage,
          deploymentName: appDeploymentInstance.deployment.metadata.name,
        },
      },
      {
        provider: args.k8sProvider,
        dependsOn: [appDeploymentInstance.deployment],
      },
    );

    const serviceName = `${args.app}-svc`;
    const appServiceInstance = new MyService(
      serviceName,
      {
        name: serviceName,
        app: args.app,
        namespace: args.namespace,
        loadBalancerIp: args.config.loadBalancerIp,
        serviceType: args.config.serviceType
          ? args.config.serviceType
          : "ClusterIP",
        servicePort: args.config.servicePort,
      },
      {
        provider: args.k8sProvider,
        dependsOn: [appDeploymentInstance.deployment],
      },
    );

    // const alertPolicyName = `ap-app-${args.app}`;
    // const appAlertPolicyInstance = new MyAlertPolicy(
    //   alertPolicyName,
    //   {
    //     environment: args.environment,
    //     name: alertPolicyName,
    //     alertPolicyConfig: args.config.alertPolicyConfig,
    //     project: args.project,
    //     namespace: args.namespace,
    //     app: args.app,
    //   },
    //   {
    //     dependsOn: [
    //       appDeploymentInstance.deployment,
    //       appServiceInstance.service,
    //     ],
    //   },
    // );

    this.appServiceAccount = appServiceAccountInstance.serviceAccount;
    this.appConfigMap = appCMInstance.configMap;
    this.appDeployment = appDeploymentInstance.deployment;
    this.appService = appServiceInstance.service;
    this.appHpa = appHpaInstance.hpa;
    // this.appAlertPolicy = appAlertPolicyInstance.alertPolicy;
  }
}

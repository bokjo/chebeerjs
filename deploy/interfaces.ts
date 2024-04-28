// TODO: Convert everything to proper pulumi Input types and move to shared library...
import * as pulumi from "@pulumi/pulumi";

export interface AppSharedConfig {
  environment: string;
  labels?: {
    [key: string]: string;
  };
}

export interface DeployConfig {
  images: {
    appContainer: {
      image: string;
      tag: string;
    };
  };
  resources: {
    requests: {
      cpu: string;
      memory: string;
    };
    limits: {
      cpu: string;
      memory: string;
    };
  };
  db: {
    instanceName: pulumi.Input<string>;
    port: string;
    gcpProject: string;
    gcpRegion: string;
  };
  // serviceAccounts: {
  //   gcp: {
  //     id: pulumi.Input<string>;
  //     email: pulumi.Input<string>;
  //   };
  // };
}

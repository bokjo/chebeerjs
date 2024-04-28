import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import * as synced_folder from "@pulumi/synced-folder";
import * as k8s from "@pulumi/kubernetes";
import MyAppFactory from "./app";
import { DeployConfig } from "./interfaces";

// Import the program's configuration settings.
const config = new pulumi.Config();
const path = config.get("path") || "./www";
const indexDocument = config.get("indexDocument") || "index.html";
const errorDocument = config.get("errorDocument") || "error.html";

// Create a storage bucket and configure it as a website.
const bucket = new gcp.storage.Bucket("beerjs_bucket", {
  location: "EU",
  website: {
    mainPageSuffix: indexDocument,
    notFoundPage: errorDocument,
  },
});

// Create an IAM binding to allow public read access to the bucket.
const bucketIamBinding = new gcp.storage.BucketIAMBinding(
  "bucket-iam-binding",
  {
    bucket: bucket.name,
    role: "roles/storage.objectViewer",
    members: ["allUsers"],
  },
);

// Use a synced folder to manage the files of the website.
const syncedFolder = new synced_folder.GoogleCloudFolder("synced-folder", {
  path: path,
  bucketName: bucket.name,
});

// Enable the storage bucket as a CDN.
const backendBucket = new gcp.compute.BackendBucket("backend-bucket", {
  bucketName: bucket.name,
  enableCdn: true,
});

// Provision a global IP address for the CDN.
const ip = new gcp.compute.GlobalAddress("ip", {});

// Create a URLMap to route requests to the storage bucket.
const urlMap = new gcp.compute.URLMap("url-map", {
  defaultService: backendBucket.selfLink,
});

// Create an HTTP proxy to route requests to the URLMap.
const httpProxy = new gcp.compute.TargetHttpProxy("http-proxy", {
  urlMap: urlMap.selfLink,
});

// Create a GlobalForwardingRule rule to route requests to the HTTP proxy.
const httpForwardingRule = new gcp.compute.GlobalForwardingRule(
  "http-forwarding-rule",
  {
    ipAddress: ip.address,
    ipProtocol: "TCP",
    portRange: "80",
    target: httpProxy.selfLink,
  },
);

// Export the URLs and hostnames of the bucket and CDN.
export const originURL = pulumi.interpolate`https://storage.googleapis.com/${bucket.name}/index.html`;
export const originHostname = pulumi.interpolate`storage.googleapis.com/${bucket.name}`;
export const cdnURL = pulumi.interpolate`http://${ip.address}`;
export const cdnHostname = ip.address;

/**
 *  DEMO 2 - K8s deployment
 */
const k8sProvider = new k8s.Provider("k8s-cluster", {
  // kubeconfig: infraStack.getOutput("kubeconfig"),
  context: "rancher-desktop",
});

const deployConfig: DeployConfig = {
  images: {
    appContainer: {
      image: "docker.io/kennethreitz/httpbin",
      tag: "latest",
    },
  },
  resources: {
    requests: {
      cpu: "0.1",
      memory: String(128 * 1024 * 1024), // "128Mi"
    },
    limits: {
      cpu: "0.5",
      memory: String(256 * 1024 * 1024), // "256Mi"
    },
  },
  db: {
    instanceName: "my-instance-id",
    port: "3306",
    gcpProject: gcp.config.project!,
    gcpRegion: gcp.config.region!,
  },
};

const app = "beerjs";
const appPort = 3000;
const myApp = new MyAppFactory(`${app}-api`, {
  name: app,
  app: app,
  namespace: "default",
  environment: "prod",
  project: gcp.config.project!,
  config: {
    appConfig: {
      APP_NAME: `${app}-svc`,
      GCP_PROJECT: gcp.config.project!,
      DEFAULT_SECRET_VERSION: "latest",
      CACHE_TTL: `${5 * 60 * 1000}`, // 5min.
      DB_HOST: "127.0.0.1",
      DB_USERNAME: "fetched-from-related-db-stack",
      DB_PASSWORD: "fetched-from-related-db-stack",
      BASE42_API_URL: "https://api.42.mk/",
    },
    deployConfig,
    hpaConfig: {
      minReplicas: 1,
      maxReplicas: 3,
      targetCPUUtilizationPercentage: 80,
    },
    serviceType: "ClusterIP",
    servicePort: appPort,
  },
  k8sProvider,
});

export const output_valuesetServiceAccountOutput =
  myApp.appServiceAccount.metadata.name;
export const output_valuesetConfigMapOutput = myApp.appConfigMap.metadata.name;
export const output_valuesetSvcDeploymentOutput =
  myApp.appDeployment.metadata.name;
export const output_valuesetServiceOutput = myApp.appService.metadata.name;
export const output_valuesetHpaOutput = myApp.appHpa.metadata.name;

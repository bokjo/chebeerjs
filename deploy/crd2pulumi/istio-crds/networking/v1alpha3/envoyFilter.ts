// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

import * as pulumi from "@pulumi/pulumi";
import { input as inputs, output as outputs } from "../../types";
import * as utilities from "../../utilities";

import { ObjectMeta } from "../../meta/v1";

export class EnvoyFilter extends pulumi.CustomResource {
  /**
   * Get an existing EnvoyFilter resource's state with the given name, ID, and optional extra
   * properties used to qualify the lookup.
   *
   * @param name The _unique_ name of the resulting resource.
   * @param id The _unique_ provider ID of the resource to lookup.
   * @param opts Optional settings to control the behavior of the CustomResource.
   */
  public static get(name: string, id: pulumi.Input<pulumi.ID>, opts?: pulumi.CustomResourceOptions): EnvoyFilter {
    return new EnvoyFilter(name, undefined as any, { ...opts, id: id });
  }

  /** @internal */
  public static readonly __pulumiType = "kubernetes:networking.istio.io/v1alpha3:EnvoyFilter";

  /**
   * Returns true if the given object is an instance of EnvoyFilter.  This is designed to work even
   * when multiple copies of the Pulumi SDK have been loaded into the same process.
   */
  public static isInstance(obj: any): obj is EnvoyFilter {
    if (obj === undefined || obj === null) {
      return false;
    }
    return obj["__pulumiType"] === EnvoyFilter.__pulumiType;
  }

  public readonly apiVersion!: pulumi.Output<"networking.istio.io/v1alpha3" | undefined>;
  public readonly kind!: pulumi.Output<"EnvoyFilter" | undefined>;
  public readonly metadata!: pulumi.Output<ObjectMeta | undefined>;
  /**
   * Customizing Envoy configuration generated by Istio. See more details at: https://istio.io/docs/reference/config/networking/envoy-filter.html
   */
  public readonly spec!: pulumi.Output<outputs.networking.v1alpha3.EnvoyFilterSpec | undefined>;
  public readonly status!: pulumi.Output<{ [key: string]: any } | undefined>;

  /**
   * Create a EnvoyFilter resource with the given unique name, arguments, and options.
   *
   * @param name The _unique_ name of the resource.
   * @param args The arguments to use to populate this resource's properties.
   * @param opts A bag of options that control this resource's behavior.
   */
  constructor(name: string, args?: EnvoyFilterArgs, opts?: pulumi.CustomResourceOptions) {
    let resourceInputs: pulumi.Inputs = {};
    opts = opts || {};
    if (!opts.id) {
      resourceInputs["apiVersion"] = "networking.istio.io/v1alpha3";
      resourceInputs["kind"] = "EnvoyFilter";
      resourceInputs["metadata"] = args ? args.metadata : undefined;
      resourceInputs["spec"] = args ? args.spec : undefined;
      resourceInputs["status"] = args ? args.status : undefined;
    } else {
      resourceInputs["apiVersion"] = undefined /*out*/;
      resourceInputs["kind"] = undefined /*out*/;
      resourceInputs["metadata"] = undefined /*out*/;
      resourceInputs["spec"] = undefined /*out*/;
      resourceInputs["status"] = undefined /*out*/;
    }
    opts = pulumi.mergeOptions(utilities.resourceOptsDefaults(), opts);
    super(EnvoyFilter.__pulumiType, name, resourceInputs, opts);
  }
}

/**
 * The set of arguments for constructing a EnvoyFilter resource.
 */
export interface EnvoyFilterArgs {
  apiVersion?: pulumi.Input<"networking.istio.io/v1alpha3">;
  kind?: pulumi.Input<"EnvoyFilter">;
  metadata?: pulumi.Input<ObjectMeta>;
  /**
   * Customizing Envoy configuration generated by Istio. See more details at: https://istio.io/docs/reference/config/networking/envoy-filter.html
   */
  spec?: pulumi.Input<inputs.networking.v1alpha3.EnvoyFilterSpecArgs>;
  status?: pulumi.Input<{ [key: string]: any }>;
}

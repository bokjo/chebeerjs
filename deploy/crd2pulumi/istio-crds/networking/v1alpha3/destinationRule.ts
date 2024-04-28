// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

import * as pulumi from "@pulumi/pulumi";
import { input as inputs, output as outputs } from "../../types";
import * as utilities from "../../utilities";

import { ObjectMeta } from "../../meta/v1";

export class DestinationRule extends pulumi.CustomResource {
  /**
   * Get an existing DestinationRule resource's state with the given name, ID, and optional extra
   * properties used to qualify the lookup.
   *
   * @param name The _unique_ name of the resulting resource.
   * @param id The _unique_ provider ID of the resource to lookup.
   * @param opts Optional settings to control the behavior of the CustomResource.
   */
  public static get(name: string, id: pulumi.Input<pulumi.ID>, opts?: pulumi.CustomResourceOptions): DestinationRule {
    return new DestinationRule(name, undefined as any, { ...opts, id: id });
  }

  /** @internal */
  public static readonly __pulumiType = "kubernetes:networking.istio.io/v1alpha3:DestinationRule";

  /**
   * Returns true if the given object is an instance of DestinationRule.  This is designed to work even
   * when multiple copies of the Pulumi SDK have been loaded into the same process.
   */
  public static isInstance(obj: any): obj is DestinationRule {
    if (obj === undefined || obj === null) {
      return false;
    }
    return obj["__pulumiType"] === DestinationRule.__pulumiType;
  }

  public readonly apiVersion!: pulumi.Output<"networking.istio.io/v1alpha3" | undefined>;
  public readonly kind!: pulumi.Output<"DestinationRule" | undefined>;
  public readonly metadata!: pulumi.Output<ObjectMeta | undefined>;
  /**
   * Configuration affecting load balancing, outlier detection, etc. See more details at: https://istio.io/docs/reference/config/networking/destination-rule.html
   */
  public readonly spec!: pulumi.Output<outputs.networking.v1alpha3.DestinationRuleSpec | undefined>;
  public readonly status!: pulumi.Output<{ [key: string]: any } | undefined>;

  /**
   * Create a DestinationRule resource with the given unique name, arguments, and options.
   *
   * @param name The _unique_ name of the resource.
   * @param args The arguments to use to populate this resource's properties.
   * @param opts A bag of options that control this resource's behavior.
   */
  constructor(name: string, args?: DestinationRuleArgs, opts?: pulumi.CustomResourceOptions) {
    let resourceInputs: pulumi.Inputs = {};
    opts = opts || {};
    if (!opts.id) {
      resourceInputs["apiVersion"] = "networking.istio.io/v1alpha3";
      resourceInputs["kind"] = "DestinationRule";
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
    super(DestinationRule.__pulumiType, name, resourceInputs, opts);
  }
}

/**
 * The set of arguments for constructing a DestinationRule resource.
 */
export interface DestinationRuleArgs {
  apiVersion?: pulumi.Input<"networking.istio.io/v1alpha3">;
  kind?: pulumi.Input<"DestinationRule">;
  metadata?: pulumi.Input<ObjectMeta>;
  /**
   * Configuration affecting load balancing, outlier detection, etc. See more details at: https://istio.io/docs/reference/config/networking/destination-rule.html
   */
  spec?: pulumi.Input<inputs.networking.v1alpha3.DestinationRuleSpecArgs>;
  status?: pulumi.Input<{ [key: string]: any }>;
}

import {RaycastInfo, RayProvider} from "./RayProvider"

import {HandInputData} from "../../Providers/HandInputData/HandInputData"
import {HandType} from "../../Providers/HandInputData/HandType"
import {FieldTargetingMode, HandInteractor} from "../HandInteractor/HandInteractor"
import RaycastProxy from "./raycastAlgorithms/RaycastProxy"

export type HandRayProviderConfig = {
  handType: HandType
  handInteractor: HandInteractor
}

/**
 * This class provides raycasting functionality for hand interactions. It selects the appropriate raycast algorithm based on the provided configuration.
 */
export class HandRayProvider implements RayProvider {
  private handProvider: HandInputData = HandInputData.getInstance()

  private hand = this.handProvider.getHand(this.config.handType)

  readonly raycast = new RaycastProxy(this.hand)

  constructor(private config: HandRayProviderConfig) {}

  /** @inheritdoc */
  getRaycastInfo(): RaycastInfo {
    // When not near an InteractionPlane, use the raycast base's logic for direction / locus.
    if (this.config.handInteractor.fieldTargetingMode === FieldTargetingMode.FarField) {
      return (
        this.raycast.getRay() ?? {
          direction: vec3.zero(),
          locus: vec3.zero()
        }
      )
    }
    // When near an InteractionPlane, raycast from the midpoint straight towards the plane.
    else {
      const indexTip = this.hand.indexTip?.position
      const thumbTip = this.hand.thumbTip?.position

      if (indexTip === undefined || thumbTip === undefined) {
        return {
          direction: vec3.zero(),
          locus: vec3.zero()
        }
      }

      const locus = indexTip.add(thumbTip).uniformScale(0.5)
      const planeProjection = this.config.handInteractor.currentInteractionPlane?.projectPoint(locus) ?? null

      if (planeProjection === null) {
        return {
          direction: vec3.zero(),
          locus: vec3.zero()
        }
      } else {
        return {
          direction: planeProjection.point.sub(locus).normalize(),
          locus: locus
        }
      }
    }
  }

  /** @inheritdoc */
  isAvailable(): boolean {
    return (this.hand.isInTargetingPose() && this.hand.isTracked()) || this.hand.isPinching()
  }

  /** @inheritdoc */
  reset(): void {
    this.raycast.reset()
  }
}

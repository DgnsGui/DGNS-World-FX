import {InteractionManager} from "../../../Core/InteractionManager/InteractionManager"
import NativeLogger from "../../../Utils/NativeLogger"

/**
 * point - the projection's position on the plane in world space.
 * distance - the distance from the point to plane in world space (negative if behind the plane)
 * isWithinInteractionZone - if the point is nearby in front of the plane
 * isWithinBehindZone - if the point is nearby behind the plane
 */
export type ZoneProjection = {
  point: vec3
  distance: number
  isWithinInteractionZone: boolean
  isWithinBehindZone: boolean
  isWithinDirectZone: boolean
}

const DEFAULT_INTERACTION_ZONE_DISTANCE_CM = 20

const DEFAULT_DIRECT_ZONE_DISTANCE_CM = 7.5
// The value to use to widen the interaction zone as it gets further away from the plane.
const DEFAULT_INTERACTION_ZONE_SLOPE = 0.25

const DEFAULT_BEHIND_ZONE_DISTANCE_CM = 15

const TAG = "InteractionPlane"

/**
 * An InteractionPlane defines a zone which triggers near field targeting logic for HandInteractors.
 * An InteractionPlane should be added to any 2D UIs with high button density, such as ContainerFrame menus.
 * Only one InteractionPlane should be added per UI (ContainerFrame adds an InteractionPlane by default).
 */
@component
export class InteractionPlane extends BaseScriptComponent {
  /**
   * The size of the interaction plane along the local X and Y axes. Defines the rectangular area of the plane where
   * hand interactions are detected. Larger values create a bigger interactive surface area.
   */
  @input
  @hint(
    "The size of the interaction plane along the local X and Y axes. Defines the rectangular area of the plane where \
hand interactions are detected. Larger values create a bigger interactive surface area."
  )
  private _planeSize: vec2 = new vec2(10, 10)

  /**
   * The depth of the plane's interaction zone along the local Z axis. Defines how far from the plane hand
   * interactions are detected. Hand interactions beyond this distance will not be detected. Larger values allow
   * interaction from greater distances.
   */
  @input
  @hint(
    "The depth of the plane's interaction zone along the local Z axis. Defines how far from the plane hand \
interactions are detected. Hand interactions beyond this distance will not be detected. Larger values allow \
interaction from greater distances."
  )
  private _proximityDistance: number = DEFAULT_INTERACTION_ZONE_DISTANCE_CM

  /**
   * The maximum distance for Direct interaction with the plane.
   */
  @input
  @hint("The maximum distance for Direct interaction with the plane.")
  private _directZoneDistance: number = DEFAULT_DIRECT_ZONE_DISTANCE_CM

  /**
   * Enables visual debugging of the Interaction Plane.
   */
  @input
  @hint("Enables visual debugging of the Interaction Plane.")
  private _drawDebug: boolean = false

  /**
   * The maximum distance for detecting interactions behind the plane. Creates a failsafe/tolerance zone where
   * interactions can still be detected even if the user's hand accidentally penetrates through the plane.
   */
  @input
  @hint(
    "The maximum distance for detecting interactions behind the plane. Creates a failsafe/tolerance zone where \
interactions can still be detected even if the user's hand accidentally penetrates through the plane."
  )
  private _behindDistance: number = DEFAULT_BEHIND_ZONE_DISTANCE_CM

  /**
   * Whether the direct zone of the interaction plane is enabled.
   */
  enableDirectZone = true

  private _collider: ColliderComponent | null = null

  private log = new NativeLogger(TAG)

  onAwake() {
    this.createEvent("OnDestroyEvent").bind(() => this.release())
    this.createEvent("OnEnableEvent").bind(() => {
      InteractionManager.getInstance().registerInteractionPlane(this)
    })
    this.createEvent("OnDisableEvent").bind(() => {
      InteractionManager.getInstance().deregisterInteractionPlane(this)
    })

    this.createEvent("OnStartEvent").bind(() => {
      this._collider = this.sceneObject.createComponent("ColliderComponent")
      this.buildMeshShape()
      this._collider.debugDrawEnabled = this.drawDebug

      InteractionManager.getInstance().registerInteractionPlane(this)
    })
  }

  release() {
    InteractionManager.getInstance().deregisterInteractionPlane(this)
  }

  // Manually create the mesh shape for the interaction zone to trigger NearField targeting.
  private buildMeshShape() {
    if (this.collider === null) {
      return
    }

    if (this.proximityDistance <= 0 || this.behindDistance <= 0 || this.planeSize.x <= 0 || this.planeSize.y <= 0) {
      this.log.f(`InteractionPlane must have proximityDistance, behindDistance, or planeSize set to positive values.`)
    }

    const slopeOffset = DEFAULT_INTERACTION_ZONE_SLOPE * this.proximityDistance
    const shape = Shape.createBoxShape()
    shape.size = new vec3(this.planeSize.x + slopeOffset, this.planeSize.y + slopeOffset, this.proximityDistance * 2)

    this.collider.shape = shape
  }

  /**
   * Sets the size (in world units) of the plane's interaction zone along the local X and Y axes of the SceneObject.
   */
  set planeSize(size: vec2) {
    this._planeSize = size

    this.buildMeshShape()
  }

  /**
   * @returns the size (in world units) of the plane's interaction zone along the local X and Y axes of the SceneObject.
   */
  get planeSize(): vec2 {
    return this._planeSize
  }

  /**
   * Sets the depth (in world units) of the plane's interaction zone along the local Z axis of the SceneObject.
   */
  set proximityDistance(distance: number) {
    this._proximityDistance = distance

    this.buildMeshShape()
  }

  /**
   * Returns the depth (in world units) of the plane's interaction zone along the local Z axis of the SceneObject.
   */
  get proximityDistance(): number {
    return this._proximityDistance
  }

  /**
   * Sets the depth (in world units) of the plane's direct interaction zone along the local Z axis of the SceneObject.
   */
  set directZoneDistance(distance: number) {
    this._directZoneDistance = distance
  }

  /**
   * Returns the depth (in world units) of the plane's direct interaction zone along the local Z axis of the SceneObject.
   */
  get directZoneDistance(): number {
    return this._directZoneDistance
  }

  /**
   * Sets the depth (in world units) of the plane's behind zone along the local Z axis of the SceneObject.
   */
  set behindDistance(distance: number) {
    this._behindDistance = distance

    this.buildMeshShape()
  }

  /**
   * Returns the depth (in world units) of the plane's behind zone along the local Z axis of the SceneObject.
   */
  get behindDistance(): number {
    return this._behindDistance
  }

  /**
   * Sets if the interaction zone should be drawn via debug gizmos.
   */
  set drawDebug(enabled: boolean) {
    this._drawDebug = enabled

    if (this.collider !== null) {
      this.collider.debugDrawEnabled = enabled
    }
  }

  /**
   * @returns if the interaction zone should be drawn via debug gizmos.
   */
  get drawDebug(): boolean {
    return this._drawDebug
  }

  /**
   * @returns a vec3 representing the normal vector of the plane.
   */
  get normal(): vec3 {
    return this.getTransform().forward
  }

  /**
   * Returns the collider of the InteractionPlane after initialization during OnStartEvent.
   * Returns null otherwise.
   */
  get collider(): ColliderComponent | null {
    return this._collider
  }

  /**
   * Project a 3D point in world space onto the InteractionPlane.
   * @param point - a 3D point in world space
   * @returns - a ZoneProjection representing the point's projection onto the plane, the distance of the point from the plane (negative if behind the plane),
   *            a boolean checking if the point resides within the interaction zone of the plane (defined by size and proximityDistance),
   *            and a boolean checking if the point resides within the behind zone of the plane (right behind the plane),
   *            or null if the point does not project onto the plane.
   */
  projectPoint(point: vec3): ZoneProjection | null {
    if (!this.enabled || !this.sceneObject.isEnabledInHierarchy) {
      return null
    }

    // This logic uses the equation of t = ((p0-l0)·n)/(l·n) with l0 + l*t = the point of intersection.
    // l0 represents point, l represents direction, p0 represents plane origin, and n represents the plane normal.
    const po = this.sceneObject.getTransform().getWorldPosition()
    const n = this.sceneObject.getTransform().forward

    const v = po.sub(point)
    const l = n.uniformScale(-1)

    const t = v.dot(n) / l.dot(n)

    // Project the point onto the plane.
    const projectedPoint = point.add(l.uniformScale(t))

    const r = this.sceneObject.getTransform().right
    const u = this.sceneObject.getTransform().up

    // Get the local X and Y coordinates within the plane space to check if the point resides within the interaction zone.
    const d = projectedPoint.sub(po)
    const x = d.dot(r)
    const y = d.dot(u)

    // Get the distance of the original point from the plane.
    const distance = point.sub(projectedPoint).length * Math.sign(t)

    // Check if the point is in front of the plane, within the proximity distance threshold, and within the planeSize boundaries.
    const isWithinInteractionZone =
      distance >= 0 &&
      distance <= this.proximityDistance &&
      Math.abs(x) <= this.planeSize.x + distance * DEFAULT_INTERACTION_ZONE_SLOPE &&
      Math.abs(y) <= this.planeSize.y + distance * DEFAULT_INTERACTION_ZONE_SLOPE

    // Check if the point is within the direct interaction distance threshold.
    const isWithinDirectZone =
      this.enableDirectZone &&
      distance >= 0 &&
      distance <= this.directZoneDistance &&
      Math.abs(x) <= this.planeSize.x + distance * DEFAULT_INTERACTION_ZONE_SLOPE &&
      Math.abs(y) <= this.planeSize.y + distance * DEFAULT_INTERACTION_ZONE_SLOPE

    // Check if the point is in behind the plane, within the behind zone distance threshold, and within the planeSize boundaries.
    const isWithinBehindZone =
      distance < 0 &&
      distance >= -this.behindDistance &&
      Math.abs(x) <= this.planeSize.x &&
      Math.abs(y) <= this.planeSize.y

    // If the point is within the interaction zone, return the plane projection data. Otherwise, return null.
    const planeProjection = {
      point: projectedPoint,
      distance: distance,
      isWithinInteractionZone: isWithinInteractionZone,
      isWithinBehindZone: isWithinBehindZone,
      isWithinDirectZone: isWithinDirectZone
    }
    return planeProjection
  }
}

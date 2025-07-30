import {HandInteractor} from "../../../Core/HandInteractor/HandInteractor"
import {HandInputData} from "../../../Providers/HandInputData/HandInputData"
import {HandType} from "../../../Providers/HandInputData/HandType"
import {HandVisuals} from "../../../Providers/HandInputData/HandVisuals"
import TrackedHand from "../../../Providers/HandInputData/TrackedHand"
import {InteractionConfigurationProvider} from "../../../Providers/InteractionConfigurationProvider/InteractionConfigurationProvider"
import {InputChecker} from "../../../Utils/InputChecker"
import {findSceneObjectByName} from "../../../Utils/SceneObjectUtils"
import {validate} from "../../../Utils/validate"
import {GlowEffectView} from "./GlowEffectView"

const TAG = "HandVisual"

export enum HandVisualSelection {
  Default = "Default",
  AlwaysOn = "AlwaysOn",
  Occluder = "Occluder"
}

/**
 * This class provides a visual representation of the hand, with the ability to automatically wire joints to the hand
 * mesh. It also provides the ability to add a radial gradient occlusion effect and a glow effect to the hand mesh.
 */
@component
export class HandVisual extends BaseScriptComponent implements HandVisuals {
  @ui.group_start("Hand Visual")
  @hint("Core settings that control how the user's hand appears in the AR environment.")

  /**
   * Specifies which hand (Left or Right) this visual representation tracks and renders.
   */
  @input
  @hint("Specifies which hand (Left or Right) this visual representation tracks and renders.")
  @widget(new ComboBoxWidget([new ComboBoxItem("Left", "left"), new ComboBoxItem("Right", "right")]))
  private handType!: string

  /**
   * Sets the hand visual style. "Default" shows glowing fingertips during interactions, while "Occluder" simply
   * blocks content behind the hand.
   */
  @input
  @hint(
    'Sets the hand visual style. "Default" shows glowing fingertips during interactions, while "Occluder" simply \
blocks content behind the hand. "AlwaysOn" always shows glowing fingertips.'
  )
  @widget(
    new ComboBoxWidget([
      new ComboBoxItem("Default", "Default"),
      new ComboBoxItem("AlwaysOn", "AlwaysOn"),
      new ComboBoxItem("Occluder", "Occluder")
    ])
  )
  private selectVisual: string = "Default"

  /**
   * Reference to the HandInteractor component that provides gesture recognition and tracking for this hand.
   */
  @input
  @hint("Reference to the HandInteractor component that provides gesture recognition and tracking for this hand.")
  handInteractor!: HandInteractor

  /**
   * Reference to the RenderMeshVisual of the hand mesh.
   */
  @input
  @hint("Reference to the RenderMeshVisual of the hand mesh.")
  handMesh!: RenderMeshVisual

  /**
   * Sets the rendering priority of the handMesh. Higher values (e.g., 9999) make the hand render on top of objects
   * with lower values.
   */
  @input
  @hint(
    "Sets the rendering priority of the handMesh. Higher values (e.g., 9999) make the hand render on top of objects \
with lower values."
  )
  private handMeshRenderOrder: number = 9999

  /** @inheritdoc */
  @input
  @hint("Reference to the parent SceneObject that contains both the hand's rig and mesh.")
  root!: SceneObject

  /**
   * When enabled, the system will automatically map tracking data to the hand model's joints. Disable only if you
   * need manual control over individual joint assignments.
   */
  @input
  @hint(
    "When enabled, the system will automatically map tracking data to the hand model's joints. Disable only if you \
need manual control over individual joint assignments."
  )
  autoJointMapping: boolean = true

  @ui.group_start("Joint Setup")
  @showIf("autoJointMapping", false)
  @input("SceneObject")
  @allowUndefined
  wrist: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  thumbToWrist: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  thumbBaseJoint: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  thumbKnuckle: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  thumbMidJoint: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  thumbTip: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  indexToWrist: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  indexKnuckle: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  indexMidJoint: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  indexUpperJoint: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  indexTip: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  middleToWrist: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  middleKnuckle: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  middleMidJoint: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  middleUpperJoint: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  middleTip: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  ringToWrist: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  ringKnuckle: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  ringMidJoint: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  ringUpperJoint: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  ringTip: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  pinkyToWrist: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  pinkyKnuckle: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  pinkyMidJoint: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  pinkyUpperJoint: SceneObject | undefined
  @input("SceneObject")
  @allowUndefined
  pinkyTip: SceneObject | undefined
  @ui.group_end
  @ui.group_start("Glow Effect")
  @hint(
    "Controls the visual feedback that appears around fingertips during interactions. \
The glow effect provides users with real-time visual cues about interaction states: \
when hovering near interactive elements, actively pinching/poking, or when interactions \
are out of range."
  )
  /**
   * Whether or not the thumb should glow when poking.
   */
  @input
  @hint("Whether or not the thumb should glow when poking.")
  private shouldThumbPokeGlow: boolean = false
  /**
   * The plane mesh on which the glow texture/material will be rendered.
   */
  @input
  @hint("The plane mesh on which the glow texture/material will be rendered.")
  private unitPlaneMesh!: RenderMesh
  /**
   * The material which will be manipulated to create the glow effect.
   */
  @input
  @hint("The material which will be manipulated to create the glow effect.")
  private tipGlowMaterial!: Material
  /**
   * The color the glow will be when you are not pinching/poking.
   */
  @input
  @widget(new ColorWidget())
  @hint("The color the glow will be when you are not pinching/poking.")
  private hoverColor!: vec4
  /**
   * The color the glow will be when you are pinching/poking.
   */
  @input
  @widget(new ColorWidget())
  @hint("The color the glow will be when you are pinching/poking.")
  private triggerColor!: vec4
  /**
   * The color the glow will be when you are pinching/poking too far.
   */
  @input
  @widget(new ColorWidget())
  @hint("The color the glow will be when you are pinching/poking too far.")
  private behindColor!: vec4
  /**
   * How close index finger of tapping hand has to be to tapped hand to initiate tap glow.
   */
  @input
  @hint("How close index finger of tapping hand has to be to tapped hand to initiate tap glow.")
  private tapProximityThreshold!: number
  /**
   * The texture applied to the hand when creating pinch glow effect.
   */
  @input
  @hint("The texture applied to the hand when creating pinch glow effect.")
  private pinchTexture!: Texture
  /**
   * The texture applied to the hand when creating tap glow effect.
   */
  @input
  @hint("The texture applied to the hand when creating tap glow effect.")
  private tapTexture!: Texture
  /**
   * The render order of the quad on which the tip glow effect occurs.
   */
  @input
  @hint("The render order of the quad on which the tip glow effect occurs.")
  private tipGlowRenderOrder: number = 10000
  @ui.group_end
  @ui.group_end
  @ui.group_start("Hand Mesh Materials")
  @hint(
    "Materials that control the appearance of the hand mesh by specifying materials for different hand visual styles."
  )
  /**
   * The material which will create the default visual effect on the hand mesh.
   */
  @input
  @hint("The material which will create the default visual effect on the hand mesh.")
  private handOutlineMaterial!: Material
  /**
   * The material which will create the occluder visual effect on the hand mesh.
   */
  @input
  @hint("The material which will create the occluder visual effect on the hand mesh.")
  private handOccluderMaterial!: Material
  @ui.group_end

  // Dependencies
  private handProvider: HandInputData = HandInputData.getInstance()
  private interactionConfigurationProvider: InteractionConfigurationProvider =
    InteractionConfigurationProvider.getInstance()
  private inputChecker = new InputChecker(TAG)
  private hand: TrackedHand | undefined
  private glowEffectView: GlowEffectView | undefined

  private _enabled: boolean = true
  private _handVisualSelection: HandVisualSelection = this.selectVisual as HandVisualSelection

  initialized = false

  private _isHandAvailable: boolean = false
  private _isPhoneInHand: boolean = false

  /**
   * Sets the selection of the hand visual to present to user
   */
  set visualSelection(selection: HandVisualSelection) {
    this._handVisualSelection = selection
    this.glowEffectView?.setVisualSelection(selection)
  }

  /**
   * @returns the current selection of the hand visual to present to user
   */
  get visualSelection(): HandVisualSelection {
    return this._handVisualSelection
  }

  /**
   * Determines if the hand visual is visible.
   *
   * @returns {boolean} True if the hand is available and the phone is not in hand, otherwise false.
   */
  private get isVisible(): boolean {
    return this._isHandAvailable && !this._isPhoneInHand
  }

  private defineScriptEvents() {
    this.createEvent("OnStartEvent").bind(() => {
      this.initialize()
    })

    this.createEvent("OnEnableEvent").bind(() => {
      this.defineOnEnableBehavior()
    })

    this.createEvent("OnDisableEvent").bind(() => {
      this.defineOnDisableBehavior()
    })

    this.createEvent("OnDestroyEvent").bind(() => {
      this.defineOnDestroyBehavior()
    })
  }

  protected defineOnEnableBehavior(): void {
    if (this.isVisible) {
      this.setEnabled(true)
    }
  }

  protected defineOnDisableBehavior(): void {
    this.setEnabled(false)
  }

  protected defineOnDestroyBehavior(): void {
    if (this.glowEffectView !== undefined) {
      this.glowEffectView.destroy()
    }

    this.hand?.detachHandVisuals(this)
  }

  private defineHandEvents() {
    validate(this.hand)

    this.hand.onEnabledChanged.add((enabled: boolean) => {
      this._enabled = enabled
      // We shouldn't turn on the hand visuals until the hand has actually been found.
      if (!enabled) {
        this.setEnabled(false)
      }
    })

    this.hand.onHandFound.add(() => {
      this._isHandAvailable = true
      if (this._enabled) {
        if (this.isVisible) {
          this.setEnabled(true)
        }
      }
    })

    this.hand.onHandLost.add(() => {
      this._isHandAvailable = false
      if (this._enabled) {
        this.setEnabled(false)
      }
    })

    this.hand.onPhoneInHandBegin.add(() => {
      this._isPhoneInHand = true
      if (this._enabled) {
        this.setEnabled(false)
      }
    })

    this.hand.onPhoneInHandEnd.add(() => {
      this._isPhoneInHand = false
      if (this._enabled) {
        if (this.isVisible) {
          this.setEnabled(true)
        }
      }
    })
  }

  private getJointSceneObject(targetSceneObjectName: string, root: SceneObject) {
    const sceneObject = findSceneObjectByName(root, targetSceneObjectName)
    if (sceneObject === null) {
      throw new Error(`${targetSceneObjectName} could not be found in children of SceneObject: ${this.root?.name}`)
    }
    return sceneObject
  }

  private setEnabled(enabled: boolean) {
    if (this.glowEffectView !== undefined) {
      this.glowEffectView.enabled = enabled
    }
    this.handMesh.sceneObject.enabled = enabled
  }

  onAwake(): void {
    if (this.handType !== "right") {
      this.hand = this.handProvider.getHand("left")
    } else {
      this.hand = this.handProvider.getHand("right")
    }

    this.hand.attachHandVisuals(this)

    this.defineHandEvents()
    this.defineScriptEvents()

    this.handMesh.setRenderOrder(this.handMeshRenderOrder)

    /*
     * HandVisuals were not working correctly with frustum culling,
     * instead manually define the AABB for frustum culling
     */
    const min = this.handMesh.mesh.aabbMin
    const max = this.handMesh.mesh.aabbMax

    const pass = this.handMesh.mainMaterial.mainPass
    pass.frustumCullMode = FrustumCullMode.UserDefinedAABB
    pass.frustumCullMin = min
    pass.frustumCullMax = max
  }

  public initialize(): void {
    if (this.initialized) {
      return
    }
    validate(this.hand)

    this.wrist = this.autoJointMapping ? this.getJointSceneObject("wrist", this.root) : this.wrist

    this.thumbToWrist = this.autoJointMapping
      ? this.getJointSceneObject("wrist_to_thumb", this.root)
      : this.thumbToWrist
    this.thumbBaseJoint = this.autoJointMapping ? this.getJointSceneObject("thumb-0", this.root) : this.thumbBaseJoint
    this.thumbKnuckle = this.autoJointMapping ? this.getJointSceneObject("thumb-1", this.root) : this.thumbKnuckle
    this.thumbMidJoint = this.autoJointMapping ? this.getJointSceneObject("thumb-2", this.root) : this.thumbMidJoint
    this.thumbTip = this.autoJointMapping ? this.getJointSceneObject("thumb-3", this.root) : this.thumbTip
    this.indexToWrist = this.autoJointMapping
      ? this.getJointSceneObject("wrist_to_index", this.root)
      : this.indexToWrist
    this.indexKnuckle = this.autoJointMapping ? this.getJointSceneObject("index-0", this.root) : this.indexKnuckle
    this.indexMidJoint = this.autoJointMapping ? this.getJointSceneObject("index-1", this.root) : this.indexMidJoint
    this.indexUpperJoint = this.autoJointMapping ? this.getJointSceneObject("index-2", this.root) : this.indexUpperJoint
    this.indexTip = this.autoJointMapping ? this.getJointSceneObject("index-3", this.root) : this.indexTip
    this.middleToWrist = this.autoJointMapping
      ? this.getJointSceneObject("wrist_to_mid", this.root)
      : this.middleToWrist
    this.middleKnuckle = this.autoJointMapping ? this.getJointSceneObject("mid-0", this.root) : this.middleKnuckle
    this.middleMidJoint = this.autoJointMapping ? this.getJointSceneObject("mid-1", this.root) : this.middleMidJoint
    this.middleUpperJoint = this.autoJointMapping ? this.getJointSceneObject("mid-2", this.root) : this.middleUpperJoint
    this.middleTip = this.autoJointMapping ? this.getJointSceneObject("mid-3", this.root) : this.middleTip
    this.ringToWrist = this.autoJointMapping ? this.getJointSceneObject("wrist_to_ring", this.root) : this.ringToWrist
    this.ringKnuckle = this.autoJointMapping ? this.getJointSceneObject("ring-0", this.root) : this.ringKnuckle
    this.ringMidJoint = this.autoJointMapping ? this.getJointSceneObject("ring-1", this.root) : this.ringMidJoint
    this.ringUpperJoint = this.autoJointMapping ? this.getJointSceneObject("ring-2", this.root) : this.ringUpperJoint
    this.ringTip = this.autoJointMapping ? this.getJointSceneObject("ring-3", this.root) : this.ringTip
    this.pinkyToWrist = this.autoJointMapping
      ? this.getJointSceneObject("wrist_to_pinky", this.root)
      : this.pinkyToWrist
    this.pinkyKnuckle = this.autoJointMapping ? this.getJointSceneObject("pinky-0", this.root) : this.pinkyKnuckle
    this.pinkyMidJoint = this.autoJointMapping ? this.getJointSceneObject("pinky-1", this.root) : this.pinkyMidJoint
    this.pinkyUpperJoint = this.autoJointMapping ? this.getJointSceneObject("pinky-2", this.root) : this.pinkyUpperJoint
    this.pinkyTip = this.autoJointMapping ? this.getJointSceneObject("pinky-3", this.root) : this.pinkyTip

    this.initialized = true
    // The joints are now ready and the effects can be initialized

    this.hand.initHandVisuals()
    this.glowEffectView = new GlowEffectView({
      handVisuals: this,
      handType: this.handType as HandType,
      unitPlaneMesh: this.unitPlaneMesh,
      tipGlowMaterial: this.tipGlowMaterial,
      hoverColor: this.hoverColor,
      triggerColor: this.triggerColor,
      behindColor: this.behindColor,
      tapProximityThreshold: this.tapProximityThreshold,
      tapTexture: this.tapTexture,
      pinchTexture: this.pinchTexture,
      tipGlowRenderOrder: this.tipGlowRenderOrder,
      handInteractor: this.handInteractor,
      visualSelection: this._handVisualSelection,
      handOutlineMaterial: this.handOutlineMaterial,
      handOccluderMaterial: this.handOccluderMaterial,
      shouldThumbPokeGlow: this.shouldThumbPokeGlow
    })
  }
}

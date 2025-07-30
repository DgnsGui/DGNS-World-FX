import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { InteractorEvent } from 'SpectaclesInteractionKit/Core/Interactor/InteractorEvent';

@component
export class SurfaceToggleController extends BaseScriptComponent {
    // --- Inputs pour les boutons d'interaction ---
    @input('Component.ScriptComponent')
    @hint('PinchButton to toggle floor surface')
    floorToggleButton: PinchButton;

    @input('Component.ScriptComponent')
    @hint('PinchButton to toggle walls surface')
    wallsToggleButton: PinchButton;

    @input('Component.ScriptComponent')
    @hint('PinchButton to toggle ceiling surface')
    ceilingToggleButton: PinchButton;

    // --- Inputs pour les objets visuels (Textes On/Off) ---
    @input('SceneObject')
    @hint('3D Text object for "ON" state of the floor button')
    floorOnText: SceneObject;

    @input('SceneObject')
    @hint('3D Text object for "OFF" state of the floor button')
    floorOffText: SceneObject;

    @input('SceneObject')
    @hint('3D Text object for "ON" state of the walls button')
    wallsOnText: SceneObject;

    @input('SceneObject')
    @hint('3D Text object for "OFF" state of the walls button')
    wallsOffText: SceneObject;

    @input('SceneObject')
    @hint('3D Text object for "ON" state of the ceiling button')
    ceilingOnText: SceneObject;

    @input('SceneObject')
    @hint('3D Text object for "OFF" state of the ceiling button')
    ceilingOffText: SceneObject;
    
    // --- Inputs pour les matériaux et paramètres de shader ---
    @input('Asset.Material[]')
    @hint('Direct material references to control')
    controlledMaterials: Material[] = [];

    @input('string')
    @hint('Float parameter name for floor control in shaders')
    floorParameterName: string = "show_floor";

    @input('string')
    @hint('Float parameter name for walls control in shaders')
    wallsParameterName: string = "show_walls";

    @input('string')
    @hint('Float parameter name for ceiling control in shaders')
    ceilingParameterName: string = "show_ceiling";

    // --- Propriétés privées pour le suivi de l'état ---
    private floorEnabled: boolean = true;
    private wallsEnabled: boolean = true;
    private ceilingEnabled: boolean = true;

    private floorHandler: (event: InteractorEvent) => void;
    private wallsHandler: (event: InteractorEvent) => void;
    private ceilingHandler: (event: InteractorEvent) => void;

    onAwake(): void {
        print("SurfaceToggleController: onAwake() called");

        if (!this.controlledMaterials || this.controlledMaterials.length === 0) {
            print("ERROR: No materials assigned in controlledMaterials. Please assign materials in the Inspector.");
            return;
        }
        print(`SurfaceToggleController controlling ${this.controlledMaterials.length} materials.`);

        this.setupButtonHandlers();
        this.updateAllMaterials();
        this.updateAllButtonVisuals(); // Mettre à jour l'état visuel initial de tous les boutons
    }

    private setupButtonHandlers(): void {
        print("SurfaceToggleController: Setting up button handlers...");

        // --- Connexion du bouton pour le sol ---
        if (this.floorToggleButton && this.floorToggleButton.onButtonPinched) {
            this.floorHandler = () => {
                print("Floor button pinched!");
                this.toggleFloor();
            };
            this.floorToggleButton.onButtonPinched.add(this.floorHandler);
            print("Floor toggle button connected successfully.");
        } else {
            print("ERROR: Floor toggle button is not assigned or onButtonPinched event is missing.");
        }

        // --- Connexion du bouton pour les murs ---
        if (this.wallsToggleButton && this.wallsToggleButton.onButtonPinched) {
            this.wallsHandler = () => {
                print("Walls button pinched!");
                this.toggleWalls();
            };
            this.wallsToggleButton.onButtonPinched.add(this.wallsHandler);
            print("Walls toggle button connected successfully.");
        } else {
            print("ERROR: Walls toggle button is not assigned or onButtonPinched event is missing.");
        }

        // --- Connexion du bouton pour le plafond ---
        if (this.ceilingToggleButton && this.ceilingToggleButton.onButtonPinched) {
            this.ceilingHandler = () => {
                print("Ceiling button pinched!");
                this.toggleCeiling();
            };
            this.ceilingToggleButton.onButtonPinched.add(this.ceilingHandler);
            print("Ceiling toggle button connected successfully.");
        } else {
            print("ERROR: Ceiling toggle button is not assigned or onButtonPinched event is missing.");
        }
    }
    
    // --- Fonctions de basculement (Toggle) ---
    private toggleFloor(): void {
        this.floorEnabled = !this.floorEnabled;
        print(`Floor surfaces toggled to: ${this.floorEnabled ? 'ON' : 'OFF'}`);
        this.updateFloorInAllMaterials();
        this.updateButtonVisuals(this.floorEnabled, this.floorOnText, this.floorOffText);
    }

    private toggleWalls(): void {
        this.wallsEnabled = !this.wallsEnabled;
        print(`Wall surfaces toggled to: ${this.wallsEnabled ? 'ON' : 'OFF'}`);
        this.updateWallsInAllMaterials();
        this.updateButtonVisuals(this.wallsEnabled, this.wallsOnText, this.wallsOffText);
    }

    private toggleCeiling(): void {
        this.ceilingEnabled = !this.ceilingEnabled;
        print(`Ceiling surfaces toggled to: ${this.ceilingEnabled ? 'ON' : 'OFF'}`);
        this.updateCeilingInAllMaterials();
        this.updateButtonVisuals(this.ceilingEnabled, this.ceilingOnText, this.ceilingOffText);
    }

    // --- Fonctions de mise à jour visuelle ---
    private updateButtonVisuals(isEnabled: boolean, onText: SceneObject, offText: SceneObject): void {
        if (onText) {
            onText.enabled = isEnabled;
        }
        if (offText) {
            offText.enabled = !isEnabled;
        }
    }
    
    private updateAllButtonVisuals(): void {
        print("Updating all button visuals to initial state.");
        this.updateButtonVisuals(this.floorEnabled, this.floorOnText, this.floorOffText);
        this.updateButtonVisuals(this.wallsEnabled, this.wallsOnText, this.wallsOffText);
        this.updateButtonVisuals(this.ceilingEnabled, this.ceilingOnText, this.ceilingOffText);
    }
    
    // --- Fonctions de mise à jour des matériaux (Shader) ---
    private updateMaterialParameter(parameterName: string, value: number): void {
        this.controlledMaterials.forEach((material, index) => {
            if (material && material.mainPass) {
                try {
                    material.mainPass[parameterName] = value;
                } catch (e) {
                    print(`ERROR: Could not set parameter '${parameterName}' on material ${index}. Error: ${e}`);
                }
            }
        });
    }

    private updateFloorInAllMaterials(): void {
        this.updateMaterialParameter(this.floorParameterName, this.floorEnabled ? 1.0 : 0.0);
    }

    private updateWallsInAllMaterials(): void {
        this.updateMaterialParameter(this.wallsParameterName, this.wallsEnabled ? 1.0 : 0.0);
    }

    private updateCeilingInAllMaterials(): void {
        this.updateMaterialParameter(this.ceilingParameterName, this.ceilingEnabled ? 1.0 : 0.0);
    }
    
    private updateAllMaterials(): void {
        print("Updating all materials with initial states...");
        this.updateFloorInAllMaterials();
        this.updateWallsInAllMaterials();
        this.updateCeilingInAllMaterials();
    }
    
    // --- Nettoyage des événements ---
    destroy(): void {
        print("SurfaceToggleController: Cleaning up event listeners.");
        if (this.floorToggleButton && this.floorHandler) {
            this.floorToggleButton.onButtonPinched.remove(this.floorHandler);
        }
        if (this.wallsToggleButton && this.wallsHandler) {
            this.wallsToggleButton.onButtonPinched.remove(this.wallsHandler);
        }
        if (this.ceilingToggleButton && this.ceilingHandler) {
            this.ceilingToggleButton.onButtonPinched.remove(this.ceilingHandler);
        }
        super.destroy();
    }
}
import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { InteractorEvent } from 'SpectaclesInteractionKit/Core/Interactor/InteractorEvent';

@component
export class WorldEffectsManager extends BaseScriptComponent {
    
    @input('Component.ScriptComponent[]')
    @hint('Array of PinchButton components to trigger visibility toggles')
    pinchButtons: PinchButton[] = [];
    
    @input('SceneObject[]')
    @hint('Array of SceneObjects whose visibility will be toggled')
    worldMeshObjects: SceneObject[] = [];
    
    private currentActiveIndex: number = -1;
    private isInitialized: boolean = false;
    private pinchHandlers: ((event: InteractorEvent) => void)[] = [];
    
    // Static registry to track all instances for exclusivity
    private static activeManagers: WorldEffectsManager[] = [];
    
    onAwake() {
        this.initialize();
    }
    
    private initialize(): void {
        if (this.isInitialized) return;
        
        // Validate inputs
        if (!this.pinchButtons || !this.worldMeshObjects) {
            print("ERREUR: Les tableaux PinchButtons et WorldMeshObjects doivent être définis dans l'Inspector");
            return;
        }
        
        if (this.pinchButtons.length !== this.worldMeshObjects.length) {
            print(`ERREUR: Le nombre de PinchButtons (${this.pinchButtons.length}) doit correspondre au nombre de WorldMeshObjects (${this.worldMeshObjects.length})`);
            return;
        }
        
        // Disable all WorldMesh objects at startup
        for (let i = 0; i < this.worldMeshObjects.length; i++) {
            if (this.worldMeshObjects[i]) {
                this.worldMeshObjects[i].enabled = false;
            } else {
                print(`ATTENTION: WorldMeshObject à l'index ${i} est null`);
            }
        }
        
        // Add this manager to the static registry
        WorldEffectsManager.activeManagers.push(this);
        
        // Set up PinchButton event listeners
        this.setupPinchButtons();
        
        this.isInitialized = true;
        print(`WorldEffectsManager initialisé avec ${this.pinchButtons.length} éléments`);
    }
    
    private setupPinchButtons(): void {
        for (let i = 0; i < this.pinchButtons.length; i++) {
            if (this.pinchButtons[i]) {
                const index = i;
                const handler = (event: InteractorEvent) => {
                    print(`PinchButton ${index} déclenché`);
                    this.onPinchTriggered(index);
                };
                this.pinchButtons[i].onButtonPinched.add(handler);
                this.pinchHandlers[i] = handler;
                print(`Événement onButtonPinched enregistré pour PinchButton ${i}`);
            } else {
                print(`ATTENTION: PinchButton à l'index ${i} est null`);
            }
        }
    }
    
    private onPinchTriggered(index: number): void {
        // Validate index
        if (index < 0 || index >= this.worldMeshObjects.length) {
            print(`ERREUR: Index invalide ${index}`);
            return;
        }
        
        // Toggle off if the same index is already active
        if (this.currentActiveIndex === index) {
            this.deactivateWorldMesh(index);
            this.currentActiveIndex = -1;
            print(`WorldMesh ${index} désactivé (toggle)`);
            return;
        }
        
        // Deactivate all other objects across all managers
        WorldEffectsManager.activeManagers.forEach(manager => {
            if (manager !== this && manager.currentActiveIndex !== -1) {
                manager.deactivateWorldMesh(manager.currentActiveIndex);
                manager.currentActiveIndex = -1;
                print(`Désactivé WorldMesh ${manager.currentActiveIndex} dans un autre manager`);
            }
        });
        
        // Deactivate previous object in this manager
        if (this.currentActiveIndex !== -1) {
            this.deactivateWorldMesh(this.currentActiveIndex);
        }
        
        // Activate the new WorldMesh
        this.activateWorldMesh(index);
        this.currentActiveIndex = index;
        print(`WorldMesh ${index} activé exclusivement`);
    }
    
    private activateWorldMesh(index: number): void {
        if (this.worldMeshObjects[index]) {
            this.worldMeshObjects[index].enabled = true;
            print(`WorldMesh ${index} activé`);
        } else {
            print(`ERREUR: WorldMeshObject à l'index ${index} est null`);
        }
    }
    
    private deactivateWorldMesh(index: number): void {
        if (this.worldMeshObjects[index]) {
            this.worldMeshObjects[index].enabled = false;
            print(`WorldMesh ${index} désactivé`);
        }
    }
    
    // Public methods
    public deactivateAll(): void {
        for (let i = 0; i < this.worldMeshObjects.length; i++) {
            this.deactivateWorldMesh(i);
        }
        this.currentActiveIndex = -1;
        print("Tous les WorldMesh désactivés dans ce manager");
    }
    
    public getCurrentActiveIndex(): number {
        return this.currentActiveIndex;
    }
    
    public activateByIndex(index: number): void {
        if (index >= 0 && index < this.worldMeshObjects.length) {
            this.onPinchTriggered(index);
        } else {
            print(`ERREUR: Index ${index} hors limites (0-${this.worldMeshObjects.length - 1})`);
        }
    }
    
    public getActiveWorldMesh(): SceneObject | null {
        if (this.currentActiveIndex >= 0 && this.currentActiveIndex < this.worldMeshObjects.length) {
            return this.worldMeshObjects[this.currentActiveIndex];
        }
        return null;
    }
    
    public isIndexActive(index: number): boolean {
        return this.currentActiveIndex === index;
    }
    
    // Clean up event listeners and registry on destroy
    destroy(): void {
        // Remove event listeners
        for (let i = 0; i < this.pinchButtons.length; i++) {
            if (this.pinchButtons[i] && this.pinchHandlers[i]) {
                this.pinchButtons[i].onButtonPinched.remove(this.pinchHandlers[i]);
                print(`Événement onButtonPinched supprimé pour PinchButton ${i}`);
            }
        }
        this.pinchHandlers = [];
        
        // Remove this manager from the static registry
        const index = WorldEffectsManager.activeManagers.indexOf(this);
        if (index !== -1) {
            WorldEffectsManager.activeManagers.splice(index, 1);
            print("WorldEffectsManager retiré du registre statique");
        }
        
        super.destroy();
    }
}
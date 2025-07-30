// Lens Studio Script: WelcomeScreenManager.JS
// Manages a welcome screen with acknowledge button that switches to main UI container.
// Also manages a changelog container accessible from main UI.
// Simplified version based on PlayerSkinManager logic.

// ----- INPUTS -----
// @ui {"widget":"group_start", "label":"Welcome Screen"}
// @input SceneObject welcomePrefab {"label":"Welcome Prefab"}
// @input Component.ScriptComponent acknowledgeButton {"label":"Acknowledge Button"}
// @input Component.ScriptComponent changelogButton {"label":"Changelog Button"}
// @ui {"widget":"group_end"}
// @ui {"widget":"group_start", "label":"Main UI"}
// @input SceneObject containerFrameUI {"label":"Container Frame UI"}
// @ui {"widget":"group_end"}
// @ui {"widget":"group_start", "label":"Changelog"}
// @input SceneObject containerFrameChangelog {"label":"Container Frame Changelog"}
// @input Component.ScriptComponent acknowledgeChangelogButton {"label":"Acknowledge Changelog Button"}
// @ui {"widget":"group_end"}

// ----- SCRIPT LOGIC -----

const STATES = { 
    WELCOME: "welcome", 
    MAIN_UI: "main_ui", 
    CHANGELOG: "changelog" 
};
Object.freeze(STATES);
var currentState = STATES.WELCOME;
var previousState = null;

// --- Helper Functions ---

function validateInputs() {
    var valid = true;
    const inputsToCheck = [
        {obj: script.welcomePrefab, name: "Welcome Prefab"},
        {obj: script.acknowledgeButton, name: "Acknowledge Button"},
        {obj: script.changelogButton, name: "Changelog Button"},
        {obj: script.containerFrameUI, name: "Container Frame UI"},
        {obj: script.containerFrameChangelog, name: "Container Frame Changelog"},
        {obj: script.acknowledgeChangelogButton, name: "Acknowledge Changelog Button"}
    ];
    
    inputsToCheck.forEach(function(input) {
        if (!input.obj) {
            print("ERROR: WelcomeScreenManager - Input missing: " + input.name);
            valid = false;
        }
    });
    
    return valid;
}

function disableAllUI() {
    print("Disabling all UI elements...");
    if (script.welcomePrefab) script.welcomePrefab.enabled = false;
    if (script.containerFrameUI) script.containerFrameUI.enabled = false;
    if (script.containerFrameChangelog) script.containerFrameChangelog.enabled = false;
}

// Central function to switch between states
function switchToState(newState) {
    print("DEBUG: Switching from state '" + currentState + "' to '" + newState + "'");
    
    if (!STATES[newState.toUpperCase()]) {
        print("ERROR: Invalid target state: " + newState);
        return;
    }

    previousState = currentState;

    // --- Disable Current State ---
    print("DEBUG: Disabling current state elements for: " + currentState);
    if (currentState === STATES.WELCOME && script.welcomePrefab) {
        script.welcomePrefab.enabled = false;
    } else if (currentState === STATES.MAIN_UI && script.containerFrameUI) {
        script.containerFrameUI.enabled = false;
    } else if (currentState === STATES.CHANGELOG && script.containerFrameChangelog) {
        script.containerFrameChangelog.enabled = false;
    }

    // --- Enable New State ---
    print("DEBUG: Enabling new state elements for: " + newState);
    if (newState === STATES.WELCOME && script.welcomePrefab) {
        script.welcomePrefab.enabled = true;
    } else if (newState === STATES.MAIN_UI && script.containerFrameUI) {
        script.containerFrameUI.enabled = true;
    } else if (newState === STATES.CHANGELOG && script.containerFrameChangelog) {
        script.containerFrameChangelog.enabled = true;
    }

    currentState = newState;
    print("Successfully switched to state: " + currentState + " (from: " + previousState + ")");
}

// Function to temporarily enable containers for proper button initialization
function initializeAllButtons() {
    print("=== INITIALIZING ALL BUTTONS ===");
    
    // Store current enabled states
    var welcomeWasEnabled = script.welcomePrefab ? script.welcomePrefab.enabled : false;
    var uiWasEnabled = script.containerFrameUI ? script.containerFrameUI.enabled : false;
    var changelogWasEnabled = script.containerFrameChangelog ? script.containerFrameChangelog.enabled : false;
    
    print("Current states - Welcome: " + welcomeWasEnabled + ", UI: " + uiWasEnabled + ", Changelog: " + changelogWasEnabled);
    
    // Temporarily enable ALL containers to ensure button scripts initialize properly
    if (script.welcomePrefab) script.welcomePrefab.enabled = true;
    if (script.containerFrameUI) script.containerFrameUI.enabled = true;
    if (script.containerFrameChangelog) script.containerFrameChangelog.enabled = true;
    
    print("Temporarily enabled all containers for button initialization");
    
    // Wait a frame for initialization to complete using a delayed event
    var initEvent = script.createEvent("UpdateEvent");
    var frameCounter = 0;
    
    initEvent.bind(function() {
        frameCounter++;
        
        if (frameCounter >= 2) { // Wait 2 frames to ensure initialization
            print("Proceeding with button binding after " + frameCounter + " frames");
            
            // Remove the update event
            script.removeEvent(initEvent);
            
            // Now bind the buttons
            bindButton(script.acknowledgeButton, "Acknowledge");
            bindButton(script.changelogButton, "Changelog");
            bindButton(script.acknowledgeChangelogButton, "AcknowledgeChangelog");
            
            // Restore original states
            if (script.welcomePrefab) script.welcomePrefab.enabled = welcomeWasEnabled;
            if (script.containerFrameUI) script.containerFrameUI.enabled = uiWasEnabled;
            if (script.containerFrameChangelog) script.containerFrameChangelog.enabled = changelogWasEnabled;
            
            print("Restored original container states");
            
            // Set the correct initial state
            currentState = STATES.WELCOME;
            if (script.welcomePrefab) script.welcomePrefab.enabled = true;
            
            print("Button initialization complete. Current state: " + currentState);
        }
    });
}

// Enhanced debug function to list all properties
function debugComponentProperties(component, componentName) {
    print("=== DEBUGGING COMPONENT: " + componentName + " ===");
    print("Component type: " + typeof component);
    print("Component constructor: " + (component.constructor ? component.constructor.name : "Unknown"));
    
    var properties = [];
    var methods = [];
    
    try {
        for (var prop in component) {
            if (typeof component[prop] === 'function') {
                methods.push(prop + "()");
            } else {
                properties.push(prop + " (" + typeof component[prop] + ")");
            }
        }
        
        print("Properties found: " + properties.join(", "));
        print("Methods found: " + methods.join(", "));
        
        // Check for common button event properties
        var commonEvents = ['onButtonPinched', 'onTap', 'onClick', 'onTouch', 'onInteract', 'onTrigger'];
        print("--- Checking for common event properties ---");
        commonEvents.forEach(function(eventName) {
            if (component.hasOwnProperty(eventName)) {
                print("✓ Found: " + eventName + " (type: " + typeof component[eventName] + ")");
            } else {
                print("✗ Missing: " + eventName);
            }
        });
        
    } catch (e) {
        print("Error during component inspection: " + e.message);
    }
    print("=== END DEBUG FOR: " + componentName + " ===");
}

// Bind button function
function bindButton(buttonScriptComponent, buttonName) {
    if (!buttonScriptComponent) {
        print("ERROR: WelcomeScreenManager - Button ScriptComponent input not assigned for: " + buttonName + ". Please assign it in the Inspector.");
        return;
    }

    var targetComponent = buttonScriptComponent;
    var ownerObject = targetComponent.getSceneObject ? targetComponent.getSceneObject() : null;
    var ownerName = ownerObject ? ownerObject.name : "UnknownObject";

    print("--- Attempting to bind button: " + buttonName + " on object: " + ownerName + " ---");
    
    // Enhanced debugging for the changelog button specifically
    if (buttonName === "AcknowledgeChangelog") {
        debugComponentProperties(targetComponent, buttonName);
    }

    try {
        // Check if onButtonPinched exists
        if (targetComponent.onButtonPinched === undefined) {
            print("ERROR: WelcomeScreenManager - Input ScriptComponent for '" + buttonName + "' on object '" + ownerName + "' is missing 'onButtonPinched'. Check Inspector link / prefab setup.");
            
            // Try alternative event names
            if (buttonName === "AcknowledgeChangelog") {
                print("INFO: Trying alternative event binding methods for " + buttonName);
                
                var alternatives = ['onTap', 'onClick', 'onTouch', 'onInteract', 'onTrigger'];
                var boundSuccessfully = false;
                
                for (var i = 0; i < alternatives.length; i++) {
                    var altEvent = alternatives[i];
                    if (targetComponent[altEvent] !== undefined) {
                        print("INFO: Found alternative event: " + altEvent + " for " + buttonName);
                        
                        if (typeof targetComponent[altEvent].subscribe === 'function') {
                            targetComponent[altEvent].subscribe(function(eventData) {
                                handlePinchEvent(buttonName, "subscribe via " + altEvent, eventData);
                            });
                            print("SUCCESS: Bound using " + altEvent + ".subscribe() for " + buttonName);
                            boundSuccessfully = true;
                            break;
                        } else if (typeof targetComponent[altEvent].add === 'function') {
                            targetComponent[altEvent].add(function() {
                                handlePinchEvent(buttonName, "add via " + altEvent);
                            });
                            print("SUCCESS: Bound using " + altEvent + ".add() for " + buttonName);
                            boundSuccessfully = true;
                            break;
                        }
                    }
                }
                
                if (!boundSuccessfully) {
                    print("ERROR: Could not find any suitable event binding for " + buttonName);
                    print("SUGGESTION: Check if the changelog container button has the correct script components attached");
                }
                
                return;
            }
            return;
        }

        // Standard binding logic
        if (typeof targetComponent.onButtonPinched.subscribe === 'function') {
            targetComponent.onButtonPinched.subscribe(function(eventData) {
                handlePinchEvent(buttonName, "subscribe", eventData);
            });
            print("Binding successful using subscribe() for button: " + buttonName);
        } 
        else if (typeof targetComponent.onButtonPinched.add === 'function') {
            print("INFO: 'onButtonPinched' for '" + buttonName + "' does not have 'subscribe'. Trying fallback '.add()'.");
            targetComponent.onButtonPinched.add(function() {
                handlePinchEvent(buttonName, "add");
            });
            print("Binding successful using fallback '.add()' for button: " + buttonName);
        } 
        else if (targetComponent.onButtonPinched !== null) {
            print("INFO: Trying direct assignment for '" + buttonName + "'.");
            targetComponent.onButtonPinched = function() {
                handlePinchEvent(buttonName, "direct");
            };
            print("Binding successful using direct assignment for button: " + buttonName);
        }
        else {
            print("ERROR: WelcomeScreenManager - Target component for '" + buttonName + "' has 'onButtonPinched' but lacks 'subscribe', 'add' methods, and cannot be directly assigned.");
            print("DEBUG: onButtonPinched type: " + typeof targetComponent.onButtonPinched);
        }
    } catch (e) {
        print("ERROR: WelcomeScreenManager - Failed during binding attempt for " + buttonName + ": " + e);
        print("DEBUG: Exception details: " + e.message);
    }
}

// Common handler logic for pinch events
function handlePinchEvent(buttonName, methodUsed, eventData) {
    print("DEBUG: Pinch event RECEIVED via " + methodUsed + " for button: " + buttonName);
    print("DEBUG: Current state when '" + buttonName + "' pinched: " + currentState);
    
    var isRelevant = false;
    if (buttonName === "Acknowledge" && currentState === STATES.WELCOME) {
        isRelevant = true;
    } else if (buttonName === "Changelog" && currentState === STATES.WELCOME) {
        isRelevant = true;
    } else if (buttonName === "AcknowledgeChangelog" && currentState === STATES.CHANGELOG) {
        isRelevant = true;
    }

    print("DEBUG: Is '" + buttonName + "' relevant for current state '" + currentState + "'? " + isRelevant);
    
    if (isRelevant) {
        print("EVENT: Button pinch is relevant, executing callback for: " + buttonName);
        switch(buttonName) {
            case "Acknowledge":
                switchToState(STATES.MAIN_UI);
                break;
            case "Changelog":
                switchToState(STATES.CHANGELOG);
                break;
            case "AcknowledgeChangelog":
                print("DEBUG: Returning from changelog to welcome screen");
                switchToState(STATES.WELCOME);
                break;
            default:
                print("WARN: Unknown button name in handlePinchEvent: " + buttonName);
                break;
        }
    } else {
        print("INFO: Pinch event ignored for " + buttonName + " as it's not relevant for the current state '" + currentState + "'.");
    }
}

// --- Initialization ---
function initialize() {
    print("Initializing WelcomeScreenManager...");
    
    if (!validateInputs()) {
        print("ERROR: WelcomeScreenManager initialization failed due to missing inputs.");
        return;
    }

    // Disable all UI elements first
    disableAllUI();
    
    print("Starting button initialization process...");
    
    // Initialize all buttons with proper container activation
    initializeAllButtons();
    
    print("WelcomeScreenManager initialized successfully. Awaiting user interaction.");
}

// --- Script Entry Point & Cleanup ---
initialize();

script.destroy = function() {
    print("Destroying WelcomeScreenManager...");
    disableAllUI();
    print("WelcomeScreenManager destroyed.");
};
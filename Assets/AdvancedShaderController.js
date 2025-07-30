// ----- LENS STUDIO - CONTRÔLEUR DE SHADER 3D MULTI-AXES & MULTI-MATÉRIAUX -----
//
// Description:
// Ce script lie la position 3D (X, Y, Z), la rotation 3D (X, Y, Z) et la scale d'un objet à sept paramètres Float
// distincts d'un ou plusieurs shaders. Chaque axe est configurable indépendamment.
//
// @input SceneObject targetObject {"label":"Objet à Suivre"}
// @input Asset.Material[] materials {"label":"Matériaux du Shader"}

// @input bool useLocalPosition = true {"label":"Utiliser la Position Locale"}
// @input bool useLocalRotation = true {"label":"Utiliser la Rotation Locale"}
// @input bool useLocalScale = true {"label":"Utiliser la Scale Locale"}
// @input float sensitivity = 1.0 {"label":"Sensibilité Globale"}

// --- AXE X (Gauche / Droite) ---
// @input bool controlX = true {"label":"Activer l'Axe X", "group":"Axe X (Gauche/Droite)"}
// @input string floatParameterNameX = "repetition" {"label":"Nom du Paramètre (X)", "group":"Axe X (Gauche/Droite)"}
// @input float sensitivityX = 1.0 {"label":"Sensibilité Axe X", "group":"Axe X (Gauche/Droite)"}
// @input float minX = -10.0 {"label":"Position X Minimale", "group":"Axe X (Gauche/Droite)"}
// @input float maxX = 10.0 {"label":"Position X Maximale", "group":"Axe X (Gauche/Droite)"}
// @input float minValueX = 1.0 {"label":"Valeur Float Minimale", "group":"Axe X (Gauche/Droite)"}
// @input float maxValueX = 20.0 {"label":"Valeur Float Maximale", "group":"Axe X (Gauche/Droite)"}

// --- AXE Y (Haut / Bas) ---
// @input bool controlY = false {"label":"Activer l'Axe Y", "group":"Axe Y (Haut/Bas)"}
// @input string floatParameterNameY = "intensity" {"label":"Nom du Paramètre (Y)", "group":"Axe Y (Haut/Bas)"}
// @input float sensitivityY = 1.0 {"label":"Sensibilité Axe Y", "group":"Axe Y (Haut/Bas)"}
// @input float minY = -10.0 {"label":"Position Y Minimale", "group":"Axe Y (Haut/Bas)"}
// @input float maxY = 10.0 {"label":"Position Y Maximale", "group":"Axe Y (Haut/Bas)"}
// @input float minValueY = 0.0 {"label":"Valeur Float Minimale", "group":"Axe Y (Haut/Bas)"}
// @input float maxValueY = 1.0 {"label":"Valeur Float Maximale", "group":"Axe Y (Haut/Bas)"}

// --- AXE Z (Profondeur) ---
// @input bool controlZ = false {"label":"Activer l'Axe Z", "group":"Axe Z (Profondeur)"}
// @input string floatParameterNameZ = "zoom" {"label":"Nom du Paramètre (Z)", "group":"Axe Z (Profondeur)"}
// @input float sensitivityZ = 1.0 {"label":"Sensibilité Axe Z", "group":"Axe Z (Profondeur)"}
// @input float minZ = -10.0 {"label":"Position Z Minimale", "group":"Axe Z (Profondeur)"}
// @input float maxZ = 10.0 {"label":"Position Z Maximale", "group":"Axe Z (Profondeur)"}
// @input float minValueZ = 1.0 {"label":"Valeur Float Minimale", "group":"Axe Z (Profondeur)"}
// @input float maxValueZ = 5.0 {"label":"Valeur Float Maximale", "group":"Axe Z (Profondeur)"}

// --- ROTATION X ---
// @input bool controlRotationX = false {"label":"Activer la Rotation X", "group":"Rotation X"}
// @input string floatParameterNameRotationX = "rotation_x" {"label":"Nom du Paramètre (Rotation X)", "group":"Rotation X"}
// @input float sensitivityRotationX = 1.0 {"label":"Sensibilité Rotation X", "group":"Rotation X"}
// @input float minRotationX = -180.0 {"label":"Rotation X Minimale", "group":"Rotation X"}
// @input float maxRotationX = 180.0 {"label":"Rotation X Maximale", "group":"Rotation X"}
// @input float minValueRotationX = 0.0 {"label":"Valeur Float Minimale", "group":"Rotation X"}
// @input float maxValueRotationX = 1.0 {"label":"Valeur Float Maximale", "group":"Rotation X"}

// --- ROTATION Y ---
// @input bool controlRotationY = false {"label":"Activer la Rotation Y", "group":"Rotation Y"}
// @input string floatParameterNameRotationY = "rotation_y" {"label":"Nom du Paramètre (Rotation Y)", "group":"Rotation Y"}
// @input float sensitivityRotationY = 1.0 {"label":"Sensibilité Rotation Y", "group":"Rotation Y"}
// @input float minRotationY = -180.0 {"label":"Rotation Y Minimale", "group":"Rotation Y"}
// @input float maxRotationY = 180.0 {"label":"Rotation Y Maximale", "group":"Rotation Y"}
// @input float minValueRotationY = 0.0 {"label":"Valeur Float Minimale", "group":"Rotation Y"}
// @input float maxValueRotationY = 1.0 {"label":"Valeur Float Maximale", "group":"Rotation Y"}

// --- ROTATION Z ---
// @input bool controlRotationZ = false {"label":"Activer la Rotation Z", "group":"Rotation Z"}
// @input string floatParameterNameRotationZ = "rotation_z" {"label":"Nom du Paramètre (Rotation Z)", "group":"Rotation Z"}
// @input float sensitivityRotationZ = 1.0 {"label":"Sensibilité Rotation Z", "group":"Rotation Z"}
// @input float minRotationZ = -180.0 {"label":"Rotation Z Minimale", "group":"Rotation Z"}
// @input float maxRotationZ = 180.0 {"label":"Rotation Z Maximale", "group":"Rotation Z"}
// @input float minValueRotationZ = 0.0 {"label":"Valeur Float Minimale", "group":"Rotation Z"}
// @input float maxValueRotationZ = 1.0 {"label":"Valeur Float Maximale", "group":"Rotation Z"}

// --- SCALE GLOBALE ---
// @input bool controlScale = false {"label":"Activer le Contrôle de Scale", "group":"Scale Globale"}
// @input string floatParameterNameScale = "scale_modifier" {"label":"Nom du Paramètre (Scale)", "group":"Scale Globale"}
// @input float sensitivityScale = 1.0 {"label":"Sensibilité Scale", "group":"Scale Globale"}
// @input float minScale = 0.1 {"label":"Scale Minimale", "group":"Scale Globale"}
// @input float maxScale = 5.0 {"label":"Scale Maximale", "group":"Scale Globale"}
// @input float minValueScale = 0.1 {"label":"Valeur Float Minimale", "group":"Scale Globale"}
// @input float maxValueScale = 10.0 {"label":"Valeur Float Maximale", "group":"Scale Globale"}


// --- Initialisation ---
if (!script.targetObject || !script.materials || script.materials.length === 0) {
    print("ERREUR : Assurez-vous d'assigner 'Target Object' et au moins un 'Material' !");
} else {
    print("INFO : Contrôleur Multi-Axes initialisé avec " + script.materials.length + " matériau(x).");
    if (script.controlX) print("-> Axe X activé pour contrôler '" + script.floatParameterNameX + "'");
    if (script.controlY) print("-> Axe Y activé pour contrôler '" + script.floatParameterNameY + "'");
    if (script.controlZ) print("-> Axe Z activé pour contrôler '" + script.floatParameterNameZ + "'");
    if (script.controlRotationX) print("-> Rotation X activée pour contrôler '" + script.floatParameterNameRotationX + "'");
    if (script.controlRotationY) print("-> Rotation Y activée pour contrôler '" + script.floatParameterNameRotationY + "'");
    if (script.controlRotationZ) print("-> Rotation Z activée pour contrôler '" + script.floatParameterNameRotationZ + "'");
    if (script.controlScale) print("-> Scale activée pour contrôler '" + script.floatParameterNameScale + "'");
}
// --------------------

function mapRange(value, inMin, inMax, outMin, outMax) {
  var clampedValue = Math.min(Math.max(value, inMin), inMax);
  var normalizedValue = (clampedValue - inMin) / (inMax - inMin);
  return outMin + normalizedValue * (outMax - outMin);
}

function updateMaterialParameter(parameterName, value) {
    // Applique la valeur à tous les matériaux assignés
    for (var i = 0; i < script.materials.length; i++) {
        var material = script.materials[i];
        if (material && material.mainPass) {
            try {
                material.mainPass[parameterName] = value;
            } catch (error) {
                print("AVERTISSEMENT : Le paramètre '" + parameterName + "' n'existe pas dans le matériau " + (i + 1));
            }
        }
    }
}

function radiansToDegrees(radians) {
    return radians * (180.0 / Math.PI);
}

function onUpdate() {
    if (!script.targetObject || !script.materials || script.materials.length === 0) return;

    // Récupère le vecteur de position (local ou mondial) une seule fois
    var position = script.useLocalPosition 
        ? script.targetObject.getTransform().getLocalPosition() 
        : script.targetObject.getTransform().getWorldPosition();

    // Récupère le vecteur de rotation (local ou mondial) une seule fois
    var rotation = script.useLocalRotation 
        ? script.targetObject.getTransform().getLocalRotation() 
        : script.targetObject.getTransform().getWorldRotation();

    // Récupère le vecteur de scale (local ou mondial) une seule fois
    var scale = script.useLocalScale 
        ? script.targetObject.getTransform().getLocalScale() 
        : script.targetObject.getTransform().getWorldScale();

    // Convertit la rotation en angles d'Euler (en degrés)
    var eulerAngles = rotation.toEulerAngles();
    var rotationX = radiansToDegrees(eulerAngles.x);
    var rotationY = radiansToDegrees(eulerAngles.y);
    var rotationZ = radiansToDegrees(eulerAngles.z);

    // Calcule la scale globale (moyenne des 3 axes)
    var globalScale = (scale.x + scale.y + scale.z) / 3.0;

    // Applique le contrôle pour l'axe X si activé
    if (script.controlX && script.floatParameterNameX) {
        var adjustedPositionX = position.x * script.sensitivity * script.sensitivityX;
        var mappedValueX = mapRange(adjustedPositionX, script.minX, script.maxX, script.minValueX, script.maxValueX);
        updateMaterialParameter(script.floatParameterNameX, mappedValueX);
    }
    
    // Applique le contrôle pour l'axe Y si activé
    if (script.controlY && script.floatParameterNameY) {
        var adjustedPositionY = position.y * script.sensitivity * script.sensitivityY;
        var mappedValueY = mapRange(adjustedPositionY, script.minY, script.maxY, script.minValueY, script.maxValueY);
        updateMaterialParameter(script.floatParameterNameY, mappedValueY);
    }

    // Applique le contrôle pour l'axe Z si activé
    if (script.controlZ && script.floatParameterNameZ) {
        var adjustedPositionZ = position.z * script.sensitivity * script.sensitivityZ;
        var mappedValueZ = mapRange(adjustedPositionZ, script.minZ, script.maxZ, script.minValueZ, script.maxValueZ);
        updateMaterialParameter(script.floatParameterNameZ, mappedValueZ);
    }

    // Applique le contrôle pour la rotation X si activé
    if (script.controlRotationX && script.floatParameterNameRotationX) {
        var adjustedRotationX = rotationX * script.sensitivity * script.sensitivityRotationX;
        var mappedValueRotationX = mapRange(adjustedRotationX, script.minRotationX, script.maxRotationX, script.minValueRotationX, script.maxValueRotationX);
        updateMaterialParameter(script.floatParameterNameRotationX, mappedValueRotationX);
    }

    // Applique le contrôle pour la rotation Y si activé
    if (script.controlRotationY && script.floatParameterNameRotationY) {
        var adjustedRotationY = rotationY * script.sensitivity * script.sensitivityRotationY;
        var mappedValueRotationY = mapRange(adjustedRotationY, script.minRotationY, script.maxRotationY, script.minValueRotationY, script.maxValueRotationY);
        updateMaterialParameter(script.floatParameterNameRotationY, mappedValueRotationY);
    }

    // Applique le contrôle pour la rotation Z si activé
    if (script.controlRotationZ && script.floatParameterNameRotationZ) {
        var adjustedRotationZ = rotationZ * script.sensitivity * script.sensitivityRotationZ;
        var mappedValueRotationZ = mapRange(adjustedRotationZ, script.minRotationZ, script.maxRotationZ, script.minValueRotationZ, script.maxValueRotationZ);
        updateMaterialParameter(script.floatParameterNameRotationZ, mappedValueRotationZ);
    }

    // Applique le contrôle pour la scale si activé
    if (script.controlScale && script.floatParameterNameScale) {
        var adjustedScale = globalScale * script.sensitivity * script.sensitivityScale;
        var mappedValueScale = mapRange(adjustedScale, script.minScale, script.maxScale, script.minValueScale, script.maxValueScale);
        updateMaterialParameter(script.floatParameterNameScale, mappedValueScale);
    }
}

var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(onUpdate);
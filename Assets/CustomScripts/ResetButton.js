//@input Component.ScriptComponent pinchButtonScript
//@input SceneObject pyramid

// Récupération du composant script (contenant le PinchButton)
var pinchButton = script.pinchButtonScript;

// Sécurité : Vérifie la présence du signal onButtonPinched
if (!pinchButton || !pinchButton.onButtonPinched || typeof pinchButton.onButtonPinched.add !== "function") {
    print("❌ Le composant PinchButton n'expose pas 'onButtonPinched' comme un Signal valide.");
    return;
}

if (!script.pyramid) {
    print("❌ Aucun objet pyramide n'est assigné.");
    return;
}

// Sauvegarde de la position locale d’origine
var initialLocalPos = script.pyramid.getTransform().getLocalPosition();

pinchButton.onButtonPinched.add(function () {
    print("✅ PinchButton déclenché → reset de la pyramide");
    script.pyramid.getTransform().setLocalPosition(initialLocalPos);
});

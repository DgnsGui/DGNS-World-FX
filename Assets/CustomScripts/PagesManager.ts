import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { InteractorEvent } from 'SpectaclesInteractionKit/Core/Interactor/InteractorEvent';

// Fix for Time/Location permission issue
require('LensStudio:ProcessedLocationModule');

@component
export class PageManager extends BaseScriptComponent {
    // Input references for navigation buttons
    @input('Component.ScriptComponent')
    nextButton: PinchButton;

    @input('Component.ScriptComponent')
    prevButton: PinchButton;

    // Input references for info tutorial
    @input('Component.ScriptComponent')
    infoButton: PinchButton;

    @input('Component.ScriptComponent')
    acknowledgeButton: PinchButton;

    @input('SceneObject')
    tutorialContainer: SceneObject;

    // Input references for text
    @input('Component.Text')
    pageNumberText: Text;

    // Input references for pages (seulement 2 pages maintenant)
    @input('SceneObject')
    page0: SceneObject;

    @input('SceneObject')
    page1: SceneObject;

    private currentPageIndex: number = 0;
    private pages: SceneObject[] = [];
    private isTutorialVisible: boolean = false;

    onAwake() {
        // Initialize pages array with only 2 pages
        this.pages = [this.page0, this.page1].filter(page => page != null);

        // Hide all pages except the first one
        this.pages.forEach((page, index) => {
            page.enabled = index === 0;
        });

        // Hide tutorial container initially
        if (this.tutorialContainer) {
            this.tutorialContainer.enabled = false;
            print("Tutorial container initialized and hidden");
        } else {
            print("ERROR: Tutorial container not assigned");
        }

        // Set up next button
        if (this.nextButton) {
            this.nextButton.onButtonPinched.add((event: InteractorEvent) => {
                print("Next button pressed");
                this.navigateToNextPage();
            });
            print("Next button event listener added");
        } else {
            print("ERROR: Next button not assigned");
        }

        // Set up previous button
        if (this.prevButton) {
            this.prevButton.onButtonPinched.add((event: InteractorEvent) => {
                print("Previous button pressed");
                this.navigateToPreviousPage();
            });
            print("Previous button event listener added");
        } else {
            print("ERROR: Previous button not assigned");
        }

        // Set up info button with debug logging
        if (this.infoButton) {
            this.infoButton.onButtonPinched.add((event: InteractorEvent) => {
                print("INFO BUTTON PRESSED - Showing tutorial");
                this.showTutorial();
            });
            print("Info button event listener added successfully");
        } else {
            print("ERROR: Info button not assigned - CHECK INSPECTOR");
        }

        // Set up acknowledge button
        if (this.acknowledgeButton) {
            this.acknowledgeButton.onButtonPinched.add((event: InteractorEvent) => {
                print("Acknowledge button pressed");
                this.hideTutorial();
            });
            print("Acknowledge button event listener added");
        } else {
            print("ERROR: Acknowledge button not assigned");
        }

        // Initialize page number text
        this.updatePageNumberText();
        
        // Debug: Print all assigned components
        this.debugAssignedComponents();
    }

    private debugAssignedComponents(): void {
        print("=== DEBUG: Component Assignments ===");
        print(`Next Button: ${this.nextButton ? "✓ Assigned" : "✗ Missing"}`);
        print(`Prev Button: ${this.prevButton ? "✓ Assigned" : "✗ Missing"}`);
        print(`Info Button: ${this.infoButton ? "✓ Assigned" : "✗ Missing"}`);
        print(`Acknowledge Button: ${this.acknowledgeButton ? "✓ Assigned" : "✗ Missing"}`);
        print(`Tutorial Container: ${this.tutorialContainer ? "✓ Assigned" : "✗ Missing"}`);
        print(`Page Number Text: ${this.pageNumberText ? "✓ Assigned" : "✗ Missing"}`);
        print(`Pages Count: ${this.pages.length}`);
        print("=====================================");
    }

    private navigateToNextPage(): void {
        if (this.currentPageIndex < this.pages.length - 1) {
            // Hide current page
            this.pages[this.currentPageIndex].enabled = false;
            // Show next page
            this.currentPageIndex++;
            this.pages[this.currentPageIndex].enabled = true;
            this.updatePageNumberText();
            print(`Navigated to page ${this.currentPageIndex + 1}`);
        } else {
            print("Already on last page");
        }
    }

    private navigateToPreviousPage(): void {
        if (this.currentPageIndex > 0) {
            // Hide current page
            this.pages[this.currentPageIndex].enabled = false;
            // Show previous page
            this.currentPageIndex--;
            this.pages[this.currentPageIndex].enabled = true;
            this.updatePageNumberText();
            print(`Navigated to page ${this.currentPageIndex + 1}`);
        } else {
            print("Already on first page");
        }
    }

    private showTutorial(): void {
        print("showTutorial() called");
        if (this.tutorialContainer) {
            print(`Tutorial container found. Current state: ${this.tutorialContainer.enabled ? "enabled" : "disabled"}`);
            this.tutorialContainer.enabled = true;
            this.isTutorialVisible = true;
            print("Tutorial container set to enabled");
            print(`New state: ${this.tutorialContainer.enabled ? "enabled" : "disabled"}`);
        } else {
            print("ERROR: Tutorial container is null in showTutorial()");
        }
    }

    private hideTutorial(): void {
        print("hideTutorial() called");
        if (this.tutorialContainer) {
            print(`Tutorial container found. Current state: ${this.tutorialContainer.enabled ? "enabled" : "disabled"}`);
            this.tutorialContainer.enabled = false;
            this.isTutorialVisible = false;
            print("Tutorial container set to disabled");
        } else {
            print("ERROR: Tutorial container is null in hideTutorial()");
        }
    }

    private updatePageNumberText(): void {
        if (this.pageNumberText) {
            // Affiche le numéro de 1 à 2
            const pageNumber = (this.currentPageIndex + 1).toString();
            this.pageNumberText.text = pageNumber;
            print(`Page number updated to: ${pageNumber}`);
        } else {
            print("Warning: Page number text not assigned");
        }
    }

    // Optional: Method to check if tutorial is currently visible
    public isTutorialCurrentlyVisible(): boolean {
        return this.isTutorialVisible;
    }

    // Debug method to manually test tutorial visibility
    public debugToggleTutorial(): void {
        if (this.isTutorialVisible) {
            this.hideTutorial();
        } else {
            this.showTutorial();
        }
    }
}
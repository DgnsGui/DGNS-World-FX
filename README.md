DGNS World FX - A Lens for Spectacles
![alt text](https://img.shields.io/badge/License-MIT-yellow.svg)
A powerful Lens for Spectacles (2021) that projects customizable GLSL shaders onto the real-world environment, complete with real-time controls and an integrated music player.
![alt text](https://s14.gifyu.com/images/bN2EJ.gif)

🚀 Features
Live Shader Projection: Applies complex GLSL shaders onto real-world surfaces like floors, walls, and ceilings.
Interactive Controls: Modify shader parameters in real-time using UI panels and hand gestures.
Built-in Music Player: An integrated audio player to listen to music tracks while experiencing the Lens.
Dynamic UI: Control panels to toggle effects, switch pages, and manage the experience on the fly.

✅ Requirements
Before you begin, ensure you have the following installed:
Lens Studio: The IDE for creating Snapchat Lenses. (Version 4.x or newer recommended).
Git: The version control system.
Git LFS (Large File Storage): This is mandatory. This project uses Git LFS to handle large assets like audio tracks and textures. Without it, you will only download small pointer files instead of the actual assets.

🛠️ Installation & Setup
Follow these steps to get the project running:

1. Install Git LFS
If you don't have Git LFS installed, you must run this command once on your machine to set it up:
Generated bash
git lfs install
Use code with caution.
Bash
This command initializes Git LFS. You only need to do this one time.
2. Clone the Repository
Open your terminal or command prompt and clone this repository using the following command. Git LFS will automatically detect the .gitattributes file and download the large files during this process.
Generated bash
git clone https://github.com/YourUsername/DGNS-World-FX-Spectacles-Lens.git
Use code with caution.
Bash
(Replace YourUsername/DGNS-World-FX-Spectacles-Lens.git with the actual URL of your repository)
3. Open the Project
Navigate to the cloned directory and open the DGNS World FX V2 Backup 2.lsproj file with Lens Studio.
4. Send to Spectacles
Once the project is open in Lens Studio, you can pair your Spectacles and push the Lens to them using the "Send to Snapchat" panel.

📂 Codebase Overview
This project is built on several key scripts that manage its functionality:
PageManager.ts: Manages navigation between the different UI pages (e.g., main controls, tutorial).
WorldEffectsManager2.ts: Handles the activation and deactivation of the primary visual shader effects, ensuring only one is active at a time.
SimpleMusicPlayer.ts: Controls the background music player, including play/pause, next/previous track, and UI updates.
Control Surfaces 2.ts: Manages the toggling of individual surfaces (floor, walls, ceiling) within the shaders.
AdvancedShaderController.js: Links the 3D transform (position, rotation, scale) of a target object to shader parameters, allowing for dynamic manipulation.
ResetButton.js: A simple utility to reset an object's position to its initial state.
WelcomePrefab.js: Manages the initial welcome screen and changelog visibility.

🤝 How to Contribute
Contributions are welcome! Feel free to open an issue to report a bug or suggest a feature. If you'd like to contribute code, please fork the repository and submit a pull request.
Fork the Project
Create your Feature Branch (git checkout -b feature/AmazingFeature)
Commit your Changes (git commit -m 'Add some AmazingFeature')
Push to the Branch (git push origin feature/AmazingFeature)
Open a Pull Request

📄 License
This project is distributed under the MIT License. See the LICENSE file for more details.
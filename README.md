![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)
![Platform](https://img.shields.io/badge/Platform-Snap_Spectacles24-black.svg)
![Tech](https://img.shields.io/badge/Powered_by-Lens_Studio_5.10-yellow.svg)

<h1 align="center">DGNS World FX - A Lens for Spectacles</h1>

<p align="center">
  <em>A powerful AR Lens for Spectacles24 that projects customizable GLSL shaders onto the real-world environment, with real-time controls and an integrated music player.</em>
</p>

![ezgif-5f013fb7547119](https://github.com/user-attachments/assets/c7addd51-6d8b-4256-bea1-762c554f133a)


---

## 🚀 Features

- **Live Shader Projection** – Projects complex GLSL shaders onto real-world surfaces (floors, walls, ceilings).
- **Surface Toggle** – Toggle buttons, to activate projection on floor, walls and ceilings independently.
- **Interactive Controls** – Modify shader parameters in real time using UI panels and hand gestures.
- **Built-in Music Player** – Integrated audio player to enhance your immersive AR experience.
- **Dynamic UI** – Toggle effects, switch pages, and manage everything on the fly.

---

## ✅ Requirements

Before you begin, make sure you have the following installed:

- **[Lens Studio](https://lensstudio.snapchat.com/)** – Version 5.x or newer recommended.
- **[Git](https://git-scm.com/)** – Version control system.
- **[Git LFS](https://git-lfs.com/)** – Required to handle large assets (audio tracks, textures).

---

## 🛠️ Installation & Setup

1. **Install Git LFS** (one-time setup):
   ```bash
   git lfs install
Clone the Repository:

bash
Copier
Modifier
git clone https://github.com/DGNSGui/DGNS-World-FX-Spectacles-Lens.git
Open the Project:

Navigate to the cloned directory.

Open the file DGNS World FX V2 Backup 2.lsproj with Lens Studio.


Deploy to Spectacles:

---

📂 Codebase Overview
File	Description
PageManager.ts	Manages navigation between UI pages.

WorldEffectsManager2.ts	Activates/deactivates shader effects, ensuring only one runs at a time.

SimpleMusicPlayer.ts	Controls audio playback and UI updates for the music player.

Control Surfaces 2.ts	Toggles shader surfaces (floor, walls, ceiling).

AdvancedShaderController.js	Links 3D object transform to shader parameters dynamically.

ResetButton.js	Resets object position to its initial state.

WelcomePrefab.js	Handles the welcome screen and changelog display.

---

🤝 Contribution Guidelines
Contributions are welcome! To contribute:

Fork the repository.

Create a feature branch:

bash
Copier
Modifier
git checkout -b feature/MyNewFeature
Commit your changes:

bash
Copier
Modifier
git commit -m "Add MyNewFeature"
Push the branch:

bash
Copier
Modifier
git push origin feature/MyNewFeature
Open a Pull Request on GitHub.
---
📄 License
This project is licensed under the MIT License.
See the LICENSE file for details.

<p align="center"> Developed with ❤️ by <strong>GuillaumeDGNS</strong> </p>

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + Vite frontend application featuring a 3D ocean scene built with Three.js and React Three Fiber. The application visualizes a project deployment workflow using a nautical metaphor: clients send projects as "bottles" from boats to a cargo ship representing the admin/server.

## Development Commands

### Running the application
```bash
npm run dev      # Start development server with HMR
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Architecture

### Core Technology Stack
- **React 19.2** - UI framework
- **Vite 7.2** - Build tool and dev server
- **Three.js 0.181** - 3D graphics library
- **@react-three/fiber 9.4** - React renderer for Three.js
- **@react-three/drei 10.7** - Useful helpers for R3F
- **@react-three/postprocessing 3.0** - Post-processing effects

### Authentication System
The application requires authentication before accessing the main 3D views. Authentication flow is managed in `App.jsx`:

- **RealisticCRT** (`src/pages/RealisticCRT.jsx`) - Main authentication screen featuring:
  - Realistic vintage CRT monitor aesthetic (Commodore 1084S style)
  - Migration visual metaphor: legacy tech icons flow into monitor (COBOL, FORTRAN, PERL) and modern tech flows out (Docker, K8s, React)
  - Windows XP desktop environment with floppy disk icons for LOGIN.EXE and REGISTER.EXE
  - Terminal window with typing animations
  - Full CRT effects: scanlines, burn-in, glass curvature, phosphor glow

- **LoginPage** (`src/pages/LoginPage.jsx`) - Alternative terminal-style login interface (not currently used, but available)
- **RegisterPage** (`src/pages/RegisterPage.jsx`) - Alternative terminal-style registration (not currently used, but available)

**User State Management:**
- `user` object stored in App state contains `{username, role, email?}`
- `role` can be 'admin' or 'client'
- Admin users can toggle between client and admin views
- Regular users only see client view with logout button
- Admin credentials (temporary): username='admin', password='admin123'

### View System
The application has two distinct views managed by `App.jsx`:
- **ClientView** (`src/scenes/ClientView.jsx`) - First-person perspective from a boat, allows uploading projects
- **AdminView** (`src/scenes/AdminView.jsx`) - Bird's-eye view of cargo ship receiving projects

State management uses React's `useState` to track:
- Current view (client/admin)
- Bottles array (representing submitted projects)
- User authentication state (user object)

### 3D Components

#### Ocean System
- **Ocean component** (`src/components/Ocean.jsx`) - Animated water surface with custom shaders
- **Shaders** (`src/shaders/oceanShader.js`) - Custom vertex and fragment shaders creating:
  - Multi-layer wave animation using sine/cosine functions
  - Color gradients (deep blue to surface blue to foam white)
  - Pixelated/quantized colors for retro aesthetic
  - Foam on wave peaks and sparkle effects

#### Scene Objects
- **Boat** (`src/components/Boat.jsx`) - Client's vessel
- **CargoShip** (`src/components/CargoShip.jsx`) - Admin's receiving ship
- **Bottle** (`src/components/Bottle.jsx`) - Detailed 3D message bottle with:
  - Three animation phases: throwing (parabolic arc), floating, arrived
  - Complex geometry (body, neck, cork, paper scroll, wax seal, label, twine, droplets)
  - All using primitive geometries with `flatShading` for low-poly aesthetic

#### Camera Controls
- **ClientView**: Uses `PointerLockControls` for first-person look-around
- **AdminView**: Uses `OrbitControls` for free camera movement
- **CameraController** (`src/components/CameraController.jsx`): Smooth camera transition animations for zooming into control panel

### Admin Control Panel System
The AdminView includes an immersive control panel experience:
- **Panel Access**: Button to enter control panel, triggers camera zoom animation into cargo ship
- **TeletextPanelView** (`src/components/TeletextPanelView.jsx`): Full-screen retro teletext interface with:
  - CRT monitor aesthetic with scanlines and glow effects
  - Keyboard navigation (Arrow keys, Enter, Escape)
  - Multiple pages (Migration/Projects/Network)
- **TeletextRenderer** (`src/utils/teletextRenderer.js`): UK Teletext/Ceefax style rendering:
  - 40×24 character grid (640×480 pixel canvas)
  - Mode 7 color palette (8 colors: black, red, green, yellow, blue, magenta, cyan, white)
  - Bitmap font rendering with monospace styling
  - Progress bars, project lists, and status displays
- **Animation Flow**: Smooth camera transitions with fade effects when entering/exiting panel mode

### Upload System
**UploadUI** (`src/components/UploadUI.jsx`) provides drag-and-drop folder upload functionality:
- Detects folder drops using `webkitGetAsEntry()`
- Triggers bottle creation animation
- Creates project metadata passed to parent via `onUpload` callback

### Rendering Characteristics
- Uses `flatShading` material property throughout for low-poly aesthetic
- Performance optimizations: `antialias: false`, `powerPreference: "high-performance"`
- Fog effects for depth perception
- Sky component from drei for environment

## File Organization
```
src/
├── pages/           # Authentication pages (RealisticCRT, LoginPage, RegisterPage)
├── scenes/          # Main view components (ClientView, AdminView)
├── components/      # 3D objects and UI (Ocean, Boat, Bottle, ViewToggle, etc.)
├── shaders/         # Custom GLSL shaders
├── utils/           # Utility functions (textures.js, teletextRenderer.js)
└── assets/          # Images (docker.png, kubernetes.png, etc.)
```

## Styling Approach
- Component-specific CSS files (e.g., `UploadUI.css`, `AdminView.css`, `TeletextPanelView.css`, `RealisticCRT.css`, `AuthPages.css`)
- Retro/pixelated aesthetic with monospace fonts (Courier New)
- Overlay UI positioned absolutely over 3D canvas
- CRT effects using CSS animations and pseudo-elements
- Authentication pages use:
  - Windows XP Bliss background gradient
  - Realistic CRT monitor housing with yellowed plastic, dust, screws, ventilation grills
  - Floppy disk icon styling for executable files
  - DOS/terminal window aesthetics
  - Scanlines, phosphor glow, burn-in effects for authenticity

## Key Implementation Patterns

### Animation Pattern
Components use `useFrame` hook from R3F to update on each render frame:
```javascript
useFrame((state, delta) => {
  // Update positions, rotations using state.clock.elapsedTime or delta
});
```

### Shader Uniforms
Ocean shader uniforms are updated via `useFrame` to animate waves:
- `uTime` - elapsed time for animation
- `uWaveStrength` - wave amplitude control
- Color uniforms for water appearance

### Authentication Flow
1. App checks if `user` state exists
2. If no user, renders `RealisticCRT` component
3. User clicks LOGIN.EXE or REGISTER.EXE floppy disk icons
4. Form submission triggers `handleLogin` or `handleRegister` in RealisticCRT
5. After simulated processing delay, callback invokes App's `handleLogin` or `handleRegister`
6. App sets user state with `{username, role, email?}`
7. Main application renders with appropriate view based on user role

### Project Data Flow
1. Client uploads folder via UploadUI
2. UploadUI calls `onUpload` with project metadata
3. ClientView creates bottle with animation
4. After animation delay (5s), bottle data added to App state
5. AdminView receives bottles array and displays them on cargo deck

### Camera Transition Pattern
The admin panel uses a coordinated transition system:
1. Camera zooms into cargo ship command room using `CameraController`
2. Orbit controls disabled during transition
3. Fade overlay provides smooth visual transition
4. Panel UI rendered after animation completes
5. Reverse process for exiting panel

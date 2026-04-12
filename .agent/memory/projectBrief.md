# surfaceType — Project Brief

## One-sentence problem
CSS and DOM text rendering are flat — there is no native way to wrap, project, or flow typeset text onto a 3D mesh surface.

## What it does
Given a Three.js geometry type (sphere, cylinder, torus, or plane) and text content, surfaceType positions typeset text along the surface using troika-three-text for SDF font rendering. Text physically follows the curvature of the object via troika's native curveRadius property, with curvature-aware tracking adjustments.

## Key technical decisions
- Uses troika-three-text's `curveRadius` property — no UV unwrapping needed
- Multi-word text: each word is a separate Text instance distributed around the longitude
- Single-word text: one Text instance with curveRadius set to the geometry radius
- Curvature tracking: letter spacing adjusted by 1/radius * factor (default 0.002)
- React bindings: SurfaceTextMesh via React Three Fiber (R3F), not DOM hooks

## Fundamentally different from DOM tools
- No HTMLElement manipulation, no ResizeObserver, no word spans
- No scroll restoration (not relevant in Three.js context)
- Core function returns a THREE.Group + dispose(), not void
- Site uses R3F Canvas for the demo, not a plain DOM demo

## Package
- npm: @liiift-studio/surfacetype
- version: 0.0.1
- Site: surfacetype.com

## Status
- Phase 2 (Bootstrap): complete
- Phase 3 (Algorithm): complete (createSurfaceText, updateSurfaceText)
- Phase 4 (React bindings): complete (SurfaceTextMesh)
- Phase 5 (Tests): not yet written
- Phase 6 (Site): complete (Next.js + R3F demo)
- Phase 7 (README): not yet written
- Phase 8 (Ship): not started

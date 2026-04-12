// SurfaceText.ts — Three.js Object3D factory that positions troika Text along 3D surface UVs

import { Text } from 'troika-three-text'
import * as THREE from 'three'
import { type SurfaceTextOptions, type SurfaceGeometryType, SURFACE_TEXT_DEFAULTS } from './types'

/**
 * Resolves SurfaceTextOptions against defaults, returning a fully-populated options object.
 * The font property is left as-is (empty string means troika uses its built-in font).
 */
function resolveOptions(options: SurfaceTextOptions): Required<SurfaceTextOptions> {
	return {
		...SURFACE_TEXT_DEFAULTS,
		...options,
	}
}

/**
 * Computes curvature-adjusted letter spacing for a given radius.
 * Tighter curves (smaller radius) produce more adjusted tracking.
 * Returns the original letterSpacing when curvatureTracking is disabled or radius is 0.
 *
 * @param baseLetterSpacing - Base letter spacing in Three.js units
 * @param radius - Radius of the surface (0 = flat/infinite)
 * @param factor - Curvature tracking factor (0.002 default)
 * @returns Adjusted letter spacing value
 */
function curvatureAdjustedTracking(
	baseLetterSpacing: number,
	radius: number,
	factor: number,
): number {
	if (radius <= 0) return baseLetterSpacing
	const curvature = 1 / radius
	return baseLetterSpacing + curvature * factor
}

/**
 * Creates a configured troika Text instance with common properties applied.
 * The caller is responsible for positioning and rotating the returned object.
 */
function makeTextInstance(
	text: string,
	opts: Required<SurfaceTextOptions>,
	letterSpacingOverride?: number,
): Text {
	const t = new Text()
	t.text = text
	t.fontSize = opts.fontSize
	t.letterSpacing = letterSpacingOverride ?? opts.letterSpacing
	t.textAlign = opts.textAlign
	t.color = opts.color
	if (opts.font) t.font = opts.font
	if (opts.maxWidth < Infinity) t.maxWidth = opts.maxWidth
	t.anchorX = 'center'
	t.anchorY = 'middle'
	t.sync()
	return t
}

/**
 * Builds a sphere surface text group.
 * Text wraps around the equator — each word is placed at an angular position along
 * the longitude, rotated so it faces outward from the sphere surface.
 * Uses troika's native curveRadius property so the text itself curves with the surface.
 *
 * @param words - Array of words to distribute around the sphere
 * @param radius - Sphere radius in Three.js units
 * @param opts - Resolved options
 * @returns THREE.Group containing the text instances
 */
function buildSphereGroup(
	words: string[],
	radius: number,
	opts: Required<SurfaceTextOptions>,
): THREE.Group {
	const group = new THREE.Group()

	// Use troika's curveRadius for natural surface-following text.
	// curveRadius curves the text geometry itself to match the sphere's circumference.
	const letterSpacing = opts.curvatureTracking
		? curvatureAdjustedTracking(opts.letterSpacing, radius, opts.curvatureTrackingFactor)
		: opts.letterSpacing

	if (words.length === 1) {
		// Single word: one Text instance placed on the sphere surface, facing outward
		const t = makeTextInstance(words[0], opts, letterSpacing)
		// curveRadius bends the text to follow the sphere surface
		t.curveRadius = radius
		// Place at the sphere surface on the equator
		t.position.set(0, 0, radius)
		group.add(t)
		return group
	}

	// Multiple words: distribute them evenly around the equator
	// Each word gets its own Text instance rotated around the Y axis
	const angleStep = (Math.PI * 2) / words.length
	words.forEach((word, i) => {
		const angle = i * angleStep
		const t = makeTextInstance(word, opts, letterSpacing)
		t.curveRadius = radius
		// Position on sphere surface: rotate around Y axis
		t.position.set(
			Math.sin(angle) * radius,
			0,
			Math.cos(angle) * radius,
		)
		// Face outward from the centre
		t.rotation.y = angle
		group.add(t)
	})

	return group
}

/**
 * Builds a cylinder surface text group.
 * Text wraps around the curved surface of the cylinder.
 * Each word is placed at an angular step along the circumference.
 *
 * @param words - Array of words to distribute around the cylinder
 * @param radius - Cylinder radius in Three.js units
 * @param opts - Resolved options
 * @returns THREE.Group containing the text instances
 */
function buildCylinderGroup(
	words: string[],
	radius: number,
	opts: Required<SurfaceTextOptions>,
): THREE.Group {
	const group = new THREE.Group()

	const letterSpacing = opts.curvatureTracking
		? curvatureAdjustedTracking(opts.letterSpacing, radius, opts.curvatureTrackingFactor)
		: opts.letterSpacing

	if (words.length === 1) {
		const t = makeTextInstance(words[0], opts, letterSpacing)
		t.curveRadius = radius
		t.position.set(0, 0, radius)
		group.add(t)
		return group
	}

	const angleStep = (Math.PI * 2) / words.length
	words.forEach((word, i) => {
		const angle = i * angleStep
		const t = makeTextInstance(word, opts, letterSpacing)
		t.curveRadius = radius
		t.position.set(
			Math.sin(angle) * radius,
			0,
			Math.cos(angle) * radius,
		)
		t.rotation.y = angle
		group.add(t)
	})

	return group
}

/**
 * Builds a torus surface text group.
 * Text flows along the outer ring of the torus, positioned at the outer equator.
 * The tube radius is estimated as ~30% of the major radius.
 *
 * @param words - Array of words to distribute around the torus ring
 * @param majorRadius - Major (ring) radius of the torus in Three.js units
 * @param opts - Resolved options
 * @returns THREE.Group containing the text instances
 */
function buildTorusGroup(
	words: string[],
	majorRadius: number,
	opts: Required<SurfaceTextOptions>,
): THREE.Group {
	const group = new THREE.Group()
	// Torus outer equator is at distance majorRadius from centre
	// The effective curve radius for text is the major radius
	const letterSpacing = opts.curvatureTracking
		? curvatureAdjustedTracking(opts.letterSpacing, majorRadius, opts.curvatureTrackingFactor)
		: opts.letterSpacing

	if (words.length === 1) {
		const t = makeTextInstance(words[0], opts, letterSpacing)
		t.curveRadius = majorRadius
		t.position.set(0, 0, majorRadius)
		group.add(t)
		return group
	}

	const angleStep = (Math.PI * 2) / words.length
	words.forEach((word, i) => {
		const angle = i * angleStep
		const t = makeTextInstance(word, opts, letterSpacing)
		t.curveRadius = majorRadius
		t.position.set(
			Math.sin(angle) * majorRadius,
			0,
			Math.cos(angle) * majorRadius,
		)
		t.rotation.y = angle
		group.add(t)
	})

	return group
}

/**
 * Builds a flat plane text group — the baseline case.
 * A single troika Text object at the origin with no curve.
 * Useful for verifying the render pipeline before introducing curvature.
 *
 * @param text - Full text to render
 * @param opts - Resolved options
 * @returns THREE.Group containing one Text instance
 */
function buildPlaneGroup(
	text: string,
	opts: Required<SurfaceTextOptions>,
): THREE.Group {
	const group = new THREE.Group()
	const t = makeTextInstance(text, opts)
	// Flat plane: no curveRadius, text sits at origin facing the camera (+Z)
	group.add(t)
	return group
}

/**
 * Creates a Three.js Group containing troika Text objects arranged along the
 * surface of a given geometry type. Returns the group and a dispose() function.
 *
 * The returned group should be added to your Three.js scene directly. The dispose()
 * function cleans up all troika Text instances and their GPU resources.
 *
 * @param geometryType - Which geometry shape to project text onto
 * @param options - Text content and visual options
 * @param radius - Radius of the geometry in Three.js units. Default: 1.0
 * @returns Object with the scene group and a dispose cleanup function
 */
export function createSurfaceText(
	geometryType: SurfaceGeometryType,
	options: SurfaceTextOptions,
	radius = 1.0,
): { group: THREE.Group; dispose: () => void } {
	const opts = resolveOptions(options)
	const words = opts.text.trim().split(/\s+/).filter(Boolean)
	const displayText = opts.text.trim()

	let group: THREE.Group

	switch (geometryType) {
		case 'sphere':
			group = buildSphereGroup(words.length > 0 ? words : [''], radius, opts)
			break
		case 'cylinder':
			group = buildCylinderGroup(words.length > 0 ? words : [''], radius, opts)
			break
		case 'torus':
			group = buildTorusGroup(words.length > 0 ? words : [''], radius, opts)
			break
		case 'plane':
		default:
			group = buildPlaneGroup(displayText || '', opts)
			break
	}

	/**
	 * Disposes all troika Text instances in the group, freeing GPU resources.
	 * Call this when removing the group from the scene.
	 */
	function dispose(): void {
		group.traverse((obj) => {
			if (obj instanceof Text) {
				obj.dispose()
			}
		})
	}

	return { group, dispose }
}

/**
 * Updates an existing surface text group in-place by disposing the old group's
 * children and rebuilding. This avoids creating/destroying the group itself,
 * which allows parent scene references to remain valid.
 *
 * @param group - Existing THREE.Group returned by createSurfaceText
 * @param geometryType - Geometry type (may differ from original to reshape)
 * @param options - New text options
 * @param radius - New radius. Default: 1.0
 */
export function updateSurfaceText(
	group: THREE.Group,
	geometryType: SurfaceGeometryType,
	options: SurfaceTextOptions,
	radius = 1.0,
): void {
	// Dispose and remove all existing children
	const toDispose: Text[] = []
	group.traverse((obj) => {
		if (obj instanceof Text) toDispose.push(obj)
	})
	toDispose.forEach((t) => {
		t.dispose()
		t.parent?.remove(t)
	})
	// Also clear any non-Text children (sub-groups)
	while (group.children.length > 0) {
		group.remove(group.children[0])
	}

	// Rebuild into the existing group
	const { group: newGroup } = createSurfaceText(geometryType, options, radius)
	newGroup.children.slice().forEach((child) => {
		newGroup.remove(child)
		group.add(child)
	})
}

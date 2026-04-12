// types.ts — SurfaceTextOptions interface and SurfaceGeometryType enum for surfaceType

/** The supported 3D geometry types that text can be projected onto */
export type SurfaceGeometryType = 'sphere' | 'cylinder' | 'torus' | 'plane'

/** Options controlling how text is rendered onto the 3D surface */
export interface SurfaceTextOptions {
	/** Text content to render */
	text: string
	/** Font URL (WOFF/TTF). Default: uses troika-three-text built-in font */
	font?: string
	/** Font size in Three.js units. Default: 0.1 */
	fontSize?: number
	/** Letter spacing in Three.js units. Default: 0 */
	letterSpacing?: number
	/** Max text width before wrapping (in Three.js units). Default: Infinity (no wrap) */
	maxWidth?: number
	/** Text alignment. Default: 'center' */
	textAlign?: 'left' | 'center' | 'right'
	/** Text colour (hex or CSS string). Default: '#ffffff' */
	color?: string | number
	/**
	 * Whether to apply curvature-aware tracking adjustments — tighter curves get
	 * more letter spacing to compensate for apparent crowding. Default: true
	 */
	curvatureTracking?: boolean
	/**
	 * How much to adjust tracking per unit of curvature (1/radius).
	 * Range: 0 (no effect) to ~0.01 (strong effect). Default: 0.002
	 */
	curvatureTrackingFactor?: number
}

/** Resolved options with all defaults filled in */
export interface ResolvedSurfaceTextOptions extends Required<SurfaceTextOptions> {}

/** Default values for SurfaceTextOptions */
export const SURFACE_TEXT_DEFAULTS: ResolvedSurfaceTextOptions = {
	text: '',
	font: '',
	fontSize: 0.1,
	letterSpacing: 0,
	maxWidth: Infinity,
	textAlign: 'center',
	color: '#ffffff',
	curvatureTracking: true,
	curvatureTrackingFactor: 0.002,
}

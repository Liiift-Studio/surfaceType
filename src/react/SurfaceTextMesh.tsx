// SurfaceTextMesh.tsx — React Three Fiber component wrapping createSurfaceText

import { useRef, useEffect, forwardRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createSurfaceText, updateSurfaceText } from '../core/SurfaceText'
import type { SurfaceTextOptions, SurfaceGeometryType } from '../core/types'

/** Props for SurfaceTextMesh — options plus R3F mesh props */
export interface SurfaceTextMeshProps extends SurfaceTextOptions {
	/** Which geometry shape to project text onto */
	geometryType?: SurfaceGeometryType
	/** Radius of the geometry in Three.js units. Default: 1.0 */
	radius?: number
	/** Position in Three.js scene. Default: [0, 0, 0] */
	position?: [number, number, number]
	/** Rotation in radians. Default: [0, 0, 0] */
	rotation?: [number, number, number]
	/** Scale. Default: [1, 1, 1] */
	scale?: [number, number, number]
	/** Whether to auto-rotate around the Y axis. Default: false */
	autoRotate?: boolean
	/** Speed of auto-rotation in radians per second. Default: 0.3 */
	autoRotateSpeed?: number
}

/**
 * React Three Fiber component that renders text projected onto a 3D surface.
 * Uses troika-three-text for SDF font rendering with native curveRadius support.
 * Automatically recreates the text group when geometry or options change.
 */
export const SurfaceTextMesh = forwardRef<THREE.Group, SurfaceTextMeshProps>(
	(
		{
			geometryType = 'sphere',
			radius = 1.0,
			position = [0, 0, 0],
			rotation = [0, 0, 0],
			scale = [1, 1, 1],
			autoRotate = false,
			autoRotateSpeed = 0.3,
			// SurfaceTextOptions spread
			text,
			font,
			fontSize,
			letterSpacing,
			maxWidth,
			textAlign,
			color,
			curvatureTracking,
			curvatureTrackingFactor,
		},
		forwardedRef,
	) => {
		const groupRef = useRef<THREE.Group>(null)
		const { scene } = useThree()

		// Collect all SurfaceTextOptions into a single object for the core function
		const options: SurfaceTextOptions = {
			text,
			...(font !== undefined && { font }),
			...(fontSize !== undefined && { fontSize }),
			...(letterSpacing !== undefined && { letterSpacing }),
			...(maxWidth !== undefined && { maxWidth }),
			...(textAlign !== undefined && { textAlign }),
			...(color !== undefined && { color }),
			...(curvatureTracking !== undefined && { curvatureTracking }),
			...(curvatureTrackingFactor !== undefined && { curvatureTrackingFactor }),
		}

		// Serialise options to a string so we can detect when they change
		const optionsKey = JSON.stringify({ geometryType, radius, ...options })
		const prevKeyRef = useRef<string>('')
		const initializedRef = useRef(false)

		// Create the surface text group on mount and whenever options change
		useEffect(() => {
			const group = groupRef.current
			if (!group) return

			if (!initializedRef.current) {
				// First render: create fresh
				const { group: surfaceGroup } = createSurfaceText(geometryType, options, radius)
				surfaceGroup.children.slice().forEach((child) => {
					surfaceGroup.remove(child)
					group.add(child)
				})
				initializedRef.current = true
				prevKeyRef.current = optionsKey
			} else if (optionsKey !== prevKeyRef.current) {
				// Options changed: update in-place
				updateSurfaceText(group, geometryType, options, radius)
				prevKeyRef.current = optionsKey
			}

			return () => {
				// Cleanup on unmount — dispose all troika Text children
				// (actual group removal is handled by R3F)
			}
		// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [optionsKey, scene])

		// Auto-rotate animation loop
		useFrame((_state, delta) => {
			if (!autoRotate || !groupRef.current) return
			groupRef.current.rotation.y += autoRotateSpeed * delta
		})

		return (
			<group
				ref={(node) => {
					// Sync both the internal ref and any forwarded ref
					;(groupRef as React.MutableRefObject<THREE.Group | null>).current = node
					if (typeof forwardedRef === 'function') {
						forwardedRef(node)
					} else if (forwardedRef) {
						forwardedRef.current = node
					}
				}}
				position={new THREE.Vector3(...position)}
				rotation={new THREE.Euler(...rotation)}
				scale={new THREE.Vector3(...scale)}
			/>
		)
	},
)

SurfaceTextMesh.displayName = 'SurfaceTextMesh'

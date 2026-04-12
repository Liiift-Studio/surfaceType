"use client"

// SurfaceScene.tsx — R3F scene child that manages the SurfaceTextMesh lifecycle
import { useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { createSurfaceText, updateSurfaceText } from "@liiift-studio/surfacetype"
import type { SurfaceGeometryType } from "@liiift-studio/surfacetype"

/** Props for the R3F scene content */
export interface SurfaceSceneProps {
	/** Geometry type to project text onto */
	geometryType: SurfaceGeometryType
	/** Text content */
	text: string
	/** Font size in Three.js units */
	fontSize: number
	/** Geometry radius */
	radius: number
	/** Whether to auto-rotate around Y axis */
	autoRotate: boolean
}

/**
 * R3F scene child that imperatively manages troika Text instances via createSurfaceText.
 * Uses a THREE.Group primitive so React Three Fiber manages the scene graph object lifecycle,
 * while the troika Text children are managed imperatively inside useEffect.
 */
export function SurfaceScene({
	geometryType,
	text,
	fontSize,
	radius,
	autoRotate,
}: SurfaceSceneProps) {
	const groupRef = useRef<THREE.Group>(null)
	const initializedRef = useRef(false)

	// Serialise all options that affect the 3D output so we detect real changes
	const optionsKey = JSON.stringify({ geometryType, text, fontSize, radius })
	const prevKeyRef = useRef('')

	useEffect(() => {
		const group = groupRef.current
		if (!group) return

		const options = {
			text,
			fontSize,
			color: '#f0ece3',
			curvatureTracking: true,
			curvatureTrackingFactor: 0.002,
		}

		if (!initializedRef.current) {
			// First mount: build the surface text group and attach children
			const { group: surfaceGroup } = createSurfaceText(geometryType, options, radius)
			// Move children from the returned group into our scene group ref
			surfaceGroup.children.slice().forEach((child) => {
				surfaceGroup.remove(child)
				group.add(child)
			})
			initializedRef.current = true
			prevKeyRef.current = optionsKey
		} else if (optionsKey !== prevKeyRef.current) {
			// Options changed: update in-place (disposes old troika Text, creates new)
			updateSurfaceText(group, geometryType, options, radius)
			prevKeyRef.current = optionsKey
		}
	}, [optionsKey, geometryType, text, fontSize, radius])

	// Auto-rotate animation
	useFrame((_state, delta) => {
		if (!autoRotate || !groupRef.current) return
		groupRef.current.rotation.y += 0.4 * delta
	})

	return <group ref={groupRef} />
}

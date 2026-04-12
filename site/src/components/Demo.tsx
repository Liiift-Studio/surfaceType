"use client"

// Interactive R3F demo — shape selector, text input, font size slider, orbit controls
import { useState, useRef, Suspense, useDeferredValue } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import * as THREE from "three"
import type { SurfaceGeometryType } from "@liiift-studio/surfacetype"
import { SurfaceScene } from "./SurfaceScene"

/** Shape selector button labels and ids */
const SHAPES: { id: SurfaceGeometryType; label: string }[] = [
	{ id: 'sphere',   label: 'Sphere'   },
	{ id: 'cylinder', label: 'Cylinder' },
	{ id: 'torus',    label: 'Torus'    },
	{ id: 'plane',    label: 'Plane'    },
]

/**
 * Wireframe mesh showing the underlying geometry so users can see the surface
 * that the text is projected onto.
 */
function WireframeMesh({ geometryType, radius }: { geometryType: SurfaceGeometryType; radius: number }) {
	const material = (
		<meshBasicMaterial
			color="#d4b8f0"
			wireframe
			transparent
			opacity={0.08}
		/>
	)

	switch (geometryType) {
		case 'sphere':
			return (
				<mesh>
					<sphereGeometry args={[radius, 32, 32]} />
					{material}
				</mesh>
			)
		case 'cylinder':
			return (
				<mesh>
					<cylinderGeometry args={[radius, radius, radius * 2, 32, 1, true]} />
					{material}
				</mesh>
			)
		case 'torus':
			return (
				<mesh rotation={[Math.PI / 2, 0, 0]}>
					<torusGeometry args={[radius, radius * 0.3, 16, 64]} />
					{material}
				</mesh>
			)
		case 'plane':
		default:
			return (
				<mesh>
					<planeGeometry args={[radius * 3, radius * 2, 8, 6]} />
					<meshBasicMaterial color="#d4b8f0" wireframe transparent opacity={0.08} />
				</mesh>
			)
	}
}

/**
 * Full interactive demo: R3F canvas with shape selector, text input, font size slider,
 * auto-rotate toggle, and OrbitControls.
 */
export default function Demo() {
	const [shape, setShape] = useState<SurfaceGeometryType>('sphere')
	const [text, setText] = useState('Typography')
	const [fontSize, setFontSize] = useState(0.12)
	const [autoRotate, setAutoRotate] = useState(true)
	const [showWireframe, setShowWireframe] = useState(true)

	// Deferred values prevent expensive 3D re-renders on every keystroke/slider tick
	const deferredText = useDeferredValue(text)
	const deferredFontSize = useDeferredValue(fontSize)
	const deferredShape = useDeferredValue(shape)

	const RADIUS = 1.0

	return (
		<div className="w-full flex flex-col gap-6">
			{/* Controls */}
			<div className="flex flex-wrap items-start gap-6">
				{/* Shape selector */}
				<div className="flex flex-col gap-2">
					<span className="text-xs uppercase tracking-widest opacity-50">Shape</span>
					<div className="flex gap-2 flex-wrap">
						{SHAPES.map(({ id, label }) => (
							<button
								key={id}
								onClick={() => setShape(id)}
								aria-pressed={shape === id}
								className="text-xs px-3 py-1 rounded-full border transition-opacity"
								style={{
									borderColor: 'currentColor',
									opacity: shape === id ? 1 : 0.4,
									background: shape === id ? 'var(--btn-bg)' : 'transparent',
								}}
							>
								{label}
							</button>
						))}
					</div>
				</div>

				{/* Text input */}
				<div className="flex flex-col gap-2 flex-1 min-w-40">
					<label htmlFor="surface-text-input" className="text-xs uppercase tracking-widest opacity-50">
						Text
					</label>
					<input
						id="surface-text-input"
						type="text"
						value={text}
						onChange={e => setText(e.target.value)}
						maxLength={80}
						className="bg-white/10 rounded px-3 py-1.5 text-sm outline-none focus:bg-white/15 transition-colors"
						placeholder="Typography"
					/>
				</div>

				{/* Toggles */}
				<div className="flex flex-col gap-2">
					<span className="text-xs uppercase tracking-widest opacity-50">Options</span>
					<div className="flex gap-2 flex-wrap">
						<button
							onClick={() => setAutoRotate(v => !v)}
							aria-pressed={autoRotate}
							className="text-xs px-3 py-1 rounded-full border transition-opacity"
							style={{
								borderColor: 'currentColor',
								opacity: autoRotate ? 1 : 0.4,
								background: autoRotate ? 'var(--btn-bg)' : 'transparent',
							}}
						>
							Auto-rotate
						</button>
						<button
							onClick={() => setShowWireframe(v => !v)}
							aria-pressed={showWireframe}
							className="text-xs px-3 py-1 rounded-full border transition-opacity"
							style={{
								borderColor: 'currentColor',
								opacity: showWireframe ? 1 : 0.4,
								background: showWireframe ? 'var(--btn-bg)' : 'transparent',
							}}
						>
							Wireframe
						</button>
					</div>
				</div>
			</div>

			{/* Font size slider */}
			<div className="flex flex-col gap-1">
				<div className="flex justify-between text-xs uppercase tracking-widest opacity-50">
					<span>Font Size</span>
					<span className="tabular-nums">{fontSize.toFixed(2)}</span>
				</div>
				<input
					type="range"
					min={0.04}
					max={0.35}
					step={0.01}
					value={fontSize}
					aria-label="Font size in Three.js units"
					onChange={e => setFontSize(Number(e.target.value))}
					onTouchStart={e => e.stopPropagation()}
					style={{ touchAction: 'none' }}
				/>
			</div>

			{/* R3F Canvas */}
			<div
				className="w-full rounded-xl overflow-hidden"
				style={{ height: '55vh', minHeight: 320, background: 'rgba(0,0,0,0.35)' }}
			>
				<Canvas
					camera={{ position: [0, 0.5, 3.5], fov: 45 }}
					gl={{ antialias: true, alpha: true }}
					dpr={[1, 2]}
				>
					<ambientLight intensity={0.6} />
					<directionalLight position={[3, 4, 5]} intensity={1.2} />

					<Suspense fallback={null}>
						{showWireframe && (
							<WireframeMesh geometryType={deferredShape} radius={RADIUS} />
						)}
						<SurfaceScene
							geometryType={deferredShape}
							text={deferredText}
							fontSize={deferredFontSize}
							radius={RADIUS}
							autoRotate={autoRotate}
						/>
					</Suspense>

					<OrbitControls
						enablePan={false}
						minDistance={1.5}
						maxDistance={8}
						autoRotate={false}
					/>
				</Canvas>
			</div>

			<p className="text-xs opacity-50 italic" style={{ lineHeight: '1.8' }}>
				Drag to orbit. Text follows the curvature of the surface using troika-three-text&apos;s native curveRadius — no UV unwrapping required.
			</p>
		</div>
	)
}

"use client"

// Interactive R3F demo — shape selector, text input, font size slider, orbit/gyro/cursor controls
import { useState, useRef, useEffect, Suspense, useDeferredValue } from "react"
import { Canvas, useThree, useFrame } from "@react-three/fiber"
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

/** SVG icon for gyro/tilt mode */
function GyroIcon() {
	return (
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<rect x="7" y="2" width="10" height="20" rx="2" />
			<path d="M12 18h.01" />
		</svg>
	)
}

/** SVG icon for cursor/mouse orbit mode */
function CursorIcon() {
	return (
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<path d="M5 3l14 9-7 1-4 7z" />
		</svg>
	)
}

/**
 * CameraController — lives inside the R3F Canvas. When gyro or cursor mode is
 * active, lerps the camera toward the azimuth/polar target stored in targetRef
 * each frame. Disabled when neither mode is active.
 */
function CameraController({ gyroMode, cursorMode, targetRef }: {
	gyroMode: boolean
	cursorMode: boolean
	targetRef: React.RefObject<{ azimuth: number; polar: number }>
}) {
	const { camera } = useThree()
	useFrame(() => {
		if ((!gyroMode && !cursorMode) || !targetRef.current) return
		const { azimuth, polar } = targetRef.current
		const dist = camera.position.length() || 3.5
		const target = new THREE.Vector3().setFromSphericalCoords(dist, polar, azimuth)
		camera.position.lerp(target, 0.08)
		camera.lookAt(0, 0, 0)
	})
	return null
}

/**
 * Full interactive demo: R3F canvas with shape selector, text input, font size slider,
 * auto-rotate toggle, OrbitControls, gyro-to-orbit, and cursor-to-orbit modes.
 */
export default function Demo() {
	const [shape, setShape] = useState<SurfaceGeometryType>('sphere')
	const [text, setText] = useState('Typography')
	const [fontSize, setFontSize] = useState(0.12)
	const [autoRotate, setAutoRotate] = useState(true)
	const [showWireframe, setShowWireframe] = useState(true)

	// Gyro mode state
	const [gyroMode, setGyroMode] = useState(false)
	const [showGyro, setShowGyro] = useState(false)

	// Cursor mode state
	const [cursorMode, setCursorMode] = useState(false)
	const [showCursor, setShowCursor] = useState(false)

	// Shared camera target ref — written by event listeners, read by CameraController useFrame
	const cameraTarget = useRef({ azimuth: 0, polar: Math.PI / 3 })

	// rAF handle for gyro throttle
	const gyroRafRef = useRef<number | null>(null)

	// Deferred values prevent expensive 3D re-renders on every keystroke/slider tick
	const deferredText = useDeferredValue(text)
	const deferredFontSize = useDeferredValue(fontSize)
	const deferredShape = useDeferredValue(shape)

	const RADIUS = 1.0

	// Detect which mode buttons to show after mount
	useEffect(() => {
		const isTouchOnly = window.matchMedia('(hover: none)').matches
		const hasDeviceOrientation = typeof DeviceOrientationEvent !== 'undefined'
		setShowGyro(isTouchOnly && hasDeviceOrientation)
		setShowCursor(!isTouchOnly)
	}, [])

	// Gyro event handler
	useEffect(() => {
		if (!gyroMode) return

		function handleOrientation(e: DeviceOrientationEvent) {
			// Throttle via rAF
			if (gyroRafRef.current !== null) return
			gyroRafRef.current = requestAnimationFrame(() => {
				gyroRafRef.current = null
				const gamma = e.gamma ?? 0 // left/right tilt: -90 to 90
				const beta  = e.beta  ?? 45 // front/back tilt: -180 to 180, use 15–90

				// Map gamma (-90→90) to azimuth (−π → π)
				const azimuth = (gamma / 90) * Math.PI
				// Map beta (clamp 15→90) to polar (0.8π → 0.2π — top to front)
				const betaClamped = Math.max(15, Math.min(90, beta))
				const polar = 0.8 * Math.PI - ((betaClamped - 15) / 75) * (0.6 * Math.PI)

				cameraTarget.current = { azimuth, polar }
			})
		}

		window.addEventListener('deviceorientation', handleOrientation)
		return () => {
			window.removeEventListener('deviceorientation', handleOrientation)
			if (gyroRafRef.current !== null) {
				cancelAnimationFrame(gyroRafRef.current)
				gyroRafRef.current = null
			}
		}
	}, [gyroMode])

	// Cursor mode event handler
	useEffect(() => {
		if (!cursorMode) return

		function handleMouseMove(e: MouseEvent) {
			// Map x (0→1) to azimuth (0 → 2π)
			const azimuth = (e.clientX / window.innerWidth) * 2 * Math.PI
			// Map y (0→1) to polar (0.2π → 0.8π)
			const polar = 0.2 * Math.PI + (e.clientY / window.innerHeight) * (0.6 * Math.PI)
			cameraTarget.current = { azimuth, polar }
		}

		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === 'Escape') setCursorMode(false)
		}

		window.addEventListener('mousemove', handleMouseMove)
		window.addEventListener('keydown', handleKeyDown)
		return () => {
			window.removeEventListener('mousemove', handleMouseMove)
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [cursorMode])

	/** Toggle gyro mode, requesting iOS permission if needed */
	async function toggleGyro() {
		if (gyroMode) {
			setGyroMode(false)
			return
		}
		// iOS 13+ requires explicit permission
		if (
			typeof DeviceOrientationEvent !== 'undefined' &&
			typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function'
		) {
			try {
				const permission = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission()
				if (permission !== 'granted') return
			} catch {
				return
			}
		}
		setCursorMode(false)
		setAutoRotate(false)
		setGyroMode(true)
	}

	/** Toggle cursor orbit mode */
	function toggleCursor() {
		if (cursorMode) {
			setCursorMode(false)
			return
		}
		setGyroMode(false)
		setAutoRotate(false)
		setCursorMode(true)
	}

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

			{/* Interaction mode buttons — shown based on device capability */}
			{(showCursor || showGyro) && (
				<div className="flex gap-3">
					{showCursor && (
						<button
							onClick={toggleCursor}
							aria-pressed={cursorMode}
							className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition-opacity"
							style={{
								borderColor: 'currentColor',
								opacity: cursorMode ? 1 : 0.4,
								background: cursorMode ? 'var(--btn-bg)' : 'transparent',
							}}
						>
							<CursorIcon />
							{cursorMode ? 'Esc to exit' : 'Cursor'}
						</button>
					)}
					{showGyro && (
						<button
							onClick={toggleGyro}
							aria-pressed={gyroMode}
							className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition-opacity"
							style={{
								borderColor: 'currentColor',
								opacity: gyroMode ? 1 : 0.4,
								background: gyroMode ? 'var(--btn-bg)' : 'transparent',
							}}
						>
							<GyroIcon />
							{gyroMode ? 'Tilt active' : 'Tilt'}
						</button>
					)}
				</div>
			)}

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
							autoRotate={autoRotate && !gyroMode && !cursorMode}
						/>
					</Suspense>

					<OrbitControls
						enabled={!gyroMode && !cursorMode}
						enablePan={false}
						minDistance={1.5}
						maxDistance={8}
						autoRotate={false}
					/>

					<CameraController
						gyroMode={gyroMode}
						cursorMode={cursorMode}
						targetRef={cameraTarget}
					/>
				</Canvas>
			</div>

			<p className="text-xs opacity-50 italic" style={{ lineHeight: '1.8' }}>
				Drag to orbit, or use Cursor / Tilt mode to orbit hands-free. Text follows the curvature of the surface using troika-three-text&apos;s native curveRadius — no UV unwrapping required.
			</p>
		</div>
	)
}

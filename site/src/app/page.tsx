import Demo from "@/components/Demo"
import CopyInstall from "@/components/CopyInstall"
import CodeBlock from "@/components/CodeBlock"
import ToolDirectory from "@/components/ToolDirectory"
import { version } from "../../../package.json"

export default function Home() {
	return (
		<main className="flex flex-col items-center px-6 py-20 gap-24">

			{/* Hero */}
			<section className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-6">
				<div className="flex flex-col gap-2">
					<p className="text-xs uppercase tracking-widest opacity-50">surfacetype</p>
					<h1 className="text-4xl lg:text-8xl xl:text-9xl" style={{ fontFamily: "var(--font-merriweather), serif", fontVariationSettings: '"wght" 300, "opsz" 72', lineHeight: "1.05em" }}>
						Text on any<br />
						<span style={{ opacity: 0.5, fontStyle: "italic" }}>surface.</span>
					</h1>
				</div>
				<div className="flex items-center gap-4">
					<CopyInstall />
					<a href="https://github.com/Liiift-Studio/SurfaceType" className="text-sm opacity-50 hover:opacity-100 transition-opacity">GitHub</a>
				</div>
				<div className="flex flex-wrap gap-x-4 gap-y-1 text-xs opacity-50 tracking-wide">
					<span>TypeScript</span><span>·</span><span>Three.js</span><span>·</span><span>troika-three-text</span><span>·</span><span>React Three Fiber</span>
				</div>
				<p className="text-base opacity-60 leading-relaxed max-w-lg">
					CSS and DOM are flat. Surface Type projects typeset text onto 3D geometries — sphere, cylinder, torus, or plane — using troika-three-text&apos;s SDF font rendering and its native curveRadius property for authentic surface-following curves.
				</p>
			</section>

			{/* Demo */}
			<section className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-4">
				<p className="text-xs uppercase tracking-widest opacity-50">Live demo — orbit with drag</p>
				<div className="rounded-xl -mx-8 px-8 py-8" style={{ background: "rgba(0,0,0,0.25)", overflow: 'hidden' }}>
					<Demo />
				</div>
			</section>

			{/* Explanation */}
			<section className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-6">
				<p className="text-xs uppercase tracking-widest opacity-50">How it works</p>
				<div className="prose-grid grid grid-cols-1 sm:grid-cols-2 gap-12 text-sm leading-relaxed opacity-70">
					<div className="flex flex-col gap-3">
						<p className="font-semibold opacity-100 text-base">The DOM is flat</p>
						<p>There is no CSS or browser API to wrap, project, or flow typeset text onto a curved surface. Transforms can rotate an element in 3D space, but the text itself remains flat. Surface Type moves the rendering into Three.js where geometry is first-class.</p>
					</div>
					<div className="flex flex-col gap-3">
						<p className="font-semibold opacity-100 text-base">troika curveRadius</p>
						<p>troika-three-text provides a curveRadius property that bends the SDF text mesh along a circular arc. Surface Type sets this to match the geometry radius — sphere, cylinder, and torus — so the text physically conforms to the surface without any UV unwrapping.</p>
					</div>
					<div className="flex flex-col gap-3">
						<p className="font-semibold opacity-100 text-base">Curvature-aware tracking</p>
						<p>Tighter curves make characters appear visually crowded. Surface Type optionally adjusts letter spacing proportionally to the surface curvature (1/radius), opening tracking as the curve tightens. The curvatureTrackingFactor controls how strongly this applies.</p>
					</div>
					<div className="flex flex-col gap-3">
						<p className="font-semibold opacity-100 text-base">Multi-word distribution</p>
						<p>When text contains multiple words, each word is placed as a separate Text instance distributed evenly around the surface longitude. This keeps the text legible from any viewing angle and enables full 360° text wrapping on sphere, cylinder, and torus geometries.</p>
					</div>
				</div>
			</section>

			{/* Usage */}
			<section className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-6">
				<div className="flex items-baseline gap-4">
					<p className="text-xs uppercase tracking-widest opacity-50">Usage</p>
					<p className="text-xs opacity-50 tracking-wide">TypeScript + React Three Fiber · Vanilla Three.js</p>
				</div>
				<div className="flex flex-col gap-8 text-sm">
					<div className="flex flex-col gap-3">
						<p className="opacity-50">React Three Fiber component</p>
						<CodeBlock code={`import { SurfaceTextMesh } from '@liiift-studio/surfacetype'

// Inside a <Canvas>:
<SurfaceTextMesh
  geometryType="sphere"
  text="Typography"
  fontSize={0.12}
  color="#ffffff"
  autoRotate
/>`} />
					</div>
					<div className="flex flex-col gap-3">
						<p className="opacity-50">Vanilla Three.js</p>
						<CodeBlock code={`import { createSurfaceText } from '@liiift-studio/surfacetype'

const { group, dispose } = createSurfaceText('sphere', {
  text: 'Typography',
  fontSize: 0.12,
  color: '#ffffff',
}, 1.0)

scene.add(group)

// Later — clean up GPU resources:
// dispose()
// scene.remove(group)`} />
					</div>
					<div className="flex flex-col gap-3">
						<p className="opacity-50">Options</p>
						<table className="w-full text-xs">
							<thead><tr className="opacity-50 text-left"><th className="pb-2 pr-6 font-normal">Option</th><th className="pb-2 pr-6 font-normal">Default</th><th className="pb-2 font-normal">Description</th></tr></thead>
							<tbody className="opacity-70">
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">text</td><td className="py-2 pr-6">—</td><td className="py-2">Text content to render. Required.</td></tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">font</td><td className="py-2 pr-6">built-in</td><td className="py-2">Font URL (WOFF/TTF). Defaults to troika&apos;s built-in font.</td></tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">fontSize</td><td className="py-2 pr-6">0.1</td><td className="py-2">Font size in Three.js units.</td></tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">letterSpacing</td><td className="py-2 pr-6">0</td><td className="py-2">Base letter spacing in Three.js units.</td></tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">color</td><td className="py-2 pr-6">&apos;#ffffff&apos;</td><td className="py-2">Text colour — hex string or Three.js colour number.</td></tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">textAlign</td><td className="py-2 pr-6">&apos;center&apos;</td><td className="py-2">Horizontal alignment: &apos;left&apos;, &apos;center&apos;, or &apos;right&apos;.</td></tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">maxWidth</td><td className="py-2 pr-6">Infinity</td><td className="py-2">Max text width in Three.js units before wrapping.</td></tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">curvatureTracking</td><td className="py-2 pr-6">true</td><td className="py-2">Adjust letter spacing for curvature — tighter curves get more tracking.</td></tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">curvatureTrackingFactor</td><td className="py-2 pr-6">0.002</td><td className="py-2">Strength of curvature tracking adjustment per unit of curvature (1/radius).</td></tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">autoRotate</td><td className="py-2 pr-6">false</td><td className="py-2">Auto-rotate the group around the Y axis. (SurfaceTextMesh only)</td></tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">radius</td><td className="py-2 pr-6">1.0</td><td className="py-2">Geometry radius in Three.js units. (createSurfaceText third argument)</td></tr>
							</tbody>
						</table>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-6 pt-8 border-t border-white/10 text-xs">
				<ToolDirectory current="surfaceType" />
				<hr className="border-white/10" />
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 opacity-50">
					<a href="https://liiift.studio" className="hover:opacity-100 transition-opacity">liiift.studio</a>
					<span className="sm:col-start-4">surfaceType v{version}</span>
				</div>
			</footer>

		</main>
	)
}

import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'Surface Type — Typeset text on 3D surfaces'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
	const interLight = await readFile(join(process.cwd(), 'public/fonts/inter-300.woff'))
	return new ImageResponse(
		(
			<div style={{ background: '#120d1a', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '72px 80px', fontFamily: 'Inter, sans-serif' }}>
				<span style={{ fontSize: 13, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>surface type</span>
				<div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
					<div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 48 }}>
						{/* Abstract sphere arc representing curved text */}
						<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
							{['100%', '82%', '60%', '38%', '18%'].map((w, i) => (
								<div key={i} style={{ width: w, height: 3, background: i === 2 ? 'rgba(212,184,240,0.5)' : 'rgba(212,184,240,0.15)', borderRadius: 2 }} />
							))}
						</div>
					</div>
					<div style={{ fontSize: 76, color: '#ffffff', lineHeight: 1.06, fontWeight: 300 }}>Surface Type,</div>
					<div style={{ fontSize: 76, color: 'rgba(255,255,255,0.4)', lineHeight: 1.06, fontWeight: 300 }}>text on any surface.</div>
				</div>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
					<div style={{ fontSize: 14, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.04em', display: 'flex', gap: 20 }}>
						<span>Three.js</span><span style={{ opacity: 0.4 }}>·</span>
						<span>troika-three-text</span><span style={{ opacity: 0.4 }}>·</span>
						<span>React Three Fiber</span>
					</div>
					<div style={{ fontSize: 13, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.04em' }}>surfacetype.com</div>
				</div>
			</div>
		),
		{ ...size, fonts: [{ name: 'Inter', data: interLight, style: 'normal', weight: 300 }] },
	)
}

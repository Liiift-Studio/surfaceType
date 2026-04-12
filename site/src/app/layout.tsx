import type { Metadata } from "next"
import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
	title: "Surface Type — Typeset text on 3D surfaces",
	icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
	description: "Surface Type projects typeset text onto 3D geometries — sphere, cylinder, torus, or plane — using Three.js and troika-three-text SDF rendering. Works with React Three Fiber.",
	keywords: ["3d typography", "three.js", "troika", "sdf text", "surface type", "r3f", "react three fiber", "sphere text", "typography", "typographic", "TypeScript", "npm"],
	openGraph: {
		title: "Surface Type — Typeset text on 3D surfaces",
		description: "Project typeset text onto 3D geometries using Three.js and troika-three-text. Sphere, cylinder, torus, or plane — with curvature-aware tracking.",
		url: "https://surfacetype.com",
		siteName: "Surface Type",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Surface Type — Typeset text on 3D surfaces",
		description: "Project typeset text onto 3D geometries using Three.js and troika-three-text.",
	},
	metadataBase: new URL("https://surfacetype.com"),
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`h-full antialiased ${inter.variable}`}>
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	)
}

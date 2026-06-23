import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";
import { MotionProvider } from "@/components/motion-provider";
import "./globals.css";

const monaSans = Mona_Sans({
	variable: "--font-mona-sans",
	subsets: ["latin"],
	axes: ["wdth"],
	display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const SITE_NAME = "Emilito";
const SITE_DESCRIPTION = "Local Password Generator";

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		template: `%s | ${SITE_NAME}`,
		default: "Pass Gen",
	},
	description: SITE_DESCRIPTION,
	openGraph: {
		title: {
			template: `%s | ${SITE_NAME}`,
			default: "Pass Gen",
		},
		description: SITE_DESCRIPTION,
		siteName: SITE_NAME,
		locale: "sv_SE",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: {
			template: `%s | ${SITE_NAME}`,
			default: "Pass gen",
		},
		description: SITE_DESCRIPTION,
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="sv"
			className={`${monaSans.variable} h-full antialiased selection:text-ink-flip selection:bg-brand`}
		>
			<body className="min-h-full flex flex-col">
				<MotionProvider>{children}</MotionProvider>
			</body>
		</html>
	);
}

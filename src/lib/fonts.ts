import { Fraunces, Space_Grotesk } from "next/font/google";

// Extra fonts available to public-profile themes (Inter / Inter Tight / Geist
// Mono already load in the root layout). Apply `themeFontVars` on the dashboard
// and public-page wrappers so the live preview and public page can use them.
export const fontFraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export const fontSpaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const themeFontVars = `${fontFraunces.variable} ${fontSpaceGrotesk.variable}`;

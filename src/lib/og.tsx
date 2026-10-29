import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteUrl } from "@/lib/env";

export const OG_SIZE = { width: 1200, height: 630 };

const fonts = Promise.all([
  readFile(join(process.cwd(), "src/assets/fonts/InstrumentSerif-Regular.ttf")),
  readFile(join(process.cwd(), "src/assets/fonts/Manrope-Medium.ttf")),
]);

type OgCardProps = {
  /** Small line above the title (e.g. the person's name). */
  kicker: string;
  title: string;
  subtitle?: string;
  /** Project accent; defaults to the site blue. */
  accent?: string;
};

/**
 * Social share card in the site's Nocturne style: serif title on near-black,
 * with a phone outline glowing in the accent color at the right.
 */
export async function ogCard({ kicker, title, subtitle, accent = "#7FB2FF" }: OgCardProps) {
  const [serif, sans] = await fonts;
  const host = new URL(siteUrl()).host;
  const titleSize = title.length > 28 ? 84 : title.length > 16 ? 104 : 128;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0b0a09",
          color: "#f2eee6",
          fontFamily: "Manrope",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -120,
            top: -40,
            width: 760,
            height: 760,
            borderRadius: 9999,
            background: `radial-gradient(closest-side, ${accent}55, transparent)`,
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", width: 820 }}>
          <div style={{ fontSize: 28, color: "#a39c91" }}>{kicker}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "Instrument Serif", fontSize: titleSize, lineHeight: 0.95, letterSpacing: -2 }}>{title}</div>
            {subtitle && <div style={{ marginTop: 28, fontSize: 32, lineHeight: 1.35, color: "#a39c91", maxWidth: 680 }}>{subtitle}</div>}
          </div>
          <div style={{ fontSize: 24, color: "#a39c91" }}>{host}</div>
        </div>
        <div
          style={{
            position: "absolute",
            right: 110,
            top: 70,
            width: 228,
            height: 490,
            borderRadius: 42,
            border: "3px solid #3a3632",
            background: "#161412",
            display: "flex",
            padding: 12,
          }}
        >
          <div
            style={{
              flex: 1,
              borderRadius: 32,
              background: `linear-gradient(160deg, ${accent} 0%, #161412 75%)`,
              display: "flex",
              justifyContent: "center",
              paddingTop: 12,
            }}
          >
            <div style={{ width: 72, height: 20, borderRadius: 999, background: "#0b0a09" }} />
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Instrument Serif", data: serif, style: "normal", weight: 400 },
        { name: "Manrope", data: sans, style: "normal", weight: 500 },
      ],
    },
  );
}

import React from "react";
import {
  Circle,
  Document,
  Page,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";

export type PassportSkill = {
  name: string;
  isVerified: boolean;
  proofHash?: string | null;
};

export type PassportData = {
  name: string;
  email: string;
  vps: number;
  skills: PassportSkill[];
  issuedDateISO: string; // YYYY-MM-DD
  verifyUrl: string;
};

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, fontFamily: "Helvetica" },
  header: { marginBottom: 18 },
  brand: { fontSize: 18, fontWeight: 700 },
  tagline: { marginTop: 4, color: "#556" },
  card: {
    border: "1px solid #E6E8EE",
    borderRadius: 10,
    padding: 16,
    marginTop: 12,
  },
  row: { display: "flex", flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 9, color: "#667", textTransform: "uppercase" },
  value: { marginTop: 2, fontSize: 12, fontWeight: 600 },
  muted: { color: "#667" },
  chipRow: { display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    border: "1px solid #D8DEE9",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    fontSize: 10,
  },
  chipOk: { backgroundColor: "#E8F8EF", borderColor: "#BFEBD2", color: "#146C43" },
  chipPending: {
    backgroundColor: "#FFF7E6",
    borderColor: "#F3D39B",
    color: "#8A5A00",
  },
  footer: { marginTop: 18, color: "#667", fontSize: 9 },
});

function ringSvg(vps: number) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, vps)) / 100;
  const filled = circumference * pct;

  // Small, reliable ring using SVG primitives supported by react-pdf.
  return React.createElement(
    View,
    { style: { alignItems: "center", justifyContent: "center" } },
    React.createElement(
      Svg,
      { width: 120, height: 120, viewBox: "0 0 120 120" },
      React.createElement(Circle, {
        cx: 60,
        cy: 60,
        r: radius,
        stroke: "#E6E8EE",
        strokeWidth: 10,
        fill: "none",
      }),
      React.createElement(Circle, {
        cx: 60,
        cy: 60,
        r: radius,
        stroke: "#2ECC8F",
        strokeWidth: 10,
        fill: "none",
        strokeDasharray: `${filled} ${circumference}`,
        strokeLinecap: "round",
        transform: "rotate(-90 60 60)",
      }),
    ),
    React.createElement(
      View,
      { style: { position: "absolute", top: 42, left: 0, right: 0, alignItems: "center" } },
      React.createElement(Text, { style: { fontSize: 28, fontWeight: 700, color: "#146C43" } }, String(vps)),
      React.createElement(Text, { style: { fontSize: 9, color: "#667", letterSpacing: 1, marginTop: 2 } }, "VPS"),
    ),
  );
}

export function createPassportDoc(data: PassportData) {
  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.brand }, "Vantage Digital Passport"),
        React.createElement(Text, { style: styles.tagline }, "We don't build CVs. We validate them."),
      ),

      React.createElement(
        View,
        { style: styles.card },
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(
            View,
            null,
            React.createElement(Text, { style: styles.label }, "Graduate"),
            React.createElement(Text, { style: styles.value }, data.name),
            React.createElement(Text, { style: styles.muted }, data.email),
          ),
          ringSvg(data.vps),
        ),
      ),

      React.createElement(
        View,
        { style: styles.card },
        React.createElement(Text, { style: styles.label }, "Verified skills"),
        React.createElement(
          View,
          { style: { marginTop: 10 } },
          data.skills.length === 0
            ? React.createElement(Text, { style: styles.muted }, "No skills found yet.")
            : React.createElement(
                View,
                { style: styles.chipRow },
                ...data.skills.map((s) => {
                  const style = s.isVerified
                    ? { ...styles.chip, ...styles.chipOk }
                    : { ...styles.chip, ...styles.chipPending };
                  const hashSuffix = s.isVerified && s.proofHash ? ` (${s.proofHash.slice(0, 10)}…)` : "";
                  return React.createElement(
                    Text,
                    { key: s.name, style },
                    `${s.isVerified ? "✓" : "⏳"} ${s.name}${hashSuffix}`,
                  );
                }),
              ),
        ),
      ),

      React.createElement(
        View,
        { style: styles.card },
        React.createElement(Text, { style: styles.label }, "Details"),
        React.createElement(
          View,
          { style: { marginTop: 10, gap: 6 } },
          React.createElement(
            View,
            { style: styles.row },
            React.createElement(Text, { style: styles.muted }, "Passport issued"),
            React.createElement(Text, null, data.issuedDateISO),
          ),
          React.createElement(
            View,
            { style: styles.row },
            React.createElement(Text, { style: styles.muted }, "Verify URL"),
            React.createElement(Text, null, data.verifyUrl),
          ),
          React.createElement(
            View,
            { style: { marginTop: 10, borderTop: "1px solid #E6E8EE", paddingTop: 10 } },
            React.createElement(Text, { style: styles.footer }, "Estimates only. Demo build for hackathon judging."),
          ),
        ),
      ),
    ),
  );
}

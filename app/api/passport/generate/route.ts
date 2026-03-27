import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateTrustScore } from "@/lib/trust-score";
import React from "react";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";

export const runtime = "nodejs";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 12, fontFamily: "Helvetica" },
  header: { marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 700 },
  subtitle: { marginTop: 4, color: "#555" },
  section: { marginTop: 16 },
  label: { fontSize: 10, color: "#666", textTransform: "uppercase" },
  row: { display: "flex", flexDirection: "row", justifyContent: "space-between" },
  badge: { color: "#0b6", fontWeight: 700 },
  muted: { color: "#666" },
});

export async function GET() {
  const session = await requireRole(Role.GRADUATE);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { verifiedSkills: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const totalSkillCount = user.verifiedSkills.length;
  const verifiedSkillCount = user.verifiedSkills.filter((s) => s.isVerified).length;
  const trustScore = calculateTrustScore({
    aptitudeScore: user.aptitudeScore ?? 0,
    verifiedSkillCount,
    totalSkillCount,
  });

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Vantage Digital Passport</Text>
          <Text style={styles.subtitle}>
            Generated {new Date().toISOString().slice(0, 10)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Graduate</Text>
          <View style={styles.row}>
            <Text>{user.name}</Text>
            <Text style={styles.badge}>VPS {trustScore}</Text>
          </View>
          <Text style={styles.muted}>{user.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Verified Skills</Text>
          {user.verifiedSkills.length === 0 ? (
            <Text style={styles.muted}>No skills imported yet.</Text>
          ) : (
            user.verifiedSkills.map((s) => (
              <View key={s.id} style={{ marginTop: 6 }}>
                <View style={styles.row}>
                  <Text>
                    {s.isVerified ? "✓" : "⏳"} {s.name}
                  </Text>
                  <Text style={styles.muted}>
                    {s.proofHash ? s.proofHash.slice(0, 10) + "…" : ""}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Notes</Text>
          <Text style={styles.muted}>
            This is an MVP passport for the hackathon demo.
          </Text>
        </View>
      </Page>
    </Document>
  );

  const pdfBuffer = await renderToBuffer(doc);
  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="vantage-passport.pdf"',
    },
  });
}


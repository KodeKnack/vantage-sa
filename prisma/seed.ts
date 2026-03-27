import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = "Demo1234!";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email: "employer@demo.co.za" },
    create: {
      role: Role.EMPLOYER,
      name: "TechCorp SA",
      email: "employer@demo.co.za",
      passwordHash,
    },
    update: {
      role: Role.EMPLOYER,
      name: "TechCorp SA",
      passwordHash,
    },
  });

  const thabo = await prisma.user.upsert({
    where: { email: "graduate@demo.co.za" },
    create: {
      role: Role.GRADUATE,
      name: "Thabo Nkosi",
      email: "graduate@demo.co.za",
      passwordHash,
      aptitudeScore: 82,
    },
    update: {
      role: Role.GRADUATE,
      name: "Thabo Nkosi",
      passwordHash,
      aptitudeScore: 82,
    },
  });

  const amahle = await prisma.user.upsert({
    where: { email: "amahle@demo.co.za" },
    create: {
      role: Role.GRADUATE,
      name: "Amahle Dlamini",
      email: "amahle@demo.co.za",
      passwordHash,
      aptitudeScore: 67,
    },
    update: {
      role: Role.GRADUATE,
      name: "Amahle Dlamini",
      passwordHash,
      aptitudeScore: 67,
    },
  });

  const sipho = await prisma.user.upsert({
    where: { email: "sipho@demo.co.za" },
    create: {
      role: Role.GRADUATE,
      name: "Sipho van der Merwe",
      email: "sipho@demo.co.za",
      passwordHash,
      aptitudeScore: null,
    },
    update: {
      role: Role.GRADUATE,
      name: "Sipho van der Merwe",
      passwordHash,
      aptitudeScore: null,
    },
  });

  // Clear and re-seed skills for deterministic demo state
  await prisma.skill.deleteMany({ where: { userId: thabo.id } });
  await prisma.skill.deleteMany({ where: { userId: amahle.id } });
  await prisma.skill.deleteMany({ where: { userId: sipho.id } });

  await prisma.skill.createMany({
    data: [
      {
        userId: thabo.id,
        name: "SQL",
        isVerified: true,
        proofHash: "a3f8c1d2",
        proofLink: "seed",
      },
      {
        userId: thabo.id,
        name: "Python",
        isVerified: true,
        proofHash: "3fa8c1d2",
        proofLink: "seed",
      },
      {
        userId: thabo.id,
        name: "Communication",
        isVerified: true,
        proofHash: "d9a1f4c7",
        proofLink: "seed",
      },
      {
        userId: thabo.id,
        name: "Data Analysis",
        isVerified: true,
        proofHash: "c2d5e8b3",
        proofLink: "seed",
      },
      { userId: thabo.id, name: "React", isVerified: false },
      { userId: thabo.id, name: "TypeScript", isVerified: false },
    ],
  });

  await prisma.skill.createMany({
    data: [
      { userId: amahle.id, name: "SQL", isVerified: true },
      { userId: amahle.id, name: "Python", isVerified: true },
      { userId: amahle.id, name: "Writing", isVerified: false },
      { userId: amahle.id, name: "Data Analysis", isVerified: false },
    ],
  });

  // Sipho: no skills yet
  void sipho;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

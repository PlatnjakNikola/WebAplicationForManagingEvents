import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("=== TEST KONEKCIJE S BAZOM ===\n");

  // 1. Konekcija
  try {
    await prisma.$connect();
    console.log("[OK] Konekcija s bazom uspjesna");
  } catch (e: any) {
    console.error("[FAIL] Konekcija s bazom:", e.message);
    process.exit(1);
  }

  // 2. Raw query
  try {
    const result = await prisma.$queryRaw<{ version: string }[]>`SELECT @@VERSION as version`;
    console.log("[OK] SQL Server verzija:", result[0].version.split("\n")[0]);
  } catch (e: any) {
    console.error("[FAIL] Raw query:", e.message);
  }

  // 3. Popis tablica
  try {
    const tables = await prisma.$queryRaw<{ name: string }[]>`
      SELECT TABLE_NAME as name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME
    `;
    console.log(`[OK] Tablice u bazi (${tables.length}):`);
    tables.forEach((t) => console.log(`     - ${t.name}`));
  } catch (e: any) {
    console.error("[FAIL] Popis tablica:", e.message);
  }

  // 4. Broj korisnika
  try {
    const count = await prisma.user.count();
    console.log(`[OK] Broj korisnika: ${count}`);
  } catch (e: any) {
    console.error("[FAIL] Upit korisnika:", e.message);
  }

  // 5. Lista korisnika
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
    });
    if (users.length > 0) {
      console.log("[OK] Korisnici:");
      users.forEach((u) =>
        console.log(`     #${u.id} | ${u.email} | ${u.firstName} ${u.lastName} | ${u.role} | ${u.createdAt.toISOString()}`)
      );
    } else {
      console.log("[OK] Nema korisnika u bazi");
    }
  } catch (e: any) {
    console.error("[FAIL] Lista korisnika:", e.message);
  }

  // 6. Broj zapisa po tablici
  try {
    const theaters = await prisma.theater.count();
    const halls = await prisma.hall.count();
    const events = await prisma.event.count();
    const reservations = await prisma.reservation.count();
    const reviews = await prisma.review.count();
    console.log("[OK] Zapisi po tablici:");
    console.log(`     Theaters: ${theaters} | Halls: ${halls} | Events: ${events} | Reservations: ${reservations} | Reviews: ${reviews}`);
  } catch (e: any) {
    console.error("[FAIL] Brojanje zapisa:", e.message);
  }

  // 7. Test CRUD (create + read + delete)
  try {
    const testUser = await prisma.user.create({
      data: {
        email: `test-db-${Date.now()}@test.hr`,
        password: "test-hash",
        firstName: "DB",
        lastName: "Test",
      },
    });
    const found = await prisma.user.findUnique({ where: { id: testUser.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log(`[OK] CRUD test: kreiran -> procitan -> obrisan (id: ${found?.id})`);
  } catch (e: any) {
    console.error("[FAIL] CRUD test:", e.message);
  }

  await prisma.$disconnect();
  console.log("\n=== SVE PROVJERE ZAVRSENE ===");
}

main().catch((e) => {
  console.error("Neocekivana greska:", e);
  prisma.$disconnect();
  process.exit(1);
});

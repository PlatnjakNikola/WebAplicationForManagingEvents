/// <reference types="node" />
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
};

async function main() {
  console.log("Brisanje postojecih podataka...");
  await prisma.review.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.event.deleteMany();
  await prisma.hall.deleteMany();
  await prisma.theater.deleteMany();
  await prisma.user.deleteMany();

  // ============ USERS ============
  console.log("Kreiranje korisnika...");
  const userPassword = await argon2.hash("User1234", ARGON2_OPTIONS);
  const adminPassword = await argon2.hash("Admin1234", ARGON2_OPTIONS);

  const ana = await prisma.user.create({
    data: {
      email: "user@theatrum.hr",
      password: userPassword,
      firstName: "User",
      lastName: "User",
      role: "user",
    },
  });

  const marko = await prisma.user.create({
    data: {
      email: "marko.juric@email.hr",
      password: userPassword,
      firstName: "Marko",
      lastName: "Jurić",
      role: "user",
    },
  });

  const petra = await prisma.user.create({
    data: {
      email: "petra.novak@email.hr",
      password: userPassword,
      firstName: "Petra",
      lastName: "Novak",
      role: "user",
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@theatrum.hr",
      password: adminPassword,
      firstName: "Admin",
      lastName: "Theatrum",
      role: "admin",
    },
  });

  console.log(`  Kreirano ${4} korisnika`);

  // ============ THEATERS + HALLS ============
  console.log("Kreiranje kazalista i dvorana...");

  const hnk = await prisma.theater.create({
    data: {
      name: "HNK Zagreb",
      address: "Trg Republike Hrvatske 15, Zagreb",
      description: "Hrvatsko narodno kazalište u Zagrebu, utemeljena 1860. godine, jedna je od najznačajnijih kulturnih institucija u Hrvatskoj.",
      capacity: 680,
      contact: "+385 1 4888 418",
      workingHours: "Pon-Pet: 10:00-20:00, Sub: 10:00-14:00",
      latitude: 45.8094,
      longitude: 15.9694,
      halls: { create: { name: "Glavna dvorana", seats: 680 } },
    },
    include: { halls: true },
  });

  const gavella = await prisma.theater.create({
    data: {
      name: "Kazalište Gavella",
      address: "Frankopanska 8, Zagreb",
      description: "Gradsko dramsko kazalište Gavella jedno je od vodećih dramskih kazališta u Hrvatskoj.",
      capacity: 350,
      contact: "+385 1 4849 222",
      workingHours: "Pon-Pet: 10:00-19:00",
      latitude: 45.8117,
      longitude: 15.9703,
      halls: { create: { name: "Glavna dvorana", seats: 350 } },
    },
    include: { halls: true },
  });

  const kerempuh = await prisma.theater.create({
    data: {
      name: "Kerempuh",
      address: "Ilica 31, Zagreb",
      description: "Satiričko kazalište Kerempuh poznato je po satiričnim i komičnim predstavama.",
      capacity: 200,
      contact: "+385 1 4833 354",
      workingHours: "Pon-Pet: 10:00-19:00",
      latitude: 45.8131,
      longitude: 15.9715,
      halls: { create: { name: "Glavna dvorana", seats: 200 } },
    },
    include: { halls: true },
  });

  const teatarTd = await prisma.theater.create({
    data: {
      name: "Teatar &TD",
      address: "Savska cesta 25, Zagreb",
      description: "Studentski centar Zagreb, prostor za suvremene i eksperimentalne izvedbe.",
      capacity: 150,
      contact: "+385 1 4593 666",
      workingHours: "Pon-Sub: 12:00-20:00",
      latitude: 45.8056,
      longitude: 15.9666,
      halls: { create: { name: "Glavna dvorana", seats: 150 } },
    },
    include: { halls: true },
  });

  console.log(`  Kreirano ${4} kazalista s dvoranama`);

  // ============ EVENTS ============
  console.log("Kreiranje dogadaja...");

  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: "Hamlet",
        description: "Shakespeareova najpoznatija tragedija u novoj, modernoj interpretaciji. Princ Hamlet suočava se s izdajom, osvetom i pitanjima o smislu postojanja.",
        dateTime: new Date("2026-03-20T19:30:00"),
        duration: 150,
        price: 25,
        totalSeats: 680,
        imageUrl: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&h=400&fit=crop",
        hallId: hnk.halls[0].id,
      },
    }),
    prisma.event.create({
      data: {
        title: "Čekajući Godota",
        description: "Samuel Beckett nas vodi u apsurdni svijet dvaju skitnica koji čekaju nekoga tko možda nikad neće doći. Klasik teatra apsurda.",
        dateTime: new Date("2026-03-22T20:00:00"),
        duration: 105,
        price: 18,
        totalSeats: 350,
        imageUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=600&h=400&fit=crop",
        hallId: gavella.halls[0].id,
      },
    }),
    prisma.event.create({
      data: {
        title: "Tko se boji Virginije Woolf?",
        description: "Edward Albeeova drama o braku, iluzijama i razornoj moći istine. Dva para, jedna noć, bezbroj tajni.",
        dateTime: new Date("2026-03-25T19:00:00"),
        duration: 135,
        price: 20,
        totalSeats: 350,
        imageUrl: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=600&h=400&fit=crop",
        hallId: gavella.halls[0].id,
      },
    }),
    prisma.event.create({
      data: {
        title: "Revizor",
        description: "Gogoljeva satirična komedija o korumpiranom gradiću koji posjećuje lažni državni revizor. Smiješno i bolno aktualno.",
        dateTime: new Date("2026-03-28T19:30:00"),
        duration: 120,
        price: 15,
        totalSeats: 200,
        imageUrl: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=600&h=400&fit=crop",
        hallId: kerempuh.halls[0].id,
      },
    }),
    prisma.event.create({
      data: {
        title: "Medeja",
        description: "Euripidova antička tragedija o ženi ostavljenoj od muža i njezinoj strašnoj osveti. Snaga emocija koja nadilazi vrijeme.",
        dateTime: new Date("2026-04-02T20:00:00"),
        duration: 110,
        price: 22,
        totalSeats: 680,
        imageUrl: "https://images.unsplash.com/photo-1580809361436-42a7ec204889?w=600&h=400&fit=crop",
        hallId: hnk.halls[0].id,
      },
    }),
    prisma.event.create({
      data: {
        title: "Kiklop",
        description: "Dramatizacija romana Ranka Marinkovića. Zagreb pred Drugi svjetski rat, intelektualci, strah i apsurd svakodnevice.",
        dateTime: new Date("2026-04-05T19:00:00"),
        duration: 140,
        price: 20,
        totalSeats: 350,
        imageUrl: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=600&h=400&fit=crop",
        hallId: gavella.halls[0].id,
      },
    }),
    prisma.event.create({
      data: {
        title: "Dundo Maroje",
        description: "Marinova komedija Držića u punom sjaju! Rim, škrtost, ljubav i intrige — renesansna komedija koja nikad ne stari.",
        dateTime: new Date("2026-04-10T19:30:00"),
        duration: 130,
        price: 25,
        totalSeats: 680,
        imageUrl: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=600&h=400&fit=crop",
        hallId: hnk.halls[0].id,
      },
    }),
    prisma.event.create({
      data: {
        title: "Postolar i vrag",
        description: "Brechtova drama o čovjeku koji sklopi pakt s vragom. Pitanje morala, pohlepe i ljudske prirode.",
        dateTime: new Date("2026-04-12T20:00:00"),
        duration: 100,
        price: 15,
        totalSeats: 200,
        imageUrl: "https://images.unsplash.com/photo-1568037027677-407cba5c3539?w=600&h=400&fit=crop",
        hallId: kerempuh.halls[0].id,
      },
    }),
    prisma.event.create({
      data: {
        title: "Tri sestre",
        description: "Čehovljeva drama o čežnji za boljim životom. Tri sestre sanjaju o Moskvi dok im život prolazi u provinciji.",
        dateTime: new Date("2026-04-15T19:00:00"),
        duration: 150,
        price: 12,
        totalSeats: 150,
        imageUrl: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600&h=400&fit=crop",
        hallId: teatarTd.halls[0].id,
      },
    }),
  ]);

  console.log(`  Kreirano ${events.length} dogadaja`);

  // ============ RESERVATIONS ============
  console.log("Kreiranje rezervacija...");

  await prisma.reservation.createMany({
    data: [
      { userId: ana.id, eventId: events[0].id, numberOfTickets: 2, totalPrice: 50, status: "confirmed", createdAt: new Date("2026-03-10T14:30:00") },
      { userId: ana.id, eventId: events[2].id, numberOfTickets: 4, totalPrice: 80, status: "confirmed", createdAt: new Date("2026-03-11T09:15:00") },
      { userId: ana.id, eventId: events[3].id, numberOfTickets: 1, totalPrice: 15, status: "cancelled", createdAt: new Date("2026-03-08T18:45:00") },
      { userId: ana.id, eventId: events[4].id, numberOfTickets: 3, totalPrice: 66, status: "confirmed", createdAt: new Date("2026-03-09T11:00:00") },
      { userId: ana.id, eventId: events[6].id, numberOfTickets: 2, totalPrice: 50, status: "cancelled", createdAt: new Date("2026-03-07T16:20:00") },
      { userId: ana.id, eventId: events[8].id, numberOfTickets: 2, totalPrice: 24, status: "confirmed", createdAt: new Date("2026-03-12T10:30:00") },
    ],
  });

  console.log("  Kreirano 6 rezervacija");

  // ============ REVIEWS ============
  console.log("Kreiranje recenzija...");

  await prisma.review.createMany({
    data: [
      { userId: ana.id, eventId: events[0].id, rating: 5, comment: "Izvrsna predstava! Glumci su bili fenomenalni, posebno u sceni s lubanjom. Topla preporuka svima koji vole klasiku.", createdAt: new Date("2026-03-05T20:30:00") },
      { userId: ana.id, eventId: events[3].id, rating: 4, comment: "Odlična satira, publika se smijala od početka do kraja. Jedina zamjerka — malo predug drugi čin.", createdAt: new Date("2026-03-02T21:00:00") },
      { userId: marko.id, eventId: events[0].id, rating: 4, comment: "Moderna interpretacija koja funkcionira. Scenografija je bila impresivna.", createdAt: new Date("2026-03-06T19:45:00") },
      { userId: marko.id, eventId: events[1].id, rating: 5, comment: "Remek-djelo! Gavella nikad ne razočara. Beckett u punom sjaju.", createdAt: new Date("2026-03-01T22:00:00") },
      { userId: petra.id, eventId: events[8].id, rating: 3, comment: "Solidna izvedba, ali intimni prostor Teatra &TD nije idealan za Čehova. Glumice su bile sjajne.", createdAt: new Date("2026-02-28T20:15:00") },
      { userId: petra.id, eventId: events[4].id, rating: 5, comment: "Potresno i snažno. Glavna glumica je bila nevjerojatna — suze u publici.", createdAt: new Date("2026-03-04T21:30:00") },
    ],
  });

  console.log("  Kreirano 6 recenzija");

  console.log("\n=== SEED ZAVRSEN USPJESNO ===");
  console.log(`Korisnici: ana.horvat@theatrum.hr / User1234`);
  console.log(`           marko.juric@email.hr / User1234`);
  console.log(`           petra.novak@email.hr / User1234`);
  console.log(`           admin@theatrum.hr / Admin1234`);
}

main()
  .catch((e) => {
    console.error("Seed greska:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

# Plan Frontenda — Kompletna Dokumentacija

---

## 1. Opis Aplikacije

Aplikacija je platforma za upravljanje kazališnim događajima (slično Eventimu). Kazališta na raznim lokacijama imaju evente, a korisnici mogu pregledavati, rezervirati karte i ostavljati recenzije. Administratori upravljaju sadržajem — dodaju evente, kazališta i uređuju rezervacije.

---

## 2. Opća Pravila Dizajna

### 2.1 Mobile-First Pristup

Svaka stranica se **prvo dizajnira za mobilnu verziju**, pa tek onda prilagođava za veće ekrane.

### 2.2 Responzivni Breakpointi

| Breakpoint | Uređaj | Širina |
|------------|--------|--------|
| `sm` | Mobitel | 0 – 640px |
| `md` | Tablet | 641 – 1024px |
| `lg` | Desktop | 1025 – 1280px |
| `xl` | Veliki desktop | 1281px+ |

Definirati ova 4 breakpointa na početku projekta i koristiti ih konzistentno kroz cijelu aplikaciju. Tailwind CSS ih ima ugrađene, pa je najlakše koristiti Tailwind za responsive dizajn.

### 2.3 Zaštita Ruta (Route Guard)

Napraviti `ProtectedRoute` wrapper komponentu koja provjerava je li korisnik ulogiran i ima li odgovarajuću ulogu (korisnik/admin). Ako nije ulogiran — redirect na `/login`. Ako je ulogiran ali nema pravu ulogu — redirect na `/403` stranicu ili natrag na početnu.

### 2.4 Loading Stanja i Error Handling

Koristiti skeleton loadere za kartice i popise (izgledaju profesionalnije od spinnera). Spinner koristiti samo za kratke akcije (npr. slanje forme). Za greške prikazati user-friendly poruku s gumbom "Pokušaj ponovo".

### 2.5 Empty States (Prazna Stanja)

Svaka stranica treba imati prazno stanje s ilustracijom/ikonom i korisnim tekstom:
- Rezervacije: "Nemate još nijednu rezervaciju. Pogledajte nadolazeće događaje!" + gumb koji vodi na /dogadaji
- Recenzije: "Još niste ocijenili nijednu predstavu."
- Filter bez rezultata: "Nema događaja koji odgovaraju vašem filteru. Pokušajte promijeniti kriterije."

### 2.6 Toast Notifikacije

Koristiti toast notifikacije u donjem desnom kutu za uspješne akcije (zelena) i greške (crvena). Trajanje 3-4 sekunde s mogućnošću ručnog zatvaranja. Biblioteka poput `react-hot-toast` ili `sonner` je idealna za ovo.

---

## 3. Zajednički Elementi (Isti na Svim Stranicama)

### 3.1 Navigacija

**Mobilna verzija:**
- Lijevi kut: logo
- Desni kut: hamburger gumb
- Hamburger otvara slide-in panel s desne strane s tamnim overlayem iza — moderno izgleda i korisnik ga intuitivno zatvara swipeom ili klikom na overlay
- Stavke menija: Događaji, Kazališta, Recenzije, Rezervacije, Logout

**Desktop verzija:**
- Lijevi kut: logo
- Desna strana: linkovi raspoređeni u redu — Događaji, Kazališta, Recenzije, Rezervacije, Logout

**Razlika korisnik vs admin:**
Isti layout navigacije, ali različiti linkovi ovisno o ulozi. Korisnik vidi: Događaji, Kazališta, Rezervacije, Recenzije. Admin vidi: Upravljanje Događajima, Upravljanje Kazalištima, Sve Rezervacije, Sve Recenzije. Dodati mali badge ili tekst "Admin" pored loga kad je admin ulogiran.

### 3.2 Podnožje (Footer)

Minimalistički footer s jednom ili dvije linije teksta — ime autora, godina izrade, kontakt informacije ako treba. Na mobilnom ne zauzima puno prostora. Nije sticky — prikazuje se samo na dnu sadržaja.

---

## 4. Korisničke Stranice

### 4.1 Događaji (Eventi)

**Desktop layout:**
- **Lijeva strana (uža):** Filter panel
- **Desna strana (šira):** Kartice evenata

**Filteri:**
- Po imenu (search input)
- Po datumu (date picker)
- Po kazalištu (dropdown)

**Mobilna verzija filtera:**
Bottom sheet koji se izvlači odozdo — najprirodniji je za mobilne uređaje i koristi ga većina modernih aplikacija. Ispod navigacije je tanak gumb "Filtriraj" koji otvara bottom sheet s opcijama filtera. Dva gumba na dnu: "Gotovo" (primjeni filter) i "Otkaži" (zatvori bez primjene). Zatvaranje swipeom prema dolje.

**Kartice evenata:**
- Slika eventa
- Naslov eventa
- Kratak opis
- Datum i vrijeme
- Kazalište u kojem se odvija
- Cijena jedne karte
- Gumb "Rezerviraj"

Responzivni grid — 1 kartica po redu na mobitelu, 2 na tabletu, 3-4 na desktopu. Kartice iste visine u redu (koristiti CSS grid s `auto-fill` i `minmax`).

**Popup za rezervaciju:**
Modal popup na desktopu, bottom sheet na mobilnom. Polja: broj karata (number input s min 1, max = dostupna mjesta), automatski izračun ukupne cijene dok korisnik mijenja broj. Prije potvrde prikazati sažetak: "2x Hamlet — Kazalište Gavella — 15.03.2026. — Ukupno: 40€". Gumb "Potvrdi rezervaciju" i "Otkaži".

**Paginacija:**
Infinite scroll za mobilnu verziju (prirodniji za scrollanje prstom), klasična paginacija za desktop (lakša navigacija). Alternativno — "Učitaj više" gumb je kompromis koji radi dobro na oboje.

---

### 4.2 Kazališta

**Popis kazališta:**
- Kartice bez slike
- Detalji o kazalištu na kartici (ime, adresa, kratki opis)
- Klik na karticu otvara stranicu tog kazališta

**Stranica pojedinačnog kazališta:**
- Na desktopu: mapa na desnoj strani, detalji i eventi na lijevoj
- Na mobilnom: detalji kazališta na vrhu, mapa ispod (pola ekrana visine), eventi ispod mape
- Google Maps embed (iframe) jer je najjednostavniji za implementaciju
- Fallback tekst s adresom i linkom na Google Maps ako se mapa ne učita
- Za popis evenata koristiti isti stil kartica kao na stranici Događaji radi konzistentnosti

---

### 4.3 Rezervacije

**Popis rezervacija korisnika:**
Accordion lista gdje svaka stavka pokazuje osnovne info (naziv + datum) i klikom se otvara za detalje. Staggered animacija (jedan po jedan se pojavljuju s malim zakašnjenjem) daje lijep efekt. Detalji rezervacije: naslov eventa, kazalište, datum, broj karata, status.

Mogućnost sortiranja po datumu (najnovije prvo) i filtriranja po statusu (aktivne/prošle/otkazane). Na mobilnom accordion radi odlično jer zauzima punu širinu.

---

### 4.4 Recenzije

**Desktop:**
Dva stupca — lijevo "Za ocijeniti" (popis događaja za koje je korisnik rezervirao karte), desno "Ocijenjeno" (popis već danih ocjena). Kad korisnik da ocjenu, stavka animirano prelazi s lijeve na desnu stranu.

**Mobilni:**
Dva taba na vrhu — "Za ocijeniti" i "Ocijenjeno". Korisnik prebacuje između tabova tapom. Badge na tabu "Za ocijeniti" pokazuje broj neocijenjenih stavki.

**Ocjenjivanje:**
Zvjezdice 1-5 (bez pola zvjezdica — jednostavnije i brže). Opcionalno tekstualno polje za komentar koje se pojavi nakon odabira zvjezdica. Toast notifikacija "Recenzija spremljena!" nakon potvrde.

---

## 5. Admin Stranice

### 5.1 Admin — Događaji

Jednostavna forma na jednoj stranici s jasnim labelima i validacijom u realnom vremenu. Polja: naslov, opis, datum i vrijeme, kazalište iz dropdowna, cijena karte, ukupan broj mjesta, slika eventa (drag-and-drop zona s file inputom kao alternativom), trajanje predstave.

Pored forme (na desktopu) ili ispod forme (na mobilnom) prikazati live preview kako će kartica eventa izgledati korisnicima. Dodati i mogućnost uređivanja/brisanja postojećih evenata — ne samo dodavanje.

### 5.2 Admin — Kazališta

Slična forma kao za evente. Polja: ime kazališta, adresa, opis, kapacitet, kontakt, radno vrijeme. Za lokaciju koristiti Google Places autocomplete input — korisnik počne tipkati adresu i odabere iz ponuđenih. Automatski se popunjava lokacija za mapu. Mogućnost uređivanja/brisanja postojećih kazališta.

### 5.3 Admin — Rezervacije

Tablica na desktopu s inline editingom (klik na polje i promijeni status ili broj karata). Na mobilnom kartice s edit gumbom koji otvara bottom sheet za izmjene.

Pretraga i filtriranje po korisniku, eventu, datumu i statusu. Statusne opcije: Aktivna, Otkazana, Iskorištena — svaki status vizualno označen bojom (zelena, crvena, siva).

### 5.4 Admin — Recenzije

Tablica na desktopu (stupci: korisnik, event, kazalište, ocjena zvjezdicama, datum). Na mobilnom kartice s ključnim informacijama. Filter po ocjeni (npr. prikaži samo 1-2 zvjezdice) jer je adminu korisno brzo vidjeti loše recenzije. Read-only — nikakvi edit gumbi. Admin ne može brisati ni uređivati recenzije.

---

## 6. Autentifikacija

### 6.1 Login Stranica

**Prva stranica** koja se vidi kad se aplikacija otvori. Na desktopu split-screen — lijeva strana hero ilustracija/slika kazališta, desna strana login forma. Na mobilnom samo forma u centriranom cardu.

Polja: email i lozinka. Frontend validacija u realnom vremenu (email format, minimalna dužina lozinke). Jasne error poruke ispod polja ("Pogrešan email ili lozinka"). Link na registraciju ("Nemaš račun? Registriraj se").

### 6.2 Registracija

Isti dizajn kao login (split-screen na desktopu, card na mobilnom). Polja: ime, prezime, email, lozinka, potvrda lozinke.

Password strength indikator koji se mijenja kako korisnik tipka (crvena/žuta/zelena). Lista zahtjeva za lozinku ispod polja (min 8 znakova, veliko slovo, broj). Nakon uspješne registracije — email potvrda. Prikazati poruku "Provjerite vaš email za potvrdu" i preusmjeriti na login.

### 6.3 Preusmjeravanje nakon logina

- Korisnik se nakon uspješnog logina preusmjerava na stranicu **Događaji**
- Admin se nakon uspješnog logina preusmjerava na admin **Događaji**

---

## 7. Tehnički Stack

### 7.1 State Management

Za aplikaciju ove veličine koristiti **Zustand** — najjednostavniji za postaviti, minimalan boilerplate, skalira dobro. Redux je overkill za ovo.

### 7.2 API Komunikacija

Koristiti **Axios** za komunikaciju s backendom. Postaviti globalnu Axios instancu s base URL-om i interceptorima za automatsko dodavanje JWT tokena u headere i za hvatanje 401 grešaka (automatski logout/redirect na login).

### 7.3 Forme

**React Hook Form + Zod** za validaciju. Performantan, minimalan re-render, odlična integracija s TypeScriptom.

---

## 8. Redoslijed Izrade

1. **Setup projekta** — Vite + React + Tailwind + Router
2. **Navigacija + Footer** — zajednički layout
3. **Login + Registracija** — autentifikacija i zaštita ruta
4. **Stranica Događaji** — kartice, filter, responzivnost
5. **Popup rezervacija** — modal/bottom sheet
6. **Stranica Kazališta** — popis + pojedinačna stranica
7. **Stranica Rezervacije** — accordion lista
8. **Stranica Recenzije** — zvjezdice, dva stupca/tabovi
9. **Admin stranice** — forme i tablice
10. **Polish** — animacije, loading stanja, empty states, testiranje


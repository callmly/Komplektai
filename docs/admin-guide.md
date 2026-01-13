# KNX Smart Home - Administravimo vadovas

## Turinys
1. [Prisijungimas prie administravimo panelės](#prisijungimas)
2. [Svetainės turinio valdymas](#turinio-valdymas)
3. [Planų ir kainų redagavimas](#planai)
4. [SEO nustatymai](#seo)
5. [Dizaino modifikacijos](#dizainas)
6. [Dažniausiai užduodami klausimai](#duk)

---

## Prisijungimas prie administravimo panelės {#prisijungimas}

### Kaip pasiekti admin panelę
1. Atidarykite naršyklėje: `https://jusu-svetaine.lt/admin`
2. Būsite nukreipti į Replit autentifikacijos puslapį
3. Prisijunkite su savo Replit paskyra

### Kas gali prisijungti
- Prisijungti gali tik Replit paskyros savininkai
- Jei norite pakeisti kas gali administruoti svetainę, susisiekite su svetainės kūrėju

### Atsijungimas
- Spauskite atsijungimo mygtuką (rodyklė) šoninėje juostoje apačioje

---

## Svetainės turinio valdymas {#turinio-valdymas}

### Svetainės turinys (Pagrindiniai tekstai)
**Kelias:** Admin → Svetainės turinys

Čia galite redaguoti:
- **Antraštė** - Navigacijos juostos pavadinimas
- **Hero sekcija** - Pagrindinis skyrius su antrašte ir aprašymu
- **Kontaktai** - Kontaktinė informacija
- **Poraštė** - Apatinis skyrius
- **Padėka** - Pranešimas po užklausos pateikimo

Kiekvienoje sekcijoje galite keisti:
- Antraštę
- Pagrindinį tekstą
- CTA mygtuko tekstą
- Nuotraukos URL

### Turinio blokai
**Kelias:** Admin → Turinio blokai

Turinio blokai - tai papildomos sekcijos svetainėje (maks. 10 blokų).

Galimybės:
- **Sukurti naują bloką** - Spauskite "Pridėti bloką"
- **Slug** - Unikalus identifikatorius URL nuorodoms (pvz. `apie-mus` → `#apie-mus`)
- **HTML režimas** - Įjunkite jei norite naudoti HTML formatavimą
- **Aktyvus** - Ar blokas matomas svetainėje
- **Rikiavimo numeris** - Kuo mažesnis, tuo aukščiau rodomas

### Meniu nuorodos
**Kelias:** Admin → Meniu nuorodos

Čia valdote navigacijos meniu elementus:
- **Etiketė** - Meniu punkto tekstas
- **Tikslo tipas:**
  - `section` - Nuoroda į svetainės sekciją (pvz. `plans`, `features`)
  - `url` - Išorinė nuoroda (atidaroma naujame lange)
- **Tikslo reikšmė** - Sekcijos ID arba URL adresas

---

## Planų ir kainų redagavimas {#planai}

### Planai
**Kelias:** Admin → Planai

Kiekvienas planas turi:
- **Pavadinimas** - Plano vardas (pvz. "Bazinis", "Standartinis")
- **Šūkis** - Trumpas aprašymas
- **Aprašymas** - Funkcijų sąrašas (kiekviena eilutė = vienas punktas)
- **Bazinė kaina** - Pradinė kaina centais (pvz. 299900 = 2999€)
- **Išryškintas** - Ar rodyti kaip rekomenduojamą

### Opcijos
**Kelias:** Admin → Opcijos

Opcijos leidžia klientams konfigūruoti kainas:
- **Kiekio opcijos** - Pasirinkti kiekį (pvz. kambarių skaičius)
- **Jungiklių tipai** - Pasirinkti vieną iš kelių variantų
- **Papildomos paslaugos** - Pažymėti/atžymėti priedus

### Funkcijų lentelė
**Kelias:** Admin → Funkcijų lentelė

Palyginimo lentelė rodo, ką kiekvienas planas apima:
- Sukurkite funkcijų grupes (pvz. "Apšvietimas", "Šildymas")
- Pridėkite funkcijas prie grupių
- Nustatykite kiekvieno plano funkcijų reikšmes

---

## SEO nustatymai {#seo}

**Kelias:** Admin → SEO nustatymai

### Meta žymos
- **Puslapio pavadinimas** - Rodomas naršyklės skirtuke ir paieškos rezultatuose
- **Meta aprašymas** - Trumpas aprašymas paieškos rezultatuose
- **Raktiniai žodžiai** - Raktažodžiai (atskirkite kableliais)

### Socialiniai tinklai (Open Graph)
Kaip svetainė atrodo dalijantis Facebook, LinkedIn:
- OG pavadinimas
- OG aprašymas  
- OG paveikslėlis (rekomenduojamas dydis: 1200x630px)

### Google Analytics
Du būdai pridėti analitiką:
1. **Tik ID** - Įveskite `G-XXXXXXXXXX` ir sistema sukurs kodą automatiškai
2. **Pilnas kodas** - Įklijuokite visą Google Analytics kodą

### Išplėstiniai nustatymai
- **Papildomas HEAD kodas** - Bet koks kodas `<head>` sekcijoje
- **robots.txt** - Kontroliuokite paieškos robotų indeksavimą

---

## Dizaino modifikacijos {#dizainas}

### Spalvų keitimas
Spalvos nustatomos faile: `client/src/index.css`

Pagrindinės spalvų kintamieji:
```css
:root {
  --primary: 222 47% 11%;      /* Pagrindinė spalva */
  --accent: 210 40% 96%;       /* Akcentinė spalva */
  --background: 0 0% 100%;     /* Fono spalva */
  --foreground: 222 84% 5%;    /* Teksto spalva */
}
```

### Šriftų keitimas
Šriftai nustatomi tame pačiame `index.css` faile:
```css
body {
  font-family: 'Inter', sans-serif;
}
```

Google šriftų pridėjimas:
1. Pasirinkite šriftą iš fonts.google.com
2. Pridėkite `<link>` į `client/index.html`
3. Atnaujinkite `font-family` CSS

### Dizaino gairės
Failas `design_guidelines.md` turi visas dizaino taisykles.

---

## Dažniausiai užduodami klausimai {#duk}

### Kaip pakeisti svetainės pavadinimą?
Admin → Svetainės turinys → Antraštė

### Kaip pridėti naują puslapį?
Svetainė yra vieno puslapio (landing page). Papildomas turinys pridedamas per Turinio blokus.

### Kaip gauti užklausas el. paštu?
Įsitikinkite, kad Resend integracija sukonfigūruota ir nustatytas `ADMIN_EMAIL` aplinkos kintamasis.

### Kodėl neveikia Google Analytics?
1. Patikrinkite ar teisingai įvestas ID (G-XXXXXXXXXX formatas)
2. GA statistika gali pasirodyti tik po 24-48 valandų

### Kaip pakeisti logotipą?
Dabartinis logotipas yra namo ikona. Logotipo keitimui reikia redaguoti failą:
`client/src/components/landing/header.tsx`

---

## Techninė informacija

### Svetainės struktūra
- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express
- **Duomenų bazė:** PostgreSQL
- **Autentifikacija:** Replit Auth

### Svarbūs failai
- `client/src/pages/landing.tsx` - Pagrindinis puslapis
- `client/src/components/landing/` - Svetainės komponentai
- `shared/schema.ts` - Duomenų bazės struktūra
- `design_guidelines.md` - Dizaino gairės

### Aplinkos kintamieji
- `DATABASE_URL` - Duomenų bazės prisijungimas
- `SESSION_SECRET` - Sesijos saugumas
- `ADMIN_EMAIL` - El. paštas užklausų gavimui

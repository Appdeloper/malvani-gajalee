# Malvani Gajalee — Landing Page

A single-page restaurant landing site for **Malvani Gajalee**, a multi-cuisine
seafood restaurant in Dombivli by **Chef Nilesh Samant**.

## Open it
Double-click **`index.html`** — it runs in any browser, no build step needed.

## Structure
```
malvani-gajalee/
├─ index.html          # all page markup
├─ css/styles.css      # full design system + responsive layout
├─ js/script.js        # scroll reveals, sticky nav, mobile menu, reservation form
├─ images/             # photos (placeholders for now — see README-IMAGES.txt)
└─ README.md
```

## Sections
1. **Hero** — tagline "The Taste of Malvan, the Joy of Conversation" + CTAs
2. **The Gajali Story** — your full "गजाली means joyful conversations" narrative
3. **Signature Specialties** — Tandoori Platter, Malvani Thali, Kurkuri Veg, Coconut Pudding
4. **Values** — Fresh from the Coast / Hand-Ground Masala / Homely Warmth / Joy of Gajali
5. **The Chef** — Chef Nilesh Samant, a son of Malvan
6. **Gallery**
7. **Reservation form** (front-end demo — see note below)
8. **Visit / Footer** — address, hours, social, Google Map embed

## To make it real — quick edits
- **Phone:** replace `+91 99999 99999` in `index.html` (3 places).
- **Address / hours:** update the Topbar, Reserve section, and Footer.
- **Map:** change the `q=Dombivli,Maharashtra` in the footer `<iframe>` to your
  exact address or Google Maps place link.
- **Photos:** see `images/README-IMAGES.txt` — drop in the real JPGs.
- **Reservation form:** currently shows a thank-you message only. To receive
  bookings, point it at a service (Formspree, Google Forms) or a WhatsApp link.

## Design notes
Palette: Malvani maroon `#6b1414`, Konkan gold `#d4a04c`, coconut cream `#fdf6ec`.
Fonts: Cormorant Garamond (display), Marcellus (headings), Poppins (body).
Fully responsive, accessible focus states, reduced-motion support.

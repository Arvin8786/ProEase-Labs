# ProEase Labs — Unified Parent Portal

Static, build-free commercial showcase site (HTML + CSS + vanilla JS) driven by a Google Sheet.
Contains **no product code**; it only renders public commercial content.

## Go live in 4 steps
1. **Sheet:** create a Google Sheet → *Extensions → Apps Script* → paste `apps-script/Code.gs` and `apps-script/Seed.gs` → run `setupSheets()` (creates `Company_Profile`, `Products`, `Enquiries_&_Requests` with sample rows). CSV copies of the tabs are in `sheets/`.
2. **Deploy:** *Deploy → New deployment → Web app* (Execute as **Me**, access **Anyone**). Copy the `/exec` URL.
3. **Connect:** paste that URL into `API_URL` in `assets/js/config.js`.
4. **Publish:** GitHub → Settings → Pages → deploy from `main` / root.

Replace the placeholder contact details (`whatsapp_number`, `contact_email`, social URLs) in `Company_Profile`.

## Editing content
- Everything is edited in the sheet; changes appear after the cache expires (≤10 min) or on a hard refresh. Menu **ProEase CMS → Clear website cache** speeds it up.
- Add a row in `Products` → it appears in the sidebar, home grid and gets `#/product/<slug>` automatically.
- Lists use ` | ` between items and ` :: ` between title and description.
- Pricing: if `TierN_Checkout_URL` is filled, the button opens it; if blank, it pre-fills the enquiry form. Set `Visible` to FALSE to hide a product.
- `tools/build_seed.py` regenerates the CSVs, `Seed.gs` and `fallback.json` if you want to change the sample content in code.

## Moving to Render (private repo)
Create a Render **Static Site**, publish directory `.`, no build command. All paths are relative, so nothing breaks. Only edit the 4 `CHANGE-ON-MIGRATION` URLs in `index.html` (social preview tags must be absolute). 

## Notes
- Social previews are read from `index.html` only (crawlers ignore `#/` routes), so every shared link shows the brand card.
- Form posts use `text/plain` JSON to avoid CORS preflight. Spam is filtered by a honeypot field and duplicate guard; sheet formula injection is neutralised.
- The Company Network / Device Lock described on product pages are **marketing copy** for your ERP/HRM; this portal enforces nothing.

## Branding
Logo and banner artwork live in `assets/img/` (`logo-mark.png`, `logo-full.jpg`, `hero-art.jpg`, `og-image.jpg`, `favicon.png`). Theme colours are the CSS variables at the end of `assets/css/app.css` (navy `--navy-*`, cyan `--cyan`, blue `--blue`).

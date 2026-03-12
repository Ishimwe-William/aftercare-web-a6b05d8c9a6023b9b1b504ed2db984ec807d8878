/**
 * documentShared.js — Single source of truth for all Ampersand printed documents
 *
 * Exports:
 *   sharedStyles    — CSS string injected into every document
 *   googleFonts     — <link> tags for Inter + IBM Plex Mono
 *   brandHeader()   — logo pill + company info + doc title block
 *   hqFooter()      — yellow stripe + HQ address (bottom of every doc)
 *   wrapDocument()  — full HTML shell (head + body + page wrapper)
 *   formatDate()    — "18th February 2026"
 *   formatCurrency()— "1,400 RWF"
 *   statusBadge()   — coloured inline badge span
 */

// ─── Design tokens ────────────────────────────────────────────────────────────
export const Y = '#FDDE11';  // yellow — logo pill, dividers, footer stripe only
export const BD = '#E5E7EB';  // border grey
export const LG = '#f0f0f0';  // light grey line
export const BG = '#F9FAFB';  // subtle background
export const RED = '#DC2626';

// ─── CUSTOM BRAND NAME (CHANGE THIS ONCE FOR ALL PDFS) ────────────────────────
export const COMPANY_NAME = 'Ampersand'; // ←←← CHANGE THIS TO YOUR DESIRED NAME
// Example: 'Kigali Moto Services' | 'Rwanda E-Mobility' | 'YourCompany Ltd'

// ─── Shared CSS ───────────────────────────────────────────────────────────────
export const sharedStyles = `
    @page {
        size: A4 portrait;
        margin: 12mm 15mm;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
        background: #fff; color: #111;
        font-family: 'Inter', sans-serif;
        font-size: 12px; line-height: 1.5;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
    @media screen {
        body {
            width: 210mm; min-height: 297mm;
            margin: 10mm auto; padding: 12mm 15mm;
            box-shadow: 0 2px 28px rgba(0,0,0,0.13);
        }
    }
    @media print { body { padding: 0; margin: 0; box-shadow: none; width: auto; } }

    .page { display: flex; flex-direction: column; min-height: calc(297mm - 24mm); }
    .body-content { flex: 1; display: flex; flex-direction: column; padding-bottom: 200px !important; }

    /* ── HEADER ── */
    .doc-header {
        display: flex; justify-content: space-between; align-items: flex-start;
        padding-bottom: 14px; margin-bottom: 16px;
        border-bottom: 2.5px solid ${Y}; flex-shrink: 0;
        page-break-inside: avoid;
    }
    .brand { display: flex; align-items: center; gap: 12px; }
    .logo-pill {
        background: ${Y}; border-radius: 8px; padding: 6px 8px;
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .logo-img { height: 36px; width: auto; }
    .brand-text h1 {
        font-size: 20px; font-weight: 700; letter-spacing: 2.5px;
        color: #000; line-height: 1; margin-bottom: 5px;
    }
    .brand-text p { font-size: 11px; color: #444; line-height: 1.6; }
    .doc-title { text-align: right; }
    .doc-title h2 { font-size: 26px; font-weight: 700; letter-spacing: 3px; color: #000; line-height: 1; }
    .doc-title .doc-meta {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 11px; color: #555; margin-top: 5px; display: block; line-height: 1.6;
    }
    /* Invoice-specific: id + date each on own line below title */
    .doc-title .inv-id, .doc-title .inv-date {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 11px; color: #555; display: block;
    }
    .doc-title .inv-id   { margin-top: 5px; }
    .doc-title .inv-date { margin-top: 2px; }

    /* ── INFO GRID ── */
    .info-grid {
        display: grid; grid-template-columns: 1fr 1fr;
        gap: 10px 24px; margin-bottom: 14px;
        padding-bottom: 12px; border-bottom: 1px solid ${BD};
    }
    .info-block h3 {
        font-size: 9px; font-weight: 700; letter-spacing: 1.5px;
        text-transform: uppercase; color: #888;
        margin-bottom: 8px; padding-bottom: 4px;
        border-bottom: 2px solid ${Y};
    }
    .info-row { display: flex; gap: 8px; margin-bottom: 5px; font-size: 12px; }
    .lbl { font-weight: 600; min-width: 100px; color: #555; flex-shrink: 0; }
    .val { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #111; }

    /* ── SECTION HEADING ── */
    .section-heading {
        font-size: 9px; font-weight: 700; letter-spacing: 1.5px;
        text-transform: uppercase; color: #888;
        margin: 14px 0 8px; padding-bottom: 4px;
        border-bottom: 2px solid ${Y};
        page-break-after: avoid;
    }

    /* ── DATA TABLE (reports) ── */
    .data-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 12px; }
    .data-table thead tr { border-bottom: 1.5px solid #111; page-break-after: avoid; }
    .data-table th {
        padding: 6px 8px; font-size: 9px; font-weight: 700;
        letter-spacing: 1px; text-transform: uppercase; color: #555; text-align: left;
    }
    .data-table th.r { text-align: right; }
    .data-table tbody tr { border-bottom: 1px solid ${LG}; page-break-inside: avoid; }
    .data-table tbody tr:last-child { border-bottom: none; }
    .data-table td { padding: 7px 8px; vertical-align: top; }
    .data-table td.r { text-align: right; font-family: 'IBM Plex Mono', monospace; font-weight: 600; }

    /* ── PARTS TABLE (invoice) ── */
    .parts-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 12px; }
    .parts-table thead tr { border-bottom: 1.5px solid #111; page-break-after: avoid; }
    .parts-table th {
        padding: 6px 8px; font-size: 9px; font-weight: 700;
        letter-spacing: 1px; text-transform: uppercase; color: #555; text-align: left;
    }
    .parts-table th.qty, .parts-table th.unit, .parts-table th.total { text-align: right; }
    .parts-table tbody tr { border-bottom: 1px solid ${LG}; page-break-inside: avoid; }
    .parts-table tbody tr:last-child { border-bottom: none; }
    .parts-table td { padding: 7px 8px; vertical-align: top; }
    .desc .part-name { display: block; font-weight: 600; color: #111; font-size: 12px; }
    .desc .part-desc { display: block; color: #777; font-size: 11px; margin-top: 2px; }
    .desc .part-note { display: block; color: #aaa; font-style: italic; margin-top: 2px; }
    .qty  { text-align: right; width: 50px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #444; }
    .unit, .total { text-align: right; width: 115px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; font-weight: 600; color: #111; }

    /* ── STATUS BADGES ── */
    .badge {
        display: inline-block; padding: 2px 8px; border-radius: 999px;
        font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .badge-green  { background: #D1FAE5; color: #065F46; }
    .badge-yellow { background: #FEF3C7; color: #92400E; }
    .badge-red    { background: #FEE2E2; color: #991B1B; }
    .badge-gray   { background: #F3F4F6; color: #374151; }

    /* ── SUMMARY ROWS ── */
    .s-row {
        display: flex; justify-content: space-between;
        padding: 5px 0; font-size: 12px;
        border-bottom: 1px solid ${LG}; color: #444;
    }
    .s-row:last-child { border-bottom: none; }
    .s-row .s-val { font-family: 'IBM Plex Mono', monospace; font-weight: 600; color: #111; }
    .s-row.s-subtotal {
        font-weight: 700; color: #111;
        border-top: 1.5px solid #ccc; border-bottom: 1.5px solid #ccc; padding: 6px 0;
    }
    .s-row.s-discount        { color: ${RED}; }
    .s-row.s-discount .s-val { color: ${RED}; }

    /* ── TOTAL ROW: yellow top divider, no box ── */
    .total-row {
        display: flex; justify-content: space-between; align-items: center;
        border-top: 3px solid ${Y};
        padding: 7px 0 4px; margin-top: 6px; background: #fff;
    }
    .total-row .t-label { font-size: 12px; font-weight: 700; letter-spacing: 0.5px; color: #000; }
    .total-row .t-val { font-family: 'IBM Plex Mono', monospace; font-size: 13px; font-weight: 700; color: #000; }

    /* ── NO-PARTS NOTICE ── */
    .no-parts {
        text-align: center; padding: 12px;
        border: 1px solid ${BD}; border-radius: 4px;
        color: #888; font-size: 12px; margin-bottom: 14px;
    }

    /* ── NOTES ── */
    .notes-block {
        padding: 9px 11px; background: ${BG};
        border-left: 3px solid ${Y}; border-radius: 2px; margin-bottom: 12px;
        page-break-inside: avoid;
    }
    .notes-block h3 {
        font-size: 9px; font-weight: 700; letter-spacing: 1.5px;
        text-transform: uppercase; color: #888; margin-bottom: 5px;
    }
    .notes-block p { font-size: 11px; color: #444; line-height: 1.55; }

    /* ── MID FOOTER ── */
    .mid-footer {
        margin-top: auto; padding: 10px 0 6px;
        display: flex; justify-content: space-between; align-items: flex-end;
        border-top: 1px solid ${BD};
        page-break-inside: avoid;
        page-break-before: avoid;
    }
    .mid-footer-left { font-size: 11px; color: #555; }
    .mid-footer-left strong { color: #111; font-size: 12px; }
    .mid-footer-right { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #bbb; }

    /* ── HQ FOOTER: yellow stripe on top, white bg ── */
    .hq-footer { margin-top: 40px; flex-shrink: 0; page-break-inside: avoid; }
    .hq-divider { height: 6px; background: ${Y}; border-radius: 2px 2px 0 0; }
    .hq-footer-text {
        padding: 8px 14px; text-align: center;
        font-size: 10.5px; color: #111; line-height: 1.7; background: #fff;
        border: 1px solid ${BD}; border-top: none; border-radius: 0 0 3px 3px;
    }
    .hq-footer-text strong { font-weight: 700; }
    .hq-footer-text .website {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 10px; font-weight: 600; letter-spacing: 0.5px;
    }

    /* ── PRINT PAGE BREAKS ── */
    @media print {
        .page { page-break-after: always; }
        .mid-footer { page-break-before: avoid; }
        .body-content {
            padding-bottom: 200px !important;
        }
        .hq-footer {
            page-break-inside: avoid;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            max-width: 210mm;
            margin-left: auto;
            margin-right: auto;
            z-index: 1000;
        }
        body { margin-bottom: 0; }
    }
`;

// ─── Google Fonts ─────────────────────────────────────────────────────────────
export const googleFonts = `
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
`;

// ─── Shared header (now uses COMPANY_NAME) ────────────────────────────────────
export const brandHeader = (docTitle, docMeta = null) => `
    <div class="doc-header">
        <div class="brand">
            <div class="logo-pill">
                <img src="/ampersand-logo.png" alt="${COMPANY_NAME}" class="logo-img" />
            </div>
            <div class="brand-text">
                <h1>${COMPANY_NAME.toUpperCase()}</h1>
                <p>Ampersand Rwanda Ltd<br>KK 6 AV, Road to Magerwa, Opposite NAEB<br>info@ampersand.solar</p>
            </div>
        </div>
        <div class="doc-title">
            <h2>${docTitle}</h2>
            ${docMeta ? `<span class="doc-meta">${docMeta}</span>` : ''}
        </div>
    </div>
`;

// ─── Shared HQ footer ─────────────────────────────────────────────────────────
export const hqFooter = () => `
    <div class="hq-footer">
        <div class="hq-divider"></div>
        <div class="hq-footer-text">
            <strong>Headquarter:</strong> +250 788 380 366 &nbsp;|&nbsp; KK 6 Ave Road to MAGERWA Opposite NAEB &nbsp;|&nbsp; PO Box 518, Kigali, Rwanda &nbsp;·&nbsp;
            <strong>Nairobi Office:</strong> +254 795 299 687 &nbsp;|&nbsp; Afriq Center, Maasai Rd, Opp Sameer Park, Go down No. 4 &nbsp;|&nbsp; P.O.Box 22402-00505, Nairobi, Kenya<br>
            <span class="website">www.ampersand.solar</span>
        </div>
    </div>
`;

// ─── Document shell (PDF title now uses COMPANY_NAME) ─────────────────────────
export const wrapDocument = (title, body) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title} – ${COMPANY_NAME}</title>
    ${googleFonts}
    <style>${sharedStyles}</style>
</head>
<body>
    <div class="page" role="document">
        ${body}
        ${hqFooter()}
    </div>
</body>
</html>
`;

// ─── Shared helpers ───────────────────────────────────────────────────────────
export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate();
    let ordinal = 'th';
    if (day % 10 === 1 && day !== 11) ordinal = 'st';
    else if (day % 10 === 2 && day !== 12) ordinal = 'nd';
    else if (day % 10 === 3 && day !== 13) ordinal = 'rd';
    return `${day}${ordinal} ${date.toLocaleString('en-US', {month: 'long'})} ${date.getFullYear()}`;
};

export const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString('en-US') + ' RWF';

export const statusBadge = (status = '') => {
    const s = status.toLowerCase();
    if (['completed', 'resolved', 'active'].includes(s)) return `<span class="badge badge-green">${status}</span>`;
    if (['pending', 'in_progress', 'in progress'].includes(s)) return `<span class="badge badge-yellow">${status}</span>`;
    if (['cancelled', 'failed', 'overdue'].includes(s)) return `<span class="badge badge-red">${status}</span>`;
    return `<span class="badge badge-gray">${status}</span>`;
};
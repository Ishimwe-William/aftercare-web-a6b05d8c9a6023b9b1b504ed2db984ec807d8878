/**
 * usePdfExport — Dynamic PDF / print hook for Ampersand documents
 *
 * All styling, header, footer, and helpers come from documentShared.js.
 * This file only contains:
 * - Report-specific HTML body generators (serviceReport, userReport)
 * - The printHTML() core function
 * - The usePdfExport() React hook
 *
 * Usage:
 * const { exportPdf, isExporting, error } = usePdfExport();
 */

import { useState, useCallback } from 'react';
import { brandHeader, wrapDocument, formatDate, formatCurrency, statusBadge, COMPANY_NAME } from '../utils/documentShared';
import { generateInvoiceHTMLWeb } from '../components/invoiceHTMLGenerator';

// ─── SERVICE REPORT ───────────────────────────────────────────────────────────
const generateServiceReportHTML = (data) => {
    const { caseDetails = {}, parts = [], technicianName, laborRate } = data;
    const {
        caseId, status, issueType, createdAt, resolvedAt,
        motorcycle = {}, technician, laborHours = 0,
        notes
    } = caseDetails;

    const issueCost = caseDetails.issueCost ?? caseDetails.laborCost ?? 0;
    const partsCost = caseDetails.partsCost ?? 0;
    const discount = caseDetails.discount ?? caseDetails.discountAmount ?? 0;
    const totalCost = caseDetails.totalCost ?? (issueCost + partsCost - discount);

    const partsRows = parts.length > 0
        ? parts.map(p => `
            <tr>
                <td>${p.partName || p.name || 'N/A'}</td>
                <td class="r">${p.quantityUsed || p.quantity || 0}</td>
                <td class="r">${formatCurrency(p.unitCost || p.cost)}</td>
                <td class="r">${formatCurrency((p.quantityUsed || p.quantity || 0) * (p.unitCost || p.cost || 0))}</td>
            </tr>`).join('')
        : `<tr><td colspan="4" style="text-align:center;color:#888;padding:12px">No parts used</td></tr>`;

    const body = `
        ${brandHeader('SERVICE REPORT', `Case #${(caseId || '').substring(0, 8) || 'N/A'}<br>${formatDate(createdAt)}`)}
        <div class="body-content">
            <div class="info-grid">
                <div class="info-block">
                    <h3>Case Details</h3>
                    <div class="info-row"><span class="lbl">Case ID</span><span class="val">${(caseId || '').substring(0, 8) || 'N/A'}</span></div>
                    <div class="info-row"><span class="lbl">Status</span><span class="val">${statusBadge(status)}</span></div>
                    <div class="info-row"><span class="lbl">Issue Type</span><span class="val">${issueType || 'N/A'}</span></div>
                    <div class="info-row"><span class="lbl">Created</span><span class="val">${formatDate(createdAt)}</span></div>
                    ${resolvedAt ? `<div class="info-row"><span class="lbl">Resolved</span><span class="val">${formatDate(resolvedAt)}</span></div>` : ''}
                </div>
                <div class="info-block">
                    <h3>Vehicle &amp; Technician</h3>
                    <div class="info-row"><span class="lbl">Bike Model</span><span class="val">${motorcycle.model || 'N/A'}</span></div>
                    <div class="info-row"><span class="lbl">Plate Number</span><span class="val">${motorcycle.plateNumber || 'N/A'}</span></div>
                    <div class="info-row"><span class="lbl">Technician</span><span class="val">${technicianName || technician || 'N/A'}</span></div>
                    <div class="info-row"><span class="lbl">Labor Hours</span><span class="val">${Number(laborHours).toFixed(2)} hrs</span></div>
                    ${laborRate ? `<div class="info-row"><span class="lbl">Labor Rate</span><span class="val">${formatCurrency(laborRate)}/hr</span></div>` : ''}
                </div>
            </div>

            <div class="section-heading">Parts &amp; Materials Used</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Part Name</th><th class="r">Qty</th>
                        <th class="r">Unit Price</th><th class="r">Subtotal</th>
                    </tr>
                </thead>
                <tbody>${partsRows}</tbody>
            </table>

            <div style="display:flex;justify-content:flex-end;margin-bottom:14px">
                <div style="width:260px">
                    <div class="s-row"><span>Labor Cost</span><span class="s-val">${formatCurrency(issueCost)}</span></div>
                    <div class="s-row"><span>Parts Cost</span><span class="s-val">${formatCurrency(partsCost)}</span></div>
                    ${discount > 0 ? `<div class="s-row s-discount"><span>Discount</span><span class="s-val">− ${formatCurrency(discount)}</span></div>` : ''}
                    <div class="total-row">
                        <span class="t-label">TOTAL</span>
                        <span class="t-val">${formatCurrency(totalCost)}</span>
                    </div>
                </div>
            </div>

            ${notes ? `<div class="notes-block"><h3>Notes</h3><p>${notes}</p></div>` : ''}

            <div class="mid-footer">
                <div class="mid-footer-left"><strong>${COMPANY_NAME} E-mobility — Service Report</strong></div>
                <div class="mid-footer-right">Generated ${formatDate(new Date())}</div>
            </div>
        </div>`;

    return wrapDocument('Service Report', body);
};

// ─── USER / RIDER REPORT ──────────────────────────────────────────────────────
const generateUserReportHTML = (data) => {
    const { user = {}, serviceHistory = [], stats = {} } = data;
    const { name, phone, email, joinedAt, status } = user;
    const { totalCases = 0, totalSpent = 0, avgCost = 0, lastService } = stats;

    const historyRows = serviceHistory.length > 0
        ? serviceHistory.map(c => `
            <tr>
                <td style="font-family:'IBM Plex Mono',monospace;font-size:11px">${(c.caseId || '').substring(0, 8)}</td>
                <td>${formatDate(c.createdAt)}</td>
                <td>${c.issueType || 'N/A'}</td>
                <td>${statusBadge(c.status)}</td>
                <td>${c.technicianName || 'N/A'}</td>
                <td class="r">${formatCurrency(c.totalCost)}</td>
            </tr>`).join('')
        : `<tr><td colspan="6" style="text-align:center;color:#888;padding:12px">No service history found</td></tr>`;

    const body = `
        ${brandHeader('RIDER REPORT', `${name || 'N/A'}<br>${formatDate(new Date())}`)}
        <div class="body-content">
            <div class="info-grid">
                <div class="info-block">
                    <h3>Rider Information</h3>
                    <div class="info-row"><span class="lbl">Full Name</span><span class="val">${name || 'N/A'}</span></div>
                    <div class="info-row"><span class="lbl">Phone</span><span class="val">${phone || 'N/A'}</span></div>
                    <div class="info-row"><span class="lbl">Email</span><span class="val">${email || 'N/A'}</span></div>
                    <div class="info-row"><span class="lbl">Joined</span><span class="val">${formatDate(joinedAt)}</span></div>
                    <div class="info-row"><span class="lbl">Status</span><span class="val">${statusBadge(status)}</span></div>
                </div>
                <div class="info-block">
                    <h3>Service Summary</h3>
                    <div class="info-row"><span class="lbl">Total Cases</span><span class="val">${totalCases}</span></div>
                    <div class="info-row"><span class="lbl">Total Spent</span><span class="val">${formatCurrency(totalSpent)}</span></div>
                    <div class="info-row"><span class="lbl">Avg. Cost</span><span class="val">${formatCurrency(avgCost)}</span></div>
                    <div class="info-row"><span class="lbl">Last Service</span><span class="val">${formatDate(lastService)}</span></div>
                </div>
            </div>

            <div class="section-heading">Service History</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Case ID</th><th>Date</th><th>Issue</th>
                        <th>Status</th><th>Technician</th><th class="r">Cost</th>
                    </tr>
                </thead>
                <tbody>${historyRows}</tbody>
            </table>

            <div class="mid-footer">
                <div class="mid-footer-left"><strong>${COMPANY_NAME} E-mobility — Rider Report</strong></div>
                <div class="mid-footer-right">Generated ${formatDate(new Date())}</div>
            </div>
        </div>`;

    return wrapDocument('Rider Report', body);
};

// ─── MONITORING / CASES REPORT ────────────────────────────────────────────────
const generateMonitoringReportHTML = (data) => {
    const { cases = [], filters = {} } = data;

    const getLabor = (c) => {
        if (c.status !== 'COMPLETED') return null;
        if (c.invoice?.issueCost && Number(c.invoice.issueCost) > 0) return Number(c.invoice.issueCost);
        if (c.invoice?.laborCost && Number(c.invoice.laborCost) > 0) return Number(c.invoice.laborCost);
        const cost = Number(c.issueCost ?? c.laborCost ?? 0);
        return cost > 0 ? cost : null;
    };
    const getParts = (c) => {
        if (c.status !== 'COMPLETED') return null;
        if (c.invoice?.partsCost && Number(c.invoice.partsCost) > 0) return Number(c.invoice.partsCost);
        const cost = Number(c.partsCost ?? 0);
        return cost > 0 ? cost : null;
    };
    const getDiscount = (c) => {
        if (c.status !== 'COMPLETED') return null;
        if (c.invoice?.discount && Number(c.invoice.discount) > 0) return Number(c.invoice.discount);
        if (c.invoice?.discountAmount && Number(c.invoice.discountAmount) > 0) return Number(c.invoice.discountAmount);
        const discount = Number(c.discount ?? c.discountAmount ?? 0);
        return discount > 0 ? discount : null;
    };
    const getTotal = (c) => {
        if (c.status !== 'COMPLETED') return null;
        if (c.invoice?.totalCost && Number(c.invoice.totalCost) > 0) return Number(c.invoice.totalCost);
        if (c.totalCost && Number(c.totalCost) > 0) return Number(c.totalCost);
        const labor = getLabor(c) ?? 0;
        const parts = getParts(c) ?? 0;
        const discount = getDiscount(c) ?? 0;
        const total = labor + parts - discount;
        return total > 0 ? total : null;
    };

    const totalCases  = cases.length;
    const completedCases = cases.filter(c => c.status === 'COMPLETED');
    const totalCost   = completedCases.reduce((s, c) => s + (getTotal(c) ?? 0), 0);
    const totalLabor  = completedCases.reduce((s, c) => s + (getLabor(c) ?? 0), 0);
    const totalParts  = completedCases.reduce((s, c) => s + (getParts(c) ?? 0), 0);
    const totalDiscount = completedCases.reduce((s, c) => s + (getDiscount(c) ?? 0), 0);

    const countByStatus = cases.reduce((acc, c) => {
        const s = (c.status || 'UNKNOWN').toUpperCase();
        acc[s] = (acc[s] || 0) + 1;
        return acc;
    }, {});

    const activeFilters = [];
    if (filters.status)    activeFilters.push(`Status: ${filters.status}`);
    if (filters.dateRange) activeFilters.push(`Range: ${filters.dateRange}`);
    if (filters.startDate && filters.endDate) {
        activeFilters.push(`${formatDate(filters.startDate)} → ${formatDate(filters.endDate)}`);
    }
    const filterNote = activeFilters.length
        ? activeFilters.join(' &nbsp;·&nbsp; ')
        : 'All records — no filters applied';

    const statusSummary = Object.entries(countByStatus)
        .map(([s, n]) => `${statusBadge(s.toLowerCase())} <span style="font-size:11px;margin-left:3px;color:#444">${n}</span>`)
        .join('&nbsp;&nbsp;');

    const caseRows = cases.length > 0
        ? cases.map((c, idx) => `
            <tr style="${idx % 2 === 1 ? 'background:#fafafa' : ''}">
                <td style="text-align:center;font-weight:600;font-family:'IBM Plex Mono',monospace;color:#555">${idx + 1}</td>
                <td style="font-family:'IBM Plex Mono',monospace;font-size:10px;color:#555">${(c.caseId || '').substring(0, 8) || '—'}</td>
                <td>${c.motorcycle?.plateNumber || '—'}</td>
                <td>${c.issueType || '—'}</td>
                <td>${c.technician || '—'}</td>
                <td>${statusBadge(c.status || '')}</td>
                <td style="font-family:'IBM Plex Mono',monospace;font-size:10px;color:#555">${formatDate(c.createdAt)}</td>
                <td class="r">${getTotal(c) !== null ? formatCurrency(getTotal(c)) : 'N/A'}</td>
            </tr>`).join('')
        : `<tr><td colspan="8" style="text-align:center;color:#888;padding:16px">No cases match the current filters</td></tr>`;

    const body = `
        ${brandHeader('CASES REPORT', `${formatDate(new Date())}`)}
        <div class="body-content">

            <div style="margin-bottom:12px;padding:8px 10px;background:#f9fafb;border-left:3px solid #FDDE11;border-radius:2px;font-size:11px;color:#555">
                <strong style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#888">Filters applied: </strong>${filterNote}
            </div>

            <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:14px">
                ${[
        ['Total Cases',   totalCases,              '#111'],
        ['Total Cost',    formatCurrency(totalCost), '#111'],
        ['Labor Cost',    formatCurrency(totalLabor),'#555'],
        ['Parts Cost',    formatCurrency(totalParts),'#555'],
        ['Total Discount',formatCurrency(totalDiscount),'#DC2626'],
    ].map(([label, val, col]) => `
                    <div style="border:1px solid #E5E7EB;border-radius:4px;padding:9px 12px;background:#fff">
                        <div style="font-size:9px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#888;margin-bottom:4px">${label}</div>
                        <div style="font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:700;color:${col}">${val}</div>
                    </div>`).join('')}
            </div>

            ${statusSummary ? `
            <div style="margin-bottom:12px;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                <span style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#888;margin-right:4px">Breakdown:</span>
                ${statusSummary}
            </div>` : ''}

            <div class="section-heading">Case Details</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>S/N</th>
                        <th>Case ID</th>
                        <th>Plate</th>
                        <th>Issue Type</th>
                        <th>Technician</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th class="r">Total Cost</th>
                    </tr>
                </thead>
                <tbody>${caseRows}</tbody>
            </table>

            <div style="display:flex;justify-content:flex-end;margin-bottom:14px">
                <div style="width:280px">
                    <div class="s-row"><span>Labor Cost</span><span class="s-val">${formatCurrency(totalLabor)}</span></div>
                    <div class="s-row"><span>Parts Cost</span><span class="s-val">${formatCurrency(totalParts)}</span></div>
                    ${totalDiscount > 0 ? `<div class="s-row s-discount"><span>Discount</span><span class="s-val">− ${formatCurrency(totalDiscount)}</span></div>` : ''}
                    <div class="total-row">
                        <span class="t-label">TOTAL (${totalCases} case${totalCases !== 1 ? 's' : ''})</span>
                        <span class="t-val">${formatCurrency(totalCost)}</span>
                    </div>
                </div>
            </div>

            <div class="mid-footer">
                <div class="mid-footer-left"><strong>${COMPANY_NAME} — Cases Report</strong></div>
                <div class="mid-footer-right">Generated ${formatDate(new Date())}</div>
            </div>
        </div>`;

    return wrapDocument('Cases Report', body);
};

// ─── Core print function ──────────────────────────────────────────────────────
const printHTML = (html) => {
    return new Promise((resolve, reject) => {
        const iframe = document.createElement('iframe');
        Object.assign(iframe.style, {
            position: 'fixed', right: '0', bottom: '0',
            width: '0', height: '0', border: '0', opacity: '0',
        });
        iframe.setAttribute('aria-hidden', 'true');
        iframe.srcdoc = html;
        document.body.appendChild(iframe);

        iframe.addEventListener('load', () => {
            try {
                // Add small delay to ensure iframe content is fully rendered
                // especially important on mobile devices
                setTimeout(() => {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                    resolve();
                }, 100);
            } catch (err) {
                reject(err);
            } finally {
                setTimeout(() => {
                    try { iframe.parentNode?.removeChild(iframe); } catch (_) {}
                }, 1500);
            }
        }, { once: true });
    });
};

// ─── The hook ─────────────────────────────────────────────────────────────────
const usePdfExport = () => {
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError]             = useState(null);

    const exportPdf = useCallback(async ({ type, data = {}, html: rawHtml } = {}) => {
        setIsExporting(true);
        setError(null);

        try {
            let html = '';
            switch (type) {
                case 'invoice': {
                    const { invoiceData, calculations, task, additionalNotes, laborRate } = data;
                    html = generateInvoiceHTMLWeb(invoiceData, calculations, task, additionalNotes, laborRate);
                    break;
                }
                case 'serviceReport':
                    html = generateServiceReportHTML(data);
                    break;
                case 'userReport':
                    html = generateUserReportHTML(data);
                    break;
                case 'monitoringReport':
                    html = generateMonitoringReportHTML(data);
                    break;
                case 'custom':
                    if (!rawHtml) throw new Error('usePdfExport: html is required for type="custom"');
                    html = rawHtml;
                    break;
                default:
                    throw new Error(`usePdfExport: unknown type "${type}". Use invoice | serviceReport | userReport | monitoringReport | custom.`);
            }

            await printHTML(html);
        } catch (err) {
            console.error('[usePdfExport]', err);
            setError(err.message || 'Export failed');
        } finally {
            setIsExporting(false);
        }
    }, []);

    return { exportPdf, isExporting, error };
};

export default usePdfExport;
export { generateServiceReportHTML, generateUserReportHTML, generateMonitoringReportHTML };
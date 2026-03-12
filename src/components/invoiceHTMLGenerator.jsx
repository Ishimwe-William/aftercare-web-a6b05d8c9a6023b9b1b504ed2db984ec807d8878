/**
 * invoiceHTMLGenerator.js
 * Generates the invoice HTML using shared primitives from documentShared.js.
 * Only invoice-specific content lives here: line items, summary, invoice fields.
 */
import { brandHeader, wrapDocument, formatDate, formatCurrency } from '../utils/documentShared';

export const generateInvoiceHTMLWeb = (invoiceData, calculations, task, additionalNotes) => {
    const lineItems    = invoiceData?.lineItems || [];
    const hasLineItems = lineItems.length > 0;

    const lineItemsHTML = hasLineItems ? lineItems.map((item) => {
        const quantity = parseFloat(item.quantityUsed || 0);
        const unitCost = parseFloat(item.unitCost || 0);
        const total    = parseFloat(item.totalCost || (quantity * unitCost) || 0);
        return `
            <tr>
                <td class="desc">
                    <span class="part-name">${item.partName || 'Unknown Part'}</span>
                    ${item.partDescription ? `<span class="part-desc">${item.partDescription}</span>` : ''}
                    ${item.notes          ? `<span class="part-note">${item.notes}</span>`            : ''}
                </td>
                <td class="qty">${quantity.toFixed(0)}</td>
                <td class="unit">${formatCurrency(unitCost)}</td>
                <td class="total">${formatCurrency(total)}</td>
            </tr>`;
    }).join('') : '';

    const issueCost    = Number(calculations?.issueCost      ?? calculations?.laborCost ?? invoiceData?.issueCost ?? invoiceData?.laborCost ?? 0);
    const partsCostVal = Number(calculations?.partsCost      ?? invoiceData?.partsCost    ?? 0);
    const subtotalVal  = Number(calculations?.subtotal       ?? (issueCost + partsCostVal));
    const discountVal  = Number(calculations?.discountAmount ?? invoiceData?.discount     ?? 0);
    const totalVal     = Number(calculations?.totalCost      ?? (subtotalVal - discountVal));

    // Invoice header: title + id/date stacked below (invoice-specific layout)
    const invoiceHeader = brandHeader('INVOICE', null).replace(
        '</div>\n    </div>',   // close .doc-title
        `    <span class="inv-id">#${invoiceData?.invoiceId?.substring(0, 8) || 'NEW'}</span>
            <span class="inv-date">${formatDate(invoiceData?.generatedAt || new Date())}</span>
        </div>
    </div>`
    );

    const body = `
        ${invoiceHeader}
        <div class="body-content">

            <div class="info-grid">
                <div class="info-block">
                    <h3>Invoice Details</h3>
                    <div class="info-row"><span class="lbl">Invoice #</span><span class="val">${invoiceData?.invoiceId?.substring(0, 8) || 'NEW'}</span></div>
                    <div class="info-row"><span class="lbl">Date</span><span class="val">${formatDate(invoiceData?.generatedAt || new Date())}</span></div>
                    <div class="info-row"><span class="lbl">Technician</span><span class="val">${invoiceData?.technicianName || task?.technicianName || 'N/A'}</span></div>
                    <div class="info-row"><span class="lbl">Issue Type</span><span class="val">${invoiceData?.issueType || task?.issueType || 'N/A'}</span></div>
                </div>
                <div class="info-block">
                    <h3>Vehicle Information</h3>
                    <div class="info-row"><span class="lbl">Bike Model</span><span class="val">${invoiceData?.motorcycleModel || task?.motorcycleModel || 'N/A'}</span></div>
                    <div class="info-row"><span class="lbl">Plate Number</span><span class="val">${invoiceData?.motorcyclePlateNumber || task?.motorcyclePlateNumber || 'N/A'}</span></div>
                    <div class="info-row"><span class="lbl">Owner</span><span class="val">${invoiceData?.ownerName || 'N/A'}${invoiceData?.ownerPhone ? ` · ${invoiceData?.ownerPhone}` : ''}</span></div>
                    <div class="info-row"><span class="lbl">Labor Hours</span><span class="val">${(invoiceData?.laborHours || task?.laborHours || 0).toFixed(2)} hrs</span></div>
                </div>
            </div>

            <div class="section-heading">Parts &amp; Materials</div>
            ${hasLineItems ? `
                <table class="parts-table" role="table" aria-label="Parts and materials">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th class="qty">Qty</th>
                            <th class="unit">Unit Price</th>
                            <th class="total">Total</th>
                        </tr>
                    </thead>
                    <tbody>${lineItemsHTML}</tbody>
                </table>
            ` : `<div class="no-parts">No spare parts were used for this service</div>`}

            <div style="display:flex;justify-content:flex-end;margin-bottom:14px">
                <div style="width:260px">
                    <div class="s-row"><span>Labor Cost</span><span class="s-val">${formatCurrency(issueCost)}</span></div>
                    <div class="s-row"><span>Parts Cost</span><span class="s-val">${formatCurrency(partsCostVal)}</span></div>
                    <div class="s-row s-subtotal"><span>Subtotal</span><span class="s-val">${formatCurrency(subtotalVal)}</span></div>
                    ${discountVal > 0 ? `
                    <div class="s-row s-discount"><span>Discount</span><span class="s-val">− ${formatCurrency(discountVal)}</span></div>` : ''}
                    <div class="total-row">
                        <span class="t-label">TOTAL DUE</span>
                        <span class="t-val">${formatCurrency(totalVal)}</span>
                    </div>
                </div>
            </div>

            ${(additionalNotes || invoiceData?.notes) ? `
            <div class="notes-block">
                <h3>Notes</h3>
                <p>${additionalNotes || invoiceData?.notes}</p>
            </div>` : ''}

            <div class="mid-footer">
                <div class="mid-footer-left">
                    <strong>Thank you for choosing Ampersand E-mobility</strong>
                </div>
                <div class="mid-footer-right">Generated ${formatDate(invoiceData?.generatedAt || new Date())}</div>
            </div>

        </div>`;

    return wrapDocument('Invoice', body);
};
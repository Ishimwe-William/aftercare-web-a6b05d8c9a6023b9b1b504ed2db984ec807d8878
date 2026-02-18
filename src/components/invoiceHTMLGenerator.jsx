/**
 * Generates HTML for invoice display and export (Web App)
 * IDENTICAL to mobile version for consistent PDF output
 */
export const generateInvoiceHTMLWeb = (invoiceData, calculations, task, additionalNotes, laborRate) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    const lineItems = invoiceData?.lineItems || [];
    const hasLineItems = lineItems.length > 0;
    const lineItemsHTML = hasLineItems ? lineItems.map((item) => {
        const quantity = parseFloat(item.quantityUsed || 0);
        const unitCost = parseFloat(item.unitCost || 0);
        const total = parseFloat(item.totalCost || (quantity * unitCost) || 0);
        return `
            <tr>
                <td class="desc">
                    <div class="part-name">${item.partName || 'Unknown Part'}</div>
                    ${item.partDescription ? `<div class="part-desc">${item.partDescription}</div>` : ''}
                    ${item.notes ? `<div class="part-note">Note: ${item.notes}</div>` : ''}
                </td>
                
                <td class="qty">${quantity.toFixed(0)}</td>
                <td class="unit">${unitCost.toFixed(0)} RWF</td>
                <td class="total">${total.toFixed(0)} RWF</td>
            </tr>
        `;
    }).join('') : '';

    // Safe numeric fallback
    const issueCost = Number(calculations?.issueCost ?? invoiceData?.issueCost ?? 0);
    const partsCostVal = Number(calculations?.partsCost ?? invoiceData?.partsCost ?? 0);
    const subtotalVal = Number(calculations?.subtotal ?? (issueCost + partsCostVal));
    const discountVal = Number(calculations?.discountAmount ?? invoiceData?.discount ?? 0);
    const totalVal = Number(calculations?.totalCost ?? (subtotalVal - discountVal));
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Invoice</title>
      <style>
        @page { size: A4 portrait; margin: 0; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background: white;
          color: #1f2937;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .invoice-wrapper {
          padding: 20mm;
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
          color: #1f2937;
          font-size: 13px;
          line-height: 1.4;
        }
        @media screen {
          body {
            width: 210mm;
            min-height: 297mm;
            margin: 20mm auto;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
        }
        @media print {
          body {
            box-shadow: none;
          }
          .parts-table thead { background: #FDDE11 !important; }
          .summary-row.totalValue { background: #FDDE11 !important; }
          .header { background: #FDDE11 !important; }
        }
        .header {
            background: #FDDE11;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .header-left {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .brand h1 {
            font-size: 20px;
            margin-bottom: 5px;
            color: #000;
            font-weight: bold;
            letter-spacing: 0.5px;
        }
        .brand p {
            font-size: 12px;
            color: #374151;
            margin: 2px 0 0 0;
        }
        .header-right { text-align: right; }
        .invoice-title h2 {
            font-size: 28px;
            font-weight: bold;
            color: #000;
            margin: 0;
        }
        .invoice-meta {
            margin-top: 6px;
            font-size: 12px;
            color: #374151;
        }
       
        .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            gap: 20px;
        }
        .info-box { flex: 1; }
        .info-box h3 {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 12px;
            color: #111827;
            border-bottom: 2px solid #FDDE11;
            padding-bottom: 5px;
        }
        .info-row {
            display: flex;
            gap: 8px;
            font-size: 12px;
            color: #374151;
            margin-bottom: 8px;
        }
        .label {
            font-weight: bold;
            min-width: 110px;
            color: #111827;
        }
       
        .section-title {
            font-size: 16px;
            font-weight: bold;
            margin: 25px 0 15px 0;
            color: #111827;
            border-bottom: 2px solid #FDDE11;
            padding-bottom: 8px;
        }
       
        .parts-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            overflow: hidden;
        }
        .parts-table thead {
            background: #FDDE11;
        }
        .parts-table th {
            padding: 10px 8px;
            text-align: left;
            font-size: 13px;
            font-weight: bold;
            color: #000;
            border-bottom: 2px solid #000;
        }
        .parts-table tbody tr td {
            padding: 12px 8px;
            border-bottom: 1px solid #E5E7EB;
            font-size: 12px;
        }
        .desc .part-name {
            font-weight: 600;
            color: #111827;
            margin-bottom: 4px;
        }
        .part-desc {
            color: #6B7280;
            font-size: 12px;
        }
        .part-note {
            color: #9CA3AF;
            font-size: 11px;
            margin-top: 4px;
            font-style: italic;
        }
        .qty {
            text-align: center;
            width: 70px;
        }
        .unit, .total {
            text-align: right;
            width: 110px;
            font-weight: 600;
            color: #111827;
        }
        .parts-table tbody tr:last-child td {
            border-bottom: none;
        }
        .parts-table tbody tr:hover {
            background: #F9FAFB;
        }
       
        .no-parts {
            text-align: center;
            padding: 30px;
            background: #FEF3C7;
            border-radius: 8px;
            color: #92400E;
            font-size: 14px;
        }
       
        .summary-section {
            max-width: 400px;
            margin-left: auto;
            border: 2px solid #E5E7EB;
            border-radius: 8px;
            padding-top: 12px;
            padding-inline: 20px;
            background: #F9FAFB;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 13px;
            color: #374151;
        }
        .summary-row.subtotal {
            border-top: 1px solid #D1D5DB;
            margin-top: 5px;
            padding-top: 12px;
            font-weight: 600;
            color: #111827;
        }
        .summary-row.totalValue {
            border-top: 3px solid #000;
            border-radius: 0 0 6px 6px;
            margin-top: 5px;
            background: #FDDE11;
            padding-top: 12px;
            font-weight: 600;
            font-size: 16px;
            color: #111827;
            margin-left: -20px;
            margin-right: -20px;
            padding-right: 20px;
            padding-left: 20px;
        }
        .summary-row.discount {
            color: #DC2626;
            font-weight: 600;
        }
       
        .notes-section {
            margin-top: 30px;
            padding: 20px;
            background: #F3F4F6;
            border-left: 4px solid #FDDE11;
            border-radius: 4px;
        }
        .notes-section h3 {
            font-size: 14px;
            margin-bottom: 10px;
            color: #111827;
            font-weight: bold;
        }
        .notes-section p {
            font-size: 12px;
            line-height: 1.6;
            color: #374151;
        }
       
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #E5E7EB;
            text-align: center;
            color: #6B7280;
            font-size: 11px;
        }
        .footer p {
            margin: 5px 0;
        }
        .footer .support {
            font-size: 12px;
            margin-top: 8px;
        }
      </style>
    </head>
    <body>
      <div class="invoice-wrapper" role="document">
        <div class="header">
          <div class="brand">
            <h1>Aftercare App</h1>
            <p>Ampersand E-mobility</p>
          </div>
          <div class="invoice-title">
            <h2>INVOICE</h2>
            <div class="invoice-meta">
              Invoice #: <strong>${invoiceData?.invoiceId?.substring(0, 8) || 'NEW'}</strong>
            </div>
          </div>
        </div>
        <div class="info-section">
          <div class="info-box">
            <h3>INVOICE DETAILS</h3>
            <div class="info-row"><span class="label">Invoice #:</span><span>${invoiceData?.invoiceId?.substring(0, 8) || 'NEW'}</span></div>
            <div class="info-row"><span class="label">Date:</span><span>${formatDate(invoiceData?.generatedAt || new Date())}</span></div>
            <div class="info-row"><span class="label">Technician:</span><span>${invoiceData?.technicianName || task?.technicianName || 'N/A'}</span></div>
            <div class="info-row"><span class="label">Issue Type:</span><span>${invoiceData?.issueType || task?.issueType || 'N/A'}</span></div>
          </div>
          <div class="info-box">
            <h3>VEHICLE INFORMATION</h3>
            <div class="info-row"><span class="label">Bike Model:</span><span>${invoiceData?.motorcycleModel || task?.motorcycleModel || 'N/A'}</span></div>
            <div class="info-row"><span class="label">Plate Number:</span><span>${invoiceData?.motorcyclePlateNumber || task?.motorcyclePlateNumber || 'N/A'}</span></div>
            <div class="info-row"><span class="label">Owner:</span><span>${invoiceData?.ownerName || 'N/A'}${invoiceData?.ownerPhone ? ` (${invoiceData?.ownerPhone})` : ''}</span></div>
            <div class="info-row"><span class="label">Labor Hours:</span><span>${(invoiceData?.laborHours || task?.laborHours || 0).toFixed(2)} hrs</span></div>
          </div>
        </div>
        <h2 class="section-title">Parts & Materials</h2>
        ${hasLineItems ? `
          <table class="parts-table" role="table" aria-label="Parts and materials">
            <thead>
              <tr>
                <th>Description</th>
                <th class="qty">Quantity</th>
                <th class="unit">Unit Price</th>
                <th class="total">Total</th>
              </tr>
            </thead>
            <tbody>
              ${lineItemsHTML}
            </tbody>
          </table>
        ` : `
          <div class="no-parts">⚠️ No spare parts were used for this service</div>
        `}
        <div class="summary-section">
          <div class="summary-row">
            <span class="summary-label">Labor Cost:</span>
            <span class="summary-value">${issueCost.toFixed(0)} RWF</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Parts Cost:</span>
            <span class="summary-value">${partsCostVal.toFixed(0)} RWF</span>
          </div>
          <div class="summary-row subtotal">
            <span class="summary-label">Subtotal:</span>
            <span class="summary-value">${subtotalVal.toFixed(0)} RWF</span>
          </div>
          ${discountVal > 0 ? `
            <div class="summary-row discount">
              <span class="summary-label">Discount:</span>
              <span class="summary-value">-${discountVal.toFixed(2)} RWF</span>
            </div>
          ` : ''}
          <div class="summary-row totalValue">
            <span class="summary-label">TOTAL DUE:</span>
            <span class="summary-value">${totalVal.toFixed(0)} RWF</span>
          </div>
        </div>
       
        ${(additionalNotes || invoiceData?.notes) ? `
          <div class="notes-section">
            <h3>Additional Notes</h3>
            <p>${additionalNotes || invoiceData?.notes}</p>
          </div>
        ` : ''}
        <div class="footer">
          <p><strong>Thank you for your business!</strong></p>
          <p>Generated on ${formatDate(invoiceData?.generatedAt || new Date())}</p>
          <p class="support">For questions, please contact Ampersand E-mobility support: info@ampersand.solar • Hotline: 1011</p>
        </div>
      </div>
    </body>
    </html>
    `;
};
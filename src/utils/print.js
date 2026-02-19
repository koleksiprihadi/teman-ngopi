// src/utils/print.js
import { formatRupiah } from './currency';
import { formatDateTime } from './date';

export function generateReceiptHTML(transaction, items, cashierName) {
  const itemsHTML = items.map(item => `
    <tr>
      <td class="item-name">${item.productName}</td>
      <td class="item-qty">${item.quantity}x</td>
      <td class="item-price">${formatRupiah(item.subtotal)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Struk - ${transaction.invoiceNumber}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Courier Prime', 'Courier New', monospace;
          font-size: 12px;
          width: 80mm;
          padding: 4mm;
          color: #000;
          background: #fff;
        }
        @media print {
          body { width: 80mm; margin: 0; padding: 4mm; }
          .no-print { display: none; }
        }
        .center { text-align: center; }
        .bold { font-weight: 700; }
        .header { border-bottom: 2px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
        .store-name { font-size: 20px; font-weight: 700; letter-spacing: 2px; }
        .store-tagline { font-size: 10px; margin-top: 2px; }
        .divider { border-top: 1px dashed #000; margin: 6px 0; }
        .divider-double { border-top: 2px dashed #000; margin: 6px 0; }
        .info-row { display: flex; justify-content: space-between; margin: 2px 0; }
        table { width: 100%; border-collapse: collapse; }
        .item-name { width: 45%; font-size: 11px; }
        .item-qty { width: 15%; text-align: center; }
        .item-price { width: 40%; text-align: right; }
        td { padding: 2px 0; vertical-align: top; }
        .total-section { margin-top: 6px; }
        .total-row { display: flex; justify-content: space-between; font-size: 11px; margin: 2px 0; }
        .grand-total { font-size: 14px; font-weight: 700; }
        .footer { text-align: center; margin-top: 10px; font-size: 10px; }
        .payment-badge {
          display: inline-block;
          border: 1px solid #000;
          padding: 2px 8px;
          font-size: 11px;
          font-weight: 700;
          margin: 4px 0;
        }
        .print-btn {
          display: block;
          width: 100%;
          padding: 10px;
          background: #5C3317;
          color: white;
          border: none;
          font-size: 14px;
          cursor: pointer;
          margin-top: 10px;
          font-family: inherit;
        }
      </style>
    </head>
    <body>
      <div class="header center">
        <div class="store-name">☕ TEMAN NGOPI</div>
        <div class="store-tagline">Selalu Ada, Selalu Hangat</div>
      </div>
      
      <div class="info-row"><span>Tanggal</span><span>${formatDateTime(transaction.createdAt)}</span></div>
      <div class="info-row"><span>Kasir</span><span>${cashierName}</span></div>
      <div class="info-row"><span>No. Struk</span><span>${transaction.invoiceNumber}</span></div>
      
      <div class="divider"></div>
      
      <table>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>
      
      <div class="divider-double"></div>
      
      <div class="total-section">
        <div class="total-row"><span>Subtotal</span><span>${formatRupiah(transaction.subtotal)}</span></div>
        ${transaction.discount > 0 ? `<div class="total-row"><span>Diskon</span><span>-${formatRupiah(transaction.discount)}</span></div>` : ''}
        ${transaction.tax > 0 ? `<div class="total-row"><span>Pajak</span><span>${formatRupiah(transaction.tax)}</span></div>` : ''}
        <div class="divider"></div>
        <div class="total-row grand-total"><span>TOTAL</span><span>${formatRupiah(transaction.total)}</span></div>
      </div>
      
      <div class="divider"></div>
      
      <div class="info-row">
        <span>Pembayaran</span>
        <span class="payment-badge">${transaction.paymentMethod === 'TUNAI' ? '💵 TUNAI' : '💳 NON TUNAI'}</span>
      </div>
      ${transaction.paymentMethod === 'TUNAI' ? `
        <div class="info-row"><span>Dibayar</span><span>${formatRupiah(transaction.amountPaid)}</span></div>
        <div class="info-row bold"><span>Kembalian</span><span>${formatRupiah(transaction.change)}</span></div>
      ` : ''}
      
      <div class="divider-double"></div>
      
      <div class="footer">
        <p>— Terima kasih telah berkunjung! —</p>
        <p>Semoga harimu secemerlang kopi kami ☕</p>
        <p style="margin-top:6px; font-size:9px;">Simpan struk ini sebagai bukti transaksi</p>
      </div>
      
      <button class="print-btn no-print" onclick="window.print(); window.close();">🖨️ Cetak Struk</button>
      
      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 500);
        };
      </script>
    </body>
    </html>
  `;
}

export function printReceipt(transaction, items, cashierName) {
  const html = generateReceiptHTML(transaction, items, cashierName);
  const win = window.open('', '_blank', 'width=400,height=700');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

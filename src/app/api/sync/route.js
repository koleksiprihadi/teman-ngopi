// src/app/api/sync/route.js
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── Helper: bersihkan field Dexie sebelum kirim ke Prisma ───
function cleanProduct(d) {
  const { serverId, id: _, ...rest } = d;
  return { ...rest, id: serverId || d.id };
}

function cleanTransaction(d) {
  const { serverId, items, cashierName, id: _, ...rest } = d;
  return {
    tx: {
      ...rest,
      id: serverId || d.id,
      cashBookId: rest.cashBookId || null,
      tax:      Number(rest.tax)      || 0,
      discount: Number(rest.discount) || 0,
      change:   Number(rest.change)   || 0,
    },
    items: (items || []).map(item => {
      const { id: itemLocalId, serverId: iSrv, transactionId: _tid, ...itemRest } = item;
      return {
        ...itemRest,
        id: iSrv || item.id || undefined,
        quantity: Number(itemRest.quantity) || 1,
        price:    Number(itemRest.price)    || 0,
        subtotal: Number(itemRest.subtotal) || 0,
      };
    }),
  };
}

function cleanCashBook(d) {
  const { serverId, id: _, ...rest } = d;
  return { ...rest, id: serverId || d.id };
}

function cleanExpense(d) {
  const { serverId, id: _, ...rest } = d;
  return { ...rest, id: serverId || d.id };
}

function cleanOpenBill(d) {
  const { serverId, items, id: _, ...rest } = d;
  return {
    bill: { ...rest, id: serverId || d.id },
    items: (items || []).map(item => {
      const { id: _id, serverId: _srv, openBillId: _oid, ...itemRest } = item;
      return {
        ...itemRest,
        id: _srv || item.id || undefined,
      };
    }),
  };
}

// ─── Main Handler ──────────────────────────────────────────────
export async function POST(request) {
  try {
    const { prisma } = await import('@/lib/prisma/client');
    const body = await request.json();

    // Support BOTH format:
    //  - syncManager: { entityType, entityId, action, payload }
    //  - legacy:      { entity, data }
    const entityType = body.entityType || body.entity;
    const action     = body.action     || 'UPSERT';
    const rawData    = body.payload    || body.data;

    if (!entityType || !rawData) {
      return NextResponse.json(
        { error: 'entityType dan payload wajib ada', received: Object.keys(body) },
        { status: 400 }
      );
    }

    let result;

    // ── PRODUCT ───────────────────────────────────────────────
    if (entityType === 'product') {
      if (action === 'DELETE') {
        result = await prisma.product.delete({ where: { id: rawData.id } }).catch(() => null);
      } else {
        const data = cleanProduct(rawData);
        result = await prisma.product.upsert({
          where: { id: data.id },
          create: data,
          update: {
            name:        data.name,
            description: data.description,
            price:       data.price,
            category:    data.category,
            imageUrl:    data.imageUrl,
            isAvailable: data.isAvailable,
            unit:        data.unit,
            cost:        data.cost,
            stock:       data.stock,
            updatedAt:   data.updatedAt ? new Date(data.updatedAt) : new Date(),
          },
        });
      }
    }

    // ── TRANSACTION ───────────────────────────────────────────
    else if (entityType === 'transaction') {
      const { tx, items } = cleanTransaction(rawData);

      if (action === 'DELETE') {
        result = await prisma.transaction.delete({ where: { id: tx.id } }).catch(() => null);
      } else {
        // Cek apakah cashier ada di DB
        const cashierExists = tx.cashierId
          ? await prisma.user.findUnique({ where: { id: tx.cashierId } })
          : null;

        if (!cashierExists) {
          return NextResponse.json(
            { error: `Kasir ID tidak ditemukan: ${tx.cashierId}` },
            { status: 422 }
          );
        }

        // Upsert transaction
        result = await prisma.transaction.upsert({
          where: { id: tx.id },
          create: {
            id:            tx.id,
            invoiceNumber: tx.invoiceNumber,
            cashierId:     tx.cashierId,
            cashBookId:    tx.cashBookId || null,
            subtotal:      Number(tx.subtotal)  || 0,
            tax:           Number(tx.tax)       || 0,
            discount:      Number(tx.discount)  || 0,
            total:         Number(tx.total)     || 0,
            paymentMethod: tx.paymentMethod     || 'TUNAI',
            amountPaid:    Number(tx.amountPaid) || 0,
            change:        Number(tx.change)    || 0,
            status:        tx.status            || 'COMPLETED',
            isGantung:     tx.isGantung         || false,
            notes:         tx.notes             || null,
            createdAt:     tx.createdAt ? new Date(tx.createdAt) : new Date(),
            items: {
              create: items.map(item => ({
                id:          item.id || undefined,
                productId:   item.productId,
                productName: item.productName || item.name || 'Produk',
                price:       Number(item.price)    || 0,
                quantity:    Number(item.quantity) || 1,
                subtotal:    Number(item.subtotal) || 0,
              })),
            },
          },
          update: {
            status:        tx.status    || 'COMPLETED',
            isGantung:     tx.isGantung || false,
            notes:         tx.notes     || null,
            cashBookId:    tx.cashBookId || null,
          },
        });
      }
    }

    // ── CASH_BOOK ─────────────────────────────────────────────
    else if (entityType === 'cash_book') {
      if (action === 'DELETE') {
        result = await prisma.cashBook.delete({ where: { id: rawData.id } }).catch(() => null);
      } else {
        const data = cleanCashBook(rawData);
        result = await prisma.cashBook.upsert({
          where: { id: data.id },
          create: {
            id:             data.id,
            date:           data.date ? new Date(data.date) : new Date(),
            ownerId:        data.ownerId,
            initialCapital: Number(data.initialCapital) || 0,
            totalCash:      Number(data.totalCash)      || 0,
            totalNonCash:   Number(data.totalNonCash)   || 0,
            totalExpenses:  Number(data.totalExpenses)  || 0,
            finalBalance:   Number(data.finalBalance)   || 0,
            cutOffTime:     data.cutOffTime             || '22:00',
            isClosed:       data.isClosed               || false,
            notes:          data.notes                  || null,
          },
          update: {
            totalCash:     Number(data.totalCash)     || 0,
            totalNonCash:  Number(data.totalNonCash)  || 0,
            totalExpenses: Number(data.totalExpenses) || 0,
            finalBalance:  Number(data.finalBalance)  || 0,
            isClosed:      data.isClosed              || false,
            closedAt:      data.closedAt ? new Date(data.closedAt) : null,
            notes:         data.notes                 || null,
          },
        });
      }
    }

    // ── EXPENSE ───────────────────────────────────────────────
    else if (entityType === 'expense') {
      if (action === 'DELETE') {
        result = await prisma.expense.delete({ where: { id: rawData.id } }).catch(() => null);
      } else {
        const data = cleanExpense(rawData);
        result = await prisma.expense.upsert({
          where: { id: data.id },
          create: {
            id:          data.id,
            cashBookId:  data.cashBookId,
            description: data.description,
            amount:      Number(data.amount)  || 0,
            category:    data.category        || 'Operasional',
            notes:       data.notes           || null,
            createdAt:   data.createdAt ? new Date(data.createdAt) : new Date(),
          },
          update: {
            description: data.description,
            amount:      Number(data.amount) || 0,
            category:    data.category       || 'Operasional',
            notes:       data.notes          || null,
          },
        });
      }
    }

    // ── OPEN_BILL ─────────────────────────────────────────────
    else if (entityType === 'open_bill') {
      if (action === 'DELETE') {
        result = await prisma.openBill.delete({ where: { id: rawData.id } }).catch(() => null);
      } else {
        const { bill, items } = cleanOpenBill(rawData);

        result = await prisma.openBill.upsert({
          where: { id: bill.id },
          create: {
            id:           bill.id,
            tableNumber:  bill.tableNumber  || null,
            customerName: bill.customerName || null,
            cashierId:    bill.cashierId,
            subtotal:     Number(bill.subtotal) || 0,
            total:        Number(bill.total)    || 0,
            notes:        bill.notes            || null,
            status:       bill.status           || 'OPEN',
            createdAt:    bill.createdAt ? new Date(bill.createdAt) : new Date(),
            items: {
              create: items.map(item => ({
                id:          item.id || undefined,
                productId:   item.productId,
                productName: item.productName || item.name || 'Produk',
                price:       Number(item.price)    || 0,
                quantity:    Number(item.quantity) || 1,
                subtotal:    Number(item.subtotal) || 0,
              })),
            },
          },
          update: {
            status:       bill.status           || 'OPEN',
            tableNumber:  bill.tableNumber      || null,
            customerName: bill.customerName     || null,
            notes:        bill.notes            || null,
          },
        });
      }
    }

    else {
      return NextResponse.json(
        { error: `Entity tidak dikenal: ${entityType}`, validEntities: ['product', 'transaction', 'cash_book', 'expense', 'open_bill'] },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error('[sync POST] error:', err);

    // Prisma unique constraint (misal invoiceNumber duplikat)
    if (err.code === 'P2002') {
      return NextResponse.json(
        { error: `Duplikasi data: ${err.meta?.target?.join(', ')}`, code: 'DUPLICATE' },
        { status: 409 }
      );
    }

    // Prisma foreign key tidak ada
    if (err.code === 'P2003') {
      return NextResponse.json(
        { error: `Relasi tidak ditemukan: ${err.meta?.field_name}`, code: 'FOREIGN_KEY' },
        { status: 422 }
      );
    }

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

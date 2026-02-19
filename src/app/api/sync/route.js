// src/app/api/sync/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function POST(request) {
  try {
    const { entityType, entityId, action, payload } = await request.json();

    if (!entityType || !entityId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    switch (entityType) {
      case 'product':
        await syncProduct(action, payload);
        break;
      case 'transaction':
        await syncTransaction(action, payload);
        break;
      case 'open_bill':
        await syncOpenBill(action, payload);
        break;
      case 'cash_book':
        await syncCashBook(action, payload);
        break;
      case 'expense':
        await syncExpense(action, payload);
        break;
      default:
        return NextResponse.json({ error: `Unknown entity type: ${entityType}` }, { status: 400 });
    }

    // Log sync
    await prisma.syncLog.create({
      data: {
        entityType,
        entityId,
        action,
        status: 'SYNCED',
        payload,
        syncedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, entityType, entityId });
  } catch (err) {
    console.error('Sync error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function syncProduct(action, payload) {
  if (action === 'CREATE') {
    await prisma.product.upsert({
      where: { id: payload.id },
      create: {
        id: payload.id,
        name: payload.name,
        description: payload.description,
        price: payload.price,
        category: payload.category,
        imageUrl: payload.imageUrl,
        isAvailable: payload.isAvailable ?? true,
        unit: payload.unit || 'pcs',
        cost: payload.cost || 0,
      },
      update: {
        name: payload.name,
        price: payload.price,
        category: payload.category,
        isAvailable: payload.isAvailable,
        cost: payload.cost || 0,
        updatedAt: new Date(),
      },
    });
  } else if (action === 'UPDATE') {
    await prisma.product.update({
      where: { id: payload.id },
      data: { ...payload, updatedAt: new Date() },
    });
  } else if (action === 'DELETE') {
    await prisma.product.delete({ where: { id: payload.id } }).catch(() => {});
  }
}

async function syncTransaction(action, payload) {
  if (action === 'CREATE') {
    const existing = await prisma.transaction.findUnique({ where: { id: payload.id } });
    if (existing) return;

    await prisma.transaction.create({
      data: {
        id: payload.id,
        invoiceNumber: payload.invoiceNumber,
        cashierId: payload.cashierId,
        cashBookId: payload.cashBookId,
        subtotal: payload.subtotal,
        tax: payload.tax || 0,
        discount: payload.discount || 0,
        total: payload.total,
        paymentMethod: payload.paymentMethod,
        amountPaid: payload.amountPaid,
        change: payload.change || 0,
        status: payload.status || 'COMPLETED',
        isGantung: payload.isGantung || false,
        notes: payload.notes,
        items: {
          create: (payload.items || []).map(item => ({
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.subtotal,
          })),
        },
      },
    });

    // Create accounting journal
    await prisma.accountingJournal.create({
      data: {
        transactionId: payload.id,
        date: new Date(payload.createdAt),
        description: `Penjualan - ${payload.invoiceNumber}`,
        debitAccount: payload.paymentMethod === 'TUNAI' ? 'Kas' : 'Bank',
        creditAccount: 'Pendapatan Penjualan',
        amount: payload.total,
      },
    });
  }
}

async function syncOpenBill(action, payload) {
  if (action === 'CREATE') {
    await prisma.openBill.upsert({
      where: { id: payload.id },
      create: {
        id: payload.id,
        tableNumber: payload.tableNumber,
        customerName: payload.customerName,
        cashierId: payload.cashierId,
        subtotal: payload.subtotal,
        total: payload.total,
        status: payload.status || 'OPEN',
        items: {
          create: (payload.items || []).map(item => ({
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.subtotal,
          })),
        },
      },
      update: { status: payload.status },
    });
  } else if (action === 'UPDATE') {
    await prisma.openBill.update({
      where: { id: payload.id },
      data: { status: payload.status, updatedAt: new Date() },
    });
  }
}

async function syncCashBook(action, payload) {
  if (action === 'CREATE') {
    await prisma.cashBook.upsert({
      where: { id: payload.id },
      create: {
        id: payload.id,
        date: new Date(payload.date),
        ownerId: payload.ownerId,
        initialCapital: payload.initialCapital,
        cutOffTime: payload.cutOffTime || '22:00',
        isClosed: false,
      },
      update: {
        initialCapital: payload.initialCapital,
        cutOffTime: payload.cutOffTime,
      },
    });
  } else if (action === 'UPDATE') {
    await prisma.cashBook.update({
      where: { id: payload.id },
      data: {
        totalCash: payload.totalCash,
        totalNonCash: payload.totalNonCash,
        totalExpenses: payload.totalExpenses,
        finalBalance: payload.finalBalance,
        isClosed: payload.isClosed,
        closedAt: payload.closedAt ? new Date(payload.closedAt) : null,
      },
    });
  }
}

async function syncExpense(action, payload) {
  if (action === 'CREATE') {
    await prisma.expense.upsert({
      where: { id: payload.id },
      create: {
        id: payload.id,
        cashBookId: payload.cashBookId,
        description: payload.description,
        amount: payload.amount,
        category: payload.category || 'Operasional',
        notes: payload.notes,
      },
      update: { amount: payload.amount, description: payload.description },
    });

    // Accounting journal
    await prisma.accountingJournal.create({
      data: {
        expenseId: payload.id,
        date: new Date(payload.createdAt),
        description: `Pengeluaran - ${payload.description}`,
        debitAccount: 'Beban ' + (payload.category || 'Operasional'),
        creditAccount: 'Kas',
        amount: payload.amount,
      },
    });
  }
}

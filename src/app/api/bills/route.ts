import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    const bills = await prisma.bill.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { customerName: { contains: search } },
              { customer: { name: { contains: search } } },
            ],
          } : {},
          fromDate ? { createdAt: { gte: new Date(fromDate) } } : {},
          toDate ? { createdAt: { lte: new Date(toDate) } } : {},
        ],
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(bills);
  } catch (error: any) {
    console.error('Error fetching bills:', error);
    return NextResponse.json({ error: 'Failed to fetch bills', message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerId,
      customerName,
      items, // array of { productId, quantity, price }
      discount,
      gst,
      total,
      finalAmount,
      paidAmount,
      status,
    } = body;

    // Use transaction to create bill and update stock
    const result = await prisma.$transaction(async (tx: any) => {
      // Create the bill
      const bill = await tx.bill.create({
        data: {
          customerId: customerId || null,
          customerName: customerName || null,
          total: parseFloat(total),
          discount: parseFloat(discount || 0),
          gst: parseFloat(gst || 0),
          finalAmount: parseFloat(finalAmount),
          paidAmount: parseFloat(paidAmount || 0),
          status: status || 'PAID',
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: parseInt(item.quantity),
              price: parseFloat(item.price),
            })),
          },
        },
      });

      // Update stock for each item
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              decrement: parseInt(item.quantity),
            },
          },
        });
      }

      // Update customer dues if it's a credit bill
      if (customerId && status !== 'PAID') {
        const pendingAmount = parseFloat(finalAmount) - parseFloat(paidAmount || 0);
        await tx.customer.update({
          where: { id: customerId },
          data: {
            dues: {
              increment: pendingAmount,
            },
          },
        });
      }

      return bill;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error creating bill:', error);
    return NextResponse.json({ error: 'Failed to create bill', message: error.message }, { status: 500 });
  }
}

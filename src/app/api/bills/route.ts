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

    // Always return an array
    return NextResponse.json(Array.isArray(bills) ? bills : []);
  } catch (error: any) {
    console.error('Error fetching bills:', error);
    // Return empty array on error
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields', details: 'At least one item is required' },
        { status: 400 }
      );
    }

    const {
      customerId,
      customerName,
      items,
      discount,
      gst,
      total,
      finalAmount,
      paidAmount,
      status,
    } = body;

    // Validate numeric fields
    const parsedTotal = parseFloat(total);
    const parsedDiscount = parseFloat(discount || 0);
    const parsedGst = parseFloat(gst || 0);
    const parsedFinalAmount = parseFloat(finalAmount);
    const parsedPaidAmount = parseFloat(paidAmount || 0);

    if ([parsedTotal, parsedDiscount, parsedGst, parsedFinalAmount, parsedPaidAmount].some(isNaN)) {
      return NextResponse.json(
        { error: 'Invalid data', details: 'All amounts must be valid numbers' },
        { status: 400 }
      );
    }

    if (parsedTotal < 0 || parsedFinalAmount < 0 || parsedPaidAmount < 0) {
      return NextResponse.json(
        { error: 'Invalid values', details: 'Amounts cannot be negative' },
        { status: 400 }
      );
    }

    // Validate items array
    for (const item of items) {
      if (!item.productId || !item.quantity || !item.price) {
        return NextResponse.json(
          { error: 'Invalid item data', details: 'Each item must have productId, quantity, and price' },
          { status: 400 }
        );
      }
      
      const qty = parseInt(item.quantity);
      const price = parseFloat(item.price);
      
      if (isNaN(qty) || isNaN(price) || qty <= 0 || price < 0) {
        return NextResponse.json(
          { error: 'Invalid item values', details: 'Quantity and price must be valid positive numbers' },
          { status: 400 }
        );
      }
    }

    // Use transaction to create bill and update stock
    const result = await prisma.$transaction(async (tx: any) => {
      // Create the bill
      const bill = await tx.bill.create({
        data: {
          customerId: customerId || null,
          customerName: customerName?.trim() || null,
          total: parsedTotal,
          discount: parsedDiscount,
          gst: parsedGst,
          finalAmount: parsedFinalAmount,
          paidAmount: parsedPaidAmount,
          status: status?.trim() || 'PAID',
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
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { quantity: true },
        });

        if (!product || product.quantity < parseInt(item.quantity)) {
          throw new Error(`Insufficient stock for product ${item.productId}`);
        }

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
        const pendingAmount = parsedFinalAmount - parsedPaidAmount;
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

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error creating bill:', error);
    
    // Check for specific error types
    if (error.message.includes('Insufficient stock')) {
      return NextResponse.json(
        { error: 'Stock Error', message: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create bill', message: error.message },
      { status: 500 }
    );
  }
}

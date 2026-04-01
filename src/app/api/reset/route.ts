import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { confirmReset } = body;

    if (!confirmReset) {
      return NextResponse.json(
        { error: 'Confirmation required' },
        { status: 400 }
      );
    }

    // Delete all data in correct order (due to foreign key constraints)
    await prisma.$transaction([
      // First delete bill items
      prisma.billItem.deleteMany({}),
      // Then delete bills
      prisma.bill.deleteMany({}),
      // Then delete customers
      prisma.customer.deleteMany({}),
      // Finally delete products
      prisma.product.deleteMany({}),
    ]);

    return NextResponse.json({ 
      success: true, 
      message: 'All data has been reset successfully' 
    });
  } catch (error: any) {
    console.error('Error resetting data:', error);
    return NextResponse.json(
      { error: 'Failed to reset data', message: error.message },
      { status: 500 }
    );
  }
}

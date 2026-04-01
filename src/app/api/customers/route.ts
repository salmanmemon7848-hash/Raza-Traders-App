import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const customers = await prisma.customer.findMany({
      where: search ? {
        OR: [
          { name: { contains: search } },
          { phone: { contains: search } },
        ],
      } : {},
      include: {
        bills: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Calculate total spent for each customer
    const enrichedCustomers = Array.isArray(customers) ? customers.map((customer: any) => {
      const totalSpent = Array.isArray(customer.bills) 
        ? customer.bills.reduce((acc: any, b: any) => acc + (b.finalAmount || 0), 0)
        : 0;
      return { ...customer, totalSpent };
    }) : [];

    // Always return an array
    return NextResponse.json(enrichedCustomers);
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    // Return empty array on error
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields', details: 'Customer name is required' },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        name: body.name.trim(),
        phone: body.phone?.trim() || null,
        address: body.address?.trim() || null,
      },
    });
    
    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer', message: error.message },
      { status: 500 }
    );
  }
}

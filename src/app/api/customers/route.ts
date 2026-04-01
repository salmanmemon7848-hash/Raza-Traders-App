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
    const enrichedCustomers = customers.map((customer: any) => {
      const totalSpent = customer.bills.reduce((acc: any, b: any) => acc + b.finalAmount, 0);
      return { ...customer, totalSpent };
    });

    return NextResponse.json(enrichedCustomers);
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers', message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const customer = await prisma.customer.create({
      data: {
        name: body.name,
        phone: body.phone || null,
        address: body.address || null,
      },
    });
    return NextResponse.json(customer);
  } catch (error: any) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: 'Failed to create customer', message: error.message }, { status: 500 });
  }
}

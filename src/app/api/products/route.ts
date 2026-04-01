import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company');
    const search = searchParams.get('search');

    const products = await prisma.product.findMany({
      where: {
        AND: [
          company ? { companyName: { contains: company } } : {},
          search ? {
            OR: [
              { name: { contains: search } },
              { companyName: { contains: search } },
              { modelNumber: { contains: search } },
            ],
          } : {},
        ],
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products', message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const product = await prisma.product.create({
      data: {
        name: body.name,
        companyName: body.companyName || 'General',
        modelNumber: body.modelNumber || null,
        purchasePrice: parseFloat(body.purchasePrice),
        sellingPrice: parseFloat(body.sellingPrice),
        quantity: parseInt(body.quantity),
      },
    });
    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product', message: error.message }, { status: 500 });
  }
}

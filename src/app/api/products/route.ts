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

    // Always return an array
    return NextResponse.json(Array.isArray(products) ? products : []);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    // Return empty array on error
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.companyName) {
      return NextResponse.json(
        { error: 'Missing required fields', details: 'Product name and company name are required' },
        { status: 400 }
      );
    }

    // Validate numeric fields
    const purchasePrice = parseFloat(body.purchasePrice);
    const sellingPrice = parseFloat(body.sellingPrice);
    const quantity = parseInt(body.quantity);

    if (isNaN(purchasePrice) || isNaN(sellingPrice) || isNaN(quantity)) {
      return NextResponse.json(
        { error: 'Invalid data', details: 'Prices and quantity must be valid numbers' },
        { status: 400 }
      );
    }

    if (purchasePrice < 0 || sellingPrice < 0 || quantity < 0) {
      return NextResponse.json(
        { error: 'Invalid values', details: 'Prices and quantity cannot be negative' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: body.name.trim(),
        companyName: body.companyName.trim() || 'General',
        modelNumber: body.modelNumber?.trim() || null,
        purchasePrice: purchasePrice,
        sellingPrice: sellingPrice,
        quantity: quantity,
      },
    });
    
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product', message: error.message },
      { status: 500 }
    );
  }
}

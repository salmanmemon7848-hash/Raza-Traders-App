import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Note: In a real app, you might want to restore stock when a bill is deleted.
    // For now, we'll just delete the bill and its items (handled by cascade in schema).
    await prisma.bill.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    console.error('Error deleting bill:', error);
    return NextResponse.json({ error: 'Failed to delete bill' }, { status: 500 });
  }
}

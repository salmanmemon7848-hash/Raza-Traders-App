import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';

export async function GET() {
  try {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    // Basic counts
    const totalProducts = await prisma.product.count();
    const lowStockItems = await prisma.product.findMany({
      where: { quantity: { lt: 5 } },
    });

    // Total stock value (at purchase price)
    const products = await prisma.product.findMany();
    const totalStockValue = products.reduce((acc: number, p: any) => acc + (p.purchasePrice * p.quantity), 0);

    // Sales data
    const allBills = await prisma.bill.findMany({
      include: { 
        items: { 
          include: { 
            product: true 
          } 
        } 
      },
    });

    const totalSales = allBills.reduce((acc: number, b: any) => acc + b.finalAmount, 0);
    const totalPendingAmount = allBills.reduce((acc: number, b: any) => acc + (b.finalAmount - b.paidAmount), 0);

    // Today's stats
    const todayBills = allBills.filter((b: any) => b.createdAt >= todayStart && b.createdAt <= todayEnd);
    const todaySales = todayBills.reduce((acc: number, b: any) => acc + b.finalAmount, 0);
    const todayBillCount = todayBills.length;

    // Monthly stats
    const monthBills = allBills.filter((b: any) => b.createdAt >= monthStart && b.createdAt <= monthEnd);
    const monthlySales = monthBills.reduce((acc: number, b: any) => acc + b.finalAmount, 0);

    // Profit calculation
    const totalProfit = allBills.reduce((acc: number, bill: any) => {
      const billProfit = bill.items.reduce((bAcc: number, item: any) => {
        const itemProfit = (item.price - (item.product?.purchasePrice || 0)) * item.quantity;
        return bAcc + itemProfit;
      }, 0);
      return acc + billProfit;
    }, 0);

    const todayProfit = todayBills.reduce((acc: number, bill: any) => {
      const billProfit = bill.items.reduce((bAcc: number, item: any) => {
        const itemProfit = (item.price - (item.product?.purchasePrice || 0)) * item.quantity;
        return bAcc + itemProfit;
      }, 0);
      return acc + billProfit;
    }, 0);

    return NextResponse.json({
      totalProducts,
      totalStockValue,
      totalSales,
      totalProfit,
      totalPendingAmount,
      todaySales,
      todayBillCount,
      todayProfit,
      monthlySales,
      lowStockItems,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch dashboard stats',
      message: error.message || 'Unknown error'
    }, { status: 500 });
  }
}

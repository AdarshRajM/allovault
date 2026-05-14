import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    return await prisma.$transaction(async (tx: any) => {
      const reservation = await tx.reservation.findUnique({
        where: { id },
      });

      if (!reservation) {
        return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
      }

      if (reservation.status !== 'PENDING') {
        return NextResponse.json({ error: 'Reservation is not pending' }, { status: 400 });
      }

      // Decrement reservedStock
      await tx.inventory.update({
        where: {
          productId_warehouseId: {
            productId: reservation.productId,
            warehouseId: reservation.warehouseId,
          },
        },
        data: {
          reservedStock: { decrement: reservation.quantity },
        },
      });

      const updated = await tx.reservation.update({
        where: { id },
        data: { status: 'RELEASED' },
      });

      return NextResponse.json(updated);
    });
  } catch (error) {
    console.error('Release error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

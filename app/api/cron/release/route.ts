import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const expiredReservations = await prisma.reservation.findMany({
      where: {
        status: 'PENDING',
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    for (const reservation of expiredReservations) {
      await prisma.$transaction(async (tx: any) => {
        // Re-check inside transaction
        const currentReservation = await tx.reservation.findUnique({
          where: { id: reservation.id },
        });

        if (currentReservation && currentReservation.status === 'PENDING' && currentReservation.expiresAt < new Date()) {
          // Decrement reserved stock
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

          // Mark as released
          await tx.reservation.update({
            where: { id: reservation.id },
            data: { status: 'RELEASED' },
          });
        }
      });
    }

    return NextResponse.json({ success: true, releasedCount: expiredReservations.length });
  } catch (error) {
    console.error('Cron release error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

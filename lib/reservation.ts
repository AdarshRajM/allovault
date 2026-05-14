import { prisma } from './prisma';

export async function reserveStock(productId: string, warehouseId: string, quantity: number) {
  // Use a transaction with row-level locking
  return await prisma.$transaction(async (tx) => {
    // 1. Lock the inventory row
    const inventory = await tx.inventory.findUnique({
      where: {
        productId_warehouseId: { productId, warehouseId }
      }
    });

    if (!inventory) {
      throw new Error('Inventory not found');
    }


    const available = inventory.totalStock - inventory.reservedStock;

    // 2. Check if enough stock is available
    if (available < quantity) {
      throw new Error('Out of stock');
    }

    // 3. Update reserved stock
    await tx.inventory.update({
      where: { id: inventory.id },
      data: {
        reservedStock: {
          increment: quantity,
        },
      },
    });

    // 4. Create the reservation
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    const reservation = await tx.reservation.create({
      data: {
        productId,
        warehouseId,
        quantity,
        status: 'PENDING',
        expiresAt,
      },
    });

    return reservation;
  });
}

export async function confirmReservation(reservationId: string) {
  return await prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) throw new Error('Reservation not found');
    if (reservation.status !== 'PENDING') throw new Error('Invalid reservation status');

    // 1. Update reservation status
    const updated = await tx.reservation.update({
      where: { id: reservationId },
      data: { status: 'CONFIRMED' },
    });

    // 2. Permanently deduct stock
    await tx.inventory.update({
      where: {
        productId_warehouseId: {
          productId: reservation.productId,
          warehouseId: reservation.warehouseId,
        },
      },
      data: {
        totalStock: { decrement: reservation.quantity },
        reservedStock: { decrement: reservation.quantity },
      },
    });

    return updated;
  });
}

export async function releaseReservation(reservationId: string) {
  return await prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) throw new Error('Reservation not found');
    if (reservation.status !== 'PENDING') throw new Error('Invalid reservation status');

    // 1. Update reservation status
    const updated = await tx.reservation.update({
      where: { id: reservationId },
      data: { status: 'EXPIRED' },
    });

    // 2. Release reserved stock
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

    return updated;
  });
}

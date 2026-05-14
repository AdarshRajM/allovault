import { NextResponse } from 'next/server';
import { createReservationSchema } from '@/lib/validations';
import { reserveStock } from '@/lib/reservation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = createReservationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { productId, warehouseId, quantity } = result.data;

    try {
      const reservation = await reserveStock(productId, warehouseId, quantity);
      return NextResponse.json(reservation);
    } catch (err: any) {
      if (err.message === 'Out of stock' || err.message === 'Inventory not found') {
        return NextResponse.json({ error: err.message }, { status: 409 });
      }
      throw err;
    }
  } catch (error) {
    console.error('Reservation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

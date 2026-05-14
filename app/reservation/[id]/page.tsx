import { prisma } from '@/lib/prisma';
import { ReservationTimer } from '@/components/ReservationTimer';
import { notFound } from 'next/navigation';

export default async function ReservationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { product: true }
  });

  if (!reservation) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 mt-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full flex-1 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
            <p className="text-muted-foreground">Complete your order for the reserved item.</p>
          </div>
          
          <div className="p-6 bg-muted/30 rounded-2xl border">
            <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
            <div className="flex justify-between py-3 border-b">
              <span className="text-muted-foreground">Item</span>
              <span className="font-medium">{reservation.product.name}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-muted-foreground">Quantity</span>
              <span className="font-medium">{reservation.quantity}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="font-semibold text-lg">Total</span>
              <span className="font-bold text-lg">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(reservation.product.price)}
              </span>
            </div>
          </div>
        </div>

        <div className="w-full flex-1">
          <ReservationTimer 
            reservationId={reservation.id} 
            expiresAt={reservation.expiresAt.toISOString()} 
          />
        </div>
      </div>
    </div>
  );
}

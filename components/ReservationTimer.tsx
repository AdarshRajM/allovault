'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Clock, CreditCard, X } from 'lucide-react';

export function ReservationTimer({ reservationId, expiresAt }: { reservationId: string, expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const end = new Date(expiresAt).getTime();
    
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      setTimeLeft(diff);
      
      if (diff === 0) {
        clearInterval(interval);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      const res = await fetch(`/api/reservations/${reservationId}/confirm`, { method: 'POST' });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to confirm order');
      }
      
      toast.success('Order placed successfully!');
      router.push(`/success?orderId=${reservationId}`);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Error processing order');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsProcessing(true);
      await fetch(`/api/reservations/${reservationId}/release`, { method: 'POST' });
      toast.info('Reservation cancelled');
      router.push('/');
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to cancel reservation');
    } finally {
      setIsProcessing(false);
    }
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="flex flex-col gap-6 p-8 border rounded-2xl bg-card shadow-sm">
      <div className="flex flex-col items-center text-center space-y-2">
        <Clock className="h-8 w-8 text-primary/80 mb-2" />
        <h2 className="text-xl font-bold">Time remaining to checkout</h2>
        <p className="text-sm text-muted-foreground">We've locked this item in for you. Complete your order before the timer runs out.</p>
      </div>
      
      <div className="text-5xl font-mono text-center tracking-tighter text-primary">
        {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
      </div>

      {timeLeft > 0 ? (
        <div className="flex flex-col sm:flex-row gap-4 w-full pt-4">
          <Button variant="outline" onClick={handleCancel} disabled={isProcessing} className="flex-1">
            <X className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isProcessing} className="flex-1">
            <CreditCard className="mr-2 h-4 w-4" /> {isProcessing ? 'Processing...' : 'Confirm & Pay'}
          </Button>
        </div>
      ) : (
        <div className="text-destructive font-medium text-center pt-4">
          Reservation Expired. The item has been released back to stock.
        </div>
      )}
    </div>
  );
}

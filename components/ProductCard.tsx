'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  price: number;
  inventories: { warehouseId: string; totalStock: number; reservedStock: number }[];
}

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  
  // Calculate total available stock across warehouses
  const availableStock = product.inventories.reduce((acc, inv) => acc + (inv.totalStock - inv.reservedStock), 0);
  // Just use the first warehouse for demo
  const warehouseId = product.inventories[0]?.warehouseId;

  const handleReserve = async () => {
    if (!warehouseId || availableStock <= 0) return;
    
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          warehouseId,
          quantity: 1
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to place reservation');
      }
      
      const data = await res.json();
      if (data.id) {
        toast.success('Item added to cart!');
        router.push(`/reservation/${data.id}`);
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'An error occurred during reservation');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{product.name}</CardTitle>
          <Badge variant={availableStock > 0 ? "default" : "destructive"}>
            {availableStock > 0 ? `${availableStock} in stock` : 'Out of stock'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">
          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.price)}
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleReserve} disabled={availableStock <= 0} className="w-full">
          Reserve 1 Item
        </Button>
      </CardFooter>
    </Card>
  );
}

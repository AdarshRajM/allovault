import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import { Package } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const products = await prisma.product.findMany({
    include: {
      inventories: true
    }
  });

  return (
    <div className="flex flex-col gap-12 pb-12 -mt-8">
      <section className="py-20 bg-gradient-to-b from-primary/10 to-background rounded-b-3xl">
        <div className="container px-4 md:px-6 text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Premium Inventory System
          </h1>
          <p className="mx-auto max-w-[700px] text-lg text-muted-foreground">
            Lock in your items securely. High-demand products reserved just for you.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Our Products</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p: any) => (
            <ProductCard key={p.id} product={p as any} />
          ))}
        </div>
      </section>
    </div>
  );
}

import { CheckCircle2, Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-12 px-4">
      <div className="w-full max-w-md p-8 text-center space-y-6 bg-card rounded-2xl border shadow-sm">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute -inset-1 bg-green-500/20 rounded-full blur-lg animate-pulse" />
            <CheckCircle2 className="relative h-20 w-20 text-green-500" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Order Confirmed!</h1>
          <p className="text-muted-foreground text-lg">
            Your item has been successfully reserved and your order is being processed.
          </p>
        </div>

        <div className="p-4 bg-muted/30 rounded-xl border border-dashed flex items-center justify-center gap-3">
          <Package className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Order status: Preparing for shipment</span>
        </div>

        <div className="pt-6">
          <Link href="/">
            <Button size="lg" className="w-full rounded-xl">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

import { prisma } from './prisma'

export async function getAvailableStock(productId: string, warehouseId: string) {
  const inventory = await prisma.inventory.findUnique({
    where: {
      productId_warehouseId: {
        productId,
        warehouseId,
      }
    }
  })
  
  if (!inventory) return 0;
  return inventory.totalStock - inventory.reservedStock;
}

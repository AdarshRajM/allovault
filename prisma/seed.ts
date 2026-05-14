import "dotenv/config";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const warehouse = await prisma.warehouse.create({
    data: {
      name: 'Main Warehouse'
    }
  })

  const products = [
    { name: 'OnePlus 10 Pro', price: 66999 },
    { name: 'Realme 16 Pro', price: 29999 },
    { name: 'Samsung Galaxy S24 Ultra', price: 129999 },
    { name: 'iPhone 15 Pro Max', price: 159900 },
    { name: 'Google Pixel 8 Pro', price: 106999 },
    { name: 'Redmi Note 13 Pro+', price: 31999 }
  ];

  for (const p of products) {
    const product = await prisma.product.create({
      data: { name: p.name, price: p.price }
    });

    await prisma.inventory.create({
      data: {
        productId: product.id,
        warehouseId: warehouse.id,
        totalStock: Math.floor(Math.random() * 10) + 2,
        reservedStock: 0
      }
    });
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

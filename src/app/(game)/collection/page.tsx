import { InventoryClient } from './inventory-client';

export const metadata = {
  title: 'Inventory - Barcode Adventure',
  description: 'Your collection of foods, decorations, products, and items gathered for Scan Chan.',
};

export default function InventoryPage() {
  return <InventoryClient />;
}

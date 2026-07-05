import dynamic from 'next/dynamic';
import { LoadingState } from '@/components/ui';

// ponytail: lazy load inventory client (24 KB), only loads on /collection route
const InventoryClient = dynamic(() => import('./inventory-client').then(mod => ({ default: mod.InventoryClient })), {
  loading: () => <LoadingState label="Loading collection..." />
});

export const metadata = {
  title: 'Inventory - Barcode Adventure',
  description: 'Your collection of foods, decorations, products, and items gathered for Scan Chan.',
};

export default function InventoryPage() {
  return <InventoryClient />;
}

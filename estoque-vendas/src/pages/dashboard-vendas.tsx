import Layout from './layout';
import OfflineStatusIndicator from '@/components/dashboard/OfflineStatusIndicator';

export default function SalesDashboard() {
  return (
    <Layout>
      <div className="p-4">
        {/* Status indicator displayed on the top-right corner */}
        <div className="flex justify-end mb-4">
          <OfflineStatusIndicator />
        </div>
        {/* Dashboard content goes here */}
      </div>
    </Layout>
  );
}


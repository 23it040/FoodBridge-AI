import { useEffect, useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';

const OfflinePage = () => {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return (
    <section className="py-8 max-w-2xl mx-auto">
      <PageHeader title="Offline Mode" subtitle="No Active Network Connection" />
      <Card>
        <EmptyState
          title="Network Connection Disconnected"
          description="Please check your internet connection or Wi-Fi settings to reconnect to FoodBridge AI."
          action={(
            <div className="flex items-center justify-center gap-3">
              <Button onClick={() => window.location.reload()}>Retry Connection</Button>
            </div>
          )}
        />
        {!online && <div className="mt-4 text-center text-xs font-semibold text-[#428475]">Detecting connection... Will update automatically when online.</div>}
      </Card>
    </section>
  );
};

export default OfflinePage;

import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';

const NotFoundPage = () => {
  const nav = useNavigate();
  return (
    <section className="py-8 max-w-2xl mx-auto">
      <PageHeader title="404 — Page Not Found" subtitle="The page you requested could not be located" />
      <Card>
        <EmptyState
          title="Lost in the eco-system?"
          description="The page you're looking for doesn't exist, may have been moved, or the link is broken."
          action={(
            <div className="flex items-center justify-center gap-3">
              <Button onClick={() => nav(-1)}>Go Back</Button>
              <Button variant="outline" onClick={() => nav('/')} className="bg-white text-[#428475] border-[#428475]">
                Return Home
              </Button>
            </div>
          )}
        />
      </Card>
    </section>
  );
};

export default NotFoundPage;

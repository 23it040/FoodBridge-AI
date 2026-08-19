import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';

const ForbiddenPage = () => {
  const nav = useNavigate();
  return (
    <section className="py-8 max-w-2xl mx-auto">
      <PageHeader title="403 — Access Forbidden" subtitle="Role Authorization Required" />
      <Card>
        <EmptyState
          title="Access Restricted"
          description="You don't have permission to access this area. Switch to a authorized role or return to dashboard."
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

export default ForbiddenPage;

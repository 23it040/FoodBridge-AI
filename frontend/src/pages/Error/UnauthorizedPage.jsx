import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';

const UnauthorizedPage = () => {
  const nav = useNavigate();
  return (
    <section className="py-8 max-w-2xl mx-auto">
      <PageHeader title="401 — Authentication Required" subtitle="Sign In Required" />
      <Card>
        <EmptyState
          title="Sign in to continue"
          description="You must be logged in to view this page. Please sign in to your FoodBridge AI account."
          action={(
            <div className="flex items-center justify-center gap-3">
              <Button onClick={() => nav('/auth/login')}>Sign In</Button>
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

export default UnauthorizedPage;

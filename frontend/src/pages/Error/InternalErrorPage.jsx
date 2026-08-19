import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import ErrorState from '../../components/ui/ErrorState';
import Button from '../../components/ui/Button';

const InternalErrorPage = ({ error }) => (
  <section className="py-8 max-w-2xl mx-auto">
    <PageHeader title="500 — Server Error" subtitle="Unexpected System Fault" />
    <Card>
      <ErrorState
        title="Something went wrong"
        description={error ? String(error?.message || error) : 'An unexpected error occurred on our server. Please try refreshing.'}
        action={(
          <div className="flex items-center justify-center gap-3">
            <Button onClick={() => window.location.reload()}>Retry Page</Button>
            <Button variant="outline" onClick={() => (window.location.href = '/')} className="bg-white text-[#428475] border-[#428475]">
              Return Home
            </Button>
          </div>
        )}
      />
    </Card>
  </section>
);

export default InternalErrorPage;

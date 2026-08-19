import Badge from '../ui/Badge';

const AIStatusBadge = ({ status }) => {
  if (!status) return <Badge variant="default">UNKNOWN</Badge>;

  switch (status.toUpperCase()) {
    case 'EXTERNAL_DATA_MODEL':
      return <Badge variant="default">EXTERNAL DATA MODEL</Badge>;
    case 'LIVE_RULE_BASED':
      return <Badge variant="success">LIVE RULE BASED</Badge>;
    case 'LIVE_ALGORITHMIC':
      return <Badge variant="success">LIVE ALGORITHMIC</Badge>;
    case 'INSUFFICIENT_DATA':
      return <Badge variant="warning">INSUFFICIENT DATA</Badge>;
    case 'MODEL_UNAVAILABLE':
      return <Badge variant="danger">UNAVAILABLE</Badge>;
    case 'FOODBRIDGE_PRODUCTION_MODEL':
      return <Badge variant="success">FOODBRIDGE MODEL</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
};

export default AIStatusBadge;

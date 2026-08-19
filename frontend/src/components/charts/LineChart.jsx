import { Line, LineChart as ReLineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const LineChart = ({ data = [], dataKey = 'value', nameKey = 'name', lineColor = '#0f766e', className = '' }) => (
  <div className={className}>
    <ResponsiveContainer width="100%" height={320}>
      <ReLineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey={nameKey} tick={{ fill: '#475569', fontSize: 12 }} />
        <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
        <Tooltip />
        <Line type="monotone" dataKey={dataKey} stroke={lineColor} strokeWidth={3} dot={{ r: 4 }} />
      </ReLineChart>
    </ResponsiveContainer>
  </div>
);

export default LineChart;

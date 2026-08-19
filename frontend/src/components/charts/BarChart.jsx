import { Bar, BarChart as ReBarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const BarChart = ({ data = [], dataKey = 'value', nameKey = 'name', barColor = '#0f766e', className = '' }) => (
  <div className={className}>
    <ResponsiveContainer width="100%" height={320}>
      <ReBarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey={nameKey} tick={{ fill: '#475569', fontSize: 12 }} />
        <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey={dataKey} fill={barColor} radius={[10, 10, 0, 0]} />
      </ReBarChart>
    </ResponsiveContainer>
  </div>
);

export default BarChart;

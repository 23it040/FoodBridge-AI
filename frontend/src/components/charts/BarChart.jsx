import { Bar, BarChart as ReBarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const BarChart = ({ data = [], dataKey = 'value', nameKey = 'name', barColor = '#BD715C', className = '' }) => (
  <div className={className}>
    <ResponsiveContainer width="100%" height={320}>
      <ReBarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E6DED6" />
        <XAxis dataKey={nameKey} tick={{ fill: '#626760', fontSize: 12 }} />
        <YAxis tick={{ fill: '#626760', fontSize: 12 }} />
        <Tooltip contentStyle={{ backgroundColor: '#FAF7F2', borderColor: '#E6DED6', borderRadius: '12px', color: '#292B29' }} />
        <Bar dataKey={dataKey} fill={barColor} radius={[10, 10, 0, 0]} />
      </ReBarChart>
    </ResponsiveContainer>
  </div>
);

export default BarChart;

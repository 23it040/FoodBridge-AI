import { Line, LineChart as ReLineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const LineChart = ({ data = [], dataKey = 'value', nameKey = 'name', lineColor = '#BD715C', className = '' }) => (
  <div className={className}>
    <ResponsiveContainer width="100%" height={320}>
      <ReLineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E6DED6" />
        <XAxis dataKey={nameKey} tick={{ fill: '#626760', fontSize: 12 }} />
        <YAxis tick={{ fill: '#626760', fontSize: 12 }} />
        <Tooltip contentStyle={{ backgroundColor: '#FAF7F2', borderColor: '#E6DED6', borderRadius: '12px', color: '#292B29' }} />
        <Line type="monotone" dataKey={dataKey} stroke={lineColor} strokeWidth={3} dot={{ r: 4, fill: lineColor }} />
      </ReLineChart>
    </ResponsiveContainer>
  </div>
);

export default LineChart;

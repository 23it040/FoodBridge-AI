import { Cell, Pie, PieChart as RePieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const PieChart = ({ data = [], colors = ['#BD715C', '#7D9588', '#79D6B2', '#E28E77', '#A85F4D'], className = '' }) => (
  <div className={className}>
    <ResponsiveContainer width="100%" height={320}>
      <RePieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="#FAF7F2" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: '#FAF7F2', borderColor: '#E6DED6', borderRadius: '12px', color: '#292B29' }} />
        <Legend />
      </RePieChart>
    </ResponsiveContainer>
  </div>
);

export default PieChart;

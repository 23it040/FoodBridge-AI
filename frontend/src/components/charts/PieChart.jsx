import { Cell, Pie, PieChart as RePieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const PieChart = ({ data = [], colors = ['#0f766e', '#1d4ed8', '#f59e0b', '#fb7185'], className = '' }) => (
  <div className={className}>
    <ResponsiveContainer width="100%" height={320}>
      <RePieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </RePieChart>
    </ResponsiveContainer>
  </div>
);

export default PieChart;

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { month: "Jan", gc: 245000, pp: 42000, b2c: 18500 },
  { month: "Fév", gc: 258000, pp: 45000, b2c: 21000 },
  { month: "Mar", gc: 267000, pp: 48500, b2c: 23500 },
  { month: "Avr", gc: 275000, pp: 52000, b2c: 25000 },
  { month: "Mai", gc: 289000, pp: 55500, b2c: 27500 },
  { month: "Juin", gc: 298000, pp: 58000, b2c: 29000 },
];

export function RevenueChart() {
  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold mb-4">Revenus récurrents par segment</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorGc" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(220, 55%, 35%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(220, 55%, 35%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(35, 85%, 50%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(35, 85%, 50%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorB2c" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(145, 45%, 35%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(145, 45%, 35%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 88%)" />
          <XAxis dataKey="month" stroke="hsl(25, 15%, 45%)" fontSize={12} />
          <YAxis
            stroke="hsl(25, 15%, 45%)"
            fontSize={12}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(40, 25%, 99%)",
              border: "1px solid hsl(35, 20%, 88%)",
              borderRadius: "0.75rem",
            }}
            formatter={(value: number) => [`${value.toLocaleString()}€`, ""]}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="gc"
            name="Grands Comptes"
            stroke="hsl(220, 55%, 35%)"
            fillOpacity={1}
            fill="url(#colorGc)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="pp"
            name="Plug & Play"
            stroke="hsl(35, 85%, 50%)"
            fillOpacity={1}
            fill="url(#colorPp)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="b2c"
            name="B2C"
            stroke="hsl(145, 45%, 35%)"
            fillOpacity={1}
            fill="url(#colorB2c)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}




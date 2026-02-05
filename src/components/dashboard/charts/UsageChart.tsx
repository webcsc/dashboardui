import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", tasses: 125000 },
  { month: "Fév", tasses: 132000 },
  { month: "Mar", tasses: 145000 },
  { month: "Avr", tasses: 152000 },
  { month: "Mai", tasses: 168000 },
  { month: "Juin", tasses: 178000 },
];

export function UsageChart() {
  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold mb-4">Tasses consommées (tous segments)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 88%)" />
          <XAxis dataKey="month" stroke="hsl(25, 15%, 45%)" fontSize={12} />
          <YAxis
            stroke="hsl(25, 15%, 45%)"
            fontSize={12}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(40, 25%, 99%)",
              border: "1px solid hsl(35, 20%, 88%)",
              borderRadius: "0.75rem",
            }}
            formatter={(value: number) => [`${value.toLocaleString()} tasses`, "Consommation"]}
          />
          <Bar
            dataKey="tasses"
            fill="hsl(25, 45%, 22%)"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}




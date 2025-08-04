"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface PieChartComponentProps {
    data: Array<{ name: string; value: number }>
    colors?: string[]
    title?: string
}

const DEFAULT_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export function PieChartComponent({ data, colors = DEFAULT_COLORS, title }: PieChartComponentProps) {
    if (!data || data.length === 0) {
        return <div className="flex items-center justify-center h-64 text-muted-foreground">No hay datos disponibles</div>
    }

    return (
        <div className="w-full h-64">
            {title && <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>}
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}

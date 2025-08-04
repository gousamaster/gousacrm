"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface BarChartComponentProps {
    data: Array<{ name: string; value: number }>
    color?: string
    title?: string
}

export function BarChartComponent({ data, color = "#8884d8", title }: BarChartComponentProps) {
    if (!data || data.length === 0) {
        return <div className="flex items-center justify-center h-64 text-muted-foreground">No hay datos disponibles</div>
    }

    return (
        <div className="w-full h-64">
            {title && <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>}
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill={color} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

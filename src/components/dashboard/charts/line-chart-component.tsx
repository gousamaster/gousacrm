"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface LineChartComponentProps {
    data: Array<{ name: string; tramites?: number; clientes?: number }>
    title?: string
}

export function LineChartComponent({ data, title }: LineChartComponentProps) {
    if (!data || data.length === 0) {
        return <div className="flex items-center justify-center h-64 text-muted-foreground">No hay datos disponibles</div>
    }

    return (
        <div className="w-full h-64">
            {title && <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>}
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {data.some((item) => item.tramites !== undefined) && (
                        <Line type="monotone" dataKey="tramites" stroke="#8884d8" strokeWidth={2} name="Trámites" />
                    )}
                    {data.some((item) => item.clientes !== undefined) && (
                        <Line type="monotone" dataKey="clientes" stroke="#82ca9d" strokeWidth={2} name="Clientes" />
                    )}
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

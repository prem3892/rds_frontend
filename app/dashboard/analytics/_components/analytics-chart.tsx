"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsBreakdown } from "@/types/analytics";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsChartProps {
  breakdown: AnalyticsBreakdown[] | undefined;
  isLoading: boolean;
}

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];

export default function AnalyticsChart({
  breakdown,
  isLoading,
}: AnalyticsChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics Breakdown by Source</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Skeleton className="h-full w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!breakdown || breakdown.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics Breakdown by Source</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = breakdown.map((item) => ({
    name: item.source.charAt(0).toUpperCase() + item.source.slice(1),
    chats: item.chats,
    appointments: item.appointments,
    conversionRate: parseFloat(item.conversionRate),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Breakdown by Source</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip
              formatter={(value, name) => {
                if (typeof value === "number") {
                  if (name === "chats" || name === "appointments") {
                    return [Math.round(value), name];
                  }
                  if (value < 1) {
                    return [value.toFixed(2) + "%", name];
                  }
                }
                return value;
              }}
              labelFormatter={(label) => `Source: ${label}`}
            />
            <Legend />
            <Bar dataKey="chats" fill="#3B82F6" name="Chats" />
            <Bar dataKey="appointments" fill="#10B981" name="Appointments" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

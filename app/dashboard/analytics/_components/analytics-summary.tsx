"use client";

import { AnalyticsSummary } from "@/types/analytics";
import { MessageCircle, Briefcase, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsSummaryProps {
  summary: AnalyticsSummary | undefined;
  isLoading: boolean;
}

export default function AnalyticsSummaryCards({
  summary,
  isLoading,
}: AnalyticsSummaryProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200"
          >
            <Skeleton className="h-8 w-8 rounded" />
            <div className="flex-1">
              <Skeleton className="h-3 w-20 mb-1" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const stats = [
    {
      title: "Total Chats",
      value: summary.totalChats.toString(),
      icon: MessageCircle,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Appointments",
      value: summary.totalAppointments.toString(),
      icon: Briefcase,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Conversion Rate",
      value: summary.conversionRate,
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="space-y-2">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <div className={`p-1.5 rounded ${stat.color} flex-shrink-0`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate">
                {stat.title}
              </p>
              <p className="text-sm font-bold leading-tight">{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

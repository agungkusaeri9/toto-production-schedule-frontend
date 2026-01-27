"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import ModelService from "@/services/ModelService";
import WorkCenterService from "@/services/WorkCenterService";
import PartService from "@/services/PartService";
import ScheduleService from "@/services/ScheduleService";
import ProductionTimelineService from "@/services/ProductionTimelineService";
import { BoxCubeIcon, DatabaseIcon, GridIcon, ListIcon } from "@/icons/index";
import Loading from "@/components/common/Loading";

// Dynamic import buat ApexCharts biar aman di Next (no SSR)
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type SummaryCardProps = {
    title: string;
    value: number | string;
    description?: string;
    icon: React.ReactNode;
    color: string;
};

function SummaryCard({ title, value, description, icon, color }: SummaryCardProps) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        {title}
                    </h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                        {value}
                    </p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color} text-white shadow-lg`}>
                    {icon}
                </div>
            </div>
            {description && (
                <p className="mt-4 text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                    {description}
                </p>
            )}
        </div>
    );
}

export default function Dashboard() {
    // ----- Fetch Counts -----
    const { data: modelsData, isLoading: loadingModels } = useQuery({
        queryKey: ["models-count"],
        queryFn: () => ModelService.getWithoutPagination(),
    });

    const { data: workCentersData, isLoading: loadingWC } = useQuery({
        queryKey: ["work-centers-count"],
        queryFn: () => WorkCenterService.getWithoutPagination(),
    });

    const { data: partsData, isLoading: loadingParts } = useQuery({
        queryKey: ["parts-count"],
        queryFn: () => PartService.getWithoutPagination(),
    });

    const { data: schedulesData, isLoading: loadingSchedules } = useQuery({
        queryKey: ["schedules-count"],
        queryFn: () => ScheduleService.getWithoutPagination(),
    });

    const { data: timelineData, isLoading: loadingTimeline } = useQuery({
        queryKey: ["timeline-data"],
        queryFn: () => ProductionTimelineService.get(),
    });

    // ----- Chart Calculations -----
    const quantityChartData = useMemo(() => {
        if (!timelineData?.data) return { categories: [], series: [] };

        const categories: string[] = [];
        const seriesData: number[] = [];

        timelineData.data.forEach((item) => {
            categories.push(item.modelName);
            const totalQty = item.scheduleDetails?.reduce((sum, detail) => sum + (detail.quantity || 0), 0) || 0;
            seriesData.push(totalQty);
        });

        return {
            categories,
            series: [{ name: "Total Quantity", data: seriesData }]
        };
    }, [timelineData]);

    const schedulesChartData = useMemo(() => {
        if (!timelineData?.data) return { labels: [], series: [] };

        const labels: string[] = [];
        const series: number[] = [];

        timelineData.data.forEach((item) => {
            labels.push(item.modelName);
            series.push(item.scheduleDetails?.length || 0);
        });

        return { labels, series };
    }, [timelineData]);

    const isLoading = loadingModels || loadingWC || loadingParts || loadingSchedules || loadingTimeline;

    if (isLoading) return <Loading />;

    const totalModels = modelsData?.data?.length || 0;
    const totalWC = workCentersData?.data?.length || 0;
    const totalParts = partsData?.data?.length || 0;
    const totalSchedules = schedulesData?.data?.length || 0;

    const barChartOptions: any = {
        chart: { type: "bar", toolbar: { show: false } },
        plotOptions: { bar: { borderRadius: 8, columnWidth: "50%", distributed: true } },
        colors: ["#3C50E0", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"],
        dataLabels: { enabled: false },
        legend: { show: false },
        xaxis: {
            categories: quantityChartData.categories,
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        grid: { borderColor: "#f1f1f1", strokeDashArray: 4 },
    };

    const pieChartOptions: any = {
        labels: schedulesChartData.labels,
        colors: ["#3C50E0", "#80CAEE", "#10B981", "#F59E0B", "#EF4444"],
        legend: { position: "bottom", horizontalAlign: "center" },
        plotOptions: { pie: { donut: { size: "65%" } } },
        stroke: { show: false },
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Production Overview</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Monitoring production metrics in real-time</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard
                    title="Total Models"
                    value={totalModels}
                    description="Registered production models"
                    icon={<BoxCubeIcon className="w-6 h-6" />}
                    color="bg-indigo-600"
                />
                <SummaryCard
                    title="Work Centers"
                    value={totalWC}
                    description="Active machines & stations"
                    icon={<GridIcon className="w-6 h-6" />}
                    color="bg-emerald-500"
                />
                <SummaryCard
                    title="Total Parts"
                    value={totalParts}
                    description="Stock keeping units"
                    icon={<DatabaseIcon className="w-6 h-6" />}
                    color="bg-amber-500"
                />
                <SummaryCard
                    title="Schedules"
                    value={totalSchedules}
                    description="Total production plans"
                    icon={<ListIcon className="w-6 h-6" />}
                    color="bg-rose-500"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar Chart */}
                <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <h3 className="mb-6 text-lg font-bold text-gray-900 dark:text-white">Production Quantity by Model</h3>
                    <ApexChart
                        options={barChartOptions}
                        series={quantityChartData.series}
                        type="bar"
                        height={350}
                    />
                </div>

                {/* Donut Chart */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <h3 className="mb-6 text-lg font-bold text-gray-900 dark:text-white">Schedule Distribution</h3>
                    <div className="flex justify-center">
                        <ApexChart
                            options={pieChartOptions}
                            series={schedulesChartData.series}
                            type="donut"
                            height={350}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

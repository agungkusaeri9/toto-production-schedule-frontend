"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamic import buat ApexCharts biar aman di Next (no SSR)
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type SummaryCardProps = {
    title: string;
    value: number | string;
    description?: string;
};

function SummaryCard({ title, value, description }: SummaryCardProps) {
    return (
        <div className="rounded-sm border border-stroke bg-white px-4 py-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">
                {title}
            </h3>
            <p className="mt-2 text-2xl font-semibold text-black dark:text-white">
                {value}
            </p>
            {description && (
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    {description}
                </p>
            )}
        </div>
    );
}

export default function Dashboard() {
    // ----- Dummy data, nanti bisa diganti dari API -----
    const totalScheduleProcessed = 24;
    const totalPart = 120;
    const totalPOProcessed = 56;
    const totalProcess = 87;

    // ----- Bar Chart: PO per Bulan -----
    const poPerMonthOptions: any = {
        chart: {
            type: "bar",
            toolbar: { show: false },
            height: 350,
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: "40%",
            },
        },
        dataLabels: {
            enabled: false,
        },
        xaxis: {
            categories: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ],
        },
        yaxis: {
            title: {
                text: "Total PO",
            },
        },
        tooltip: {
            y: {
                formatter: (val: number) => `${val} PO`,
            },
        },
    };

    const poPerMonthSeries = [
        {
            name: "PO Processed",
            data: [15231, 83425, 10234, 75345, 123452, 92352, 115234, 63425, 132342, 153324, 24359, 134254],
        },
    ];

    // ----- Pie Chart: PO per Part per Tahun -----
    const poPerPartOptions: any = {
        labels: [
            "Part Sensor Utama",
            "Modul Display Panel",
            "Konektor High Grade",
            "PCB Board Rev2",
            "Casing Industrial Metal",
        ],
        legend: {
            position: "bottom",
        },
        tooltip: {
            y: {
                formatter: (val: number) => `${val} PO`,
            },
        },
    };

    const poPerPartSeries = [25, 18, 15, 22, 20];

    return (

        <>
            <div className="grid grid-cols-12 gap-4 md:gap-6">
                {/* Summary Cards */}
                <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                    <SummaryCard
                        title="Schedule Processed"
                        value={totalScheduleProcessed}
                        description="Total schedule yang sudah diproses"
                    />
                    <SummaryCard
                        title="Total Parts"
                        value={totalPart}
                        description="Jumlah part terdaftar"
                    />
                    <SummaryCard
                        title="PO Processed"
                        value={totalPOProcessed}
                        description="Total PO yang sudah diproses"
                    />
                    <SummaryCard
                        title="Total Process"
                        value={totalProcess}
                        description="Jumlah proses berjalan"
                    />
                </div>

                {/* Charts */}
                <div className="col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Bar Chart: PO per Bulan */}
                    <div className="lg:col-span-2">
                        <div className="rounded-sm border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
                            <h2 className="mb-4 text-lg font-semibold text-black dark:text-white">
                                PO per Bulan (Tahun Berjalan)
                            </h2>
                            <ApexChart
                                options={poPerMonthOptions}
                                series={poPerMonthSeries}
                                type="bar"
                                height={350}
                            />
                        </div>
                    </div>

                    {/* Pie Chart: PO per Part per Tahun */}
                    <div>
                        <div className="rounded-sm border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
                            <h2 className="mb-4 text-lg font-semibold text-black dark:text-white">
                                PO per Part (Per Tahun)
                            </h2>
                            <ApexChart
                                options={poPerPartOptions}
                                series={poPerPartSeries}
                                type="pie"
                                height={350}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

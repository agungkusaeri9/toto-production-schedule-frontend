"use client";
import React, { Suspense, useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import DataTable from "@/components/common/DataTable";
import Loading from "@/components/common/Loading";
import { useFetchScheduleDetail } from "@/hooks/useFetchScheduleDetail";
import ScheduleDetailService from "@/services/ScheduleDetailService";
import ModelService from "@/services/ModelService";
import { ScheduleDetailItem } from "@/types/productionTimeline";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

function ScheduleDetailContent() {
    const [selectedModelId, setSelectedModelId] = useState<number>(0);

    const {
        data: scheduleDetails,
        isLoading,
        pagination,
        currentPage,
        limit,
        setCurrentPage,
        setLimit
    } = useFetchScheduleDetail(ScheduleDetailService.get, "schedule-details", selectedModelId);

    const { data: modelsResponse } = useQuery({
        queryKey: ["models-all"],
        queryFn: () => ModelService.getWithoutPagination(),
    });

    const columns = [
        {
            header: "Model Name",
            accessorKey: "modelName",
            cell: (item: ScheduleDetailItem) => item.schedule?.modelName || item.modelName,
        },
        {
            header: "Part Name",
            accessorKey: "partName",
        },
        {
            header: "Work Center",
            accessorKey: "workCenterName",
        },
        {
            header: "Quantity",
            accessorKey: "quantity",
            cell: (item: ScheduleDetailItem) => item.schedule?.quantity || "-",
        },
        {
            header: "Start Time",
            accessorKey: "startTime",
            cell: (item: ScheduleDetailItem) => item.startTime ? format(new Date(item.startTime), "d MMM yyyy HH:mm") : "-",
        },
        {
            header: "Finish Time",
            accessorKey: "finishTime",
            cell: (item: ScheduleDetailItem) => item.finishTime ? format(new Date(item.finishTime), "d MMM yyyy HH:mm") : "-",
        },
    ];

    return (
        <div>
            <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Schedule Details' }]} />
            <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Model</label>
                        <select
                            className="w-full md:w-64 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                            value={selectedModelId}
                            onChange={(e) => {
                                setSelectedModelId(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            <option value={0}>All Models</option>
                            {modelsResponse?.data?.map((model) => (
                                <option key={model.id} value={model.id}>
                                    {model.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <DataTable
                    title="Schedule Details"
                    columns={columns}
                    data={scheduleDetails || []}
                    isLoading={isLoading}
                    pagination={{
                        currentPage: currentPage,
                        totalPages: pagination ? Math.ceil(pagination.totalCount / pagination.pageSize) : 1,
                        totalItems: pagination?.totalCount || 0,
                        itemsPerPage: limit,
                        onPageChange: setCurrentPage,
                        onLimitChange: setLimit,
                    }}
                />
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<Loading />}>
            <ScheduleDetailContent />
        </Suspense>
    );
}

"use client";
import React from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { useParams } from "next/navigation";
import Loading from "@/components/common/Loading";
import { useQuery } from "@tanstack/react-query";
import ScheduleService from "@/services/ScheduleService";
import { formatNumber } from "@/utils/currencyFormat";
import { Schedule } from "@/types/schedule";

export default function ShowScheduleDetail() {
    const params = useParams();
    const scheduleId = Number(params?.id);

    const { data: schedule, isLoading } = useQuery<Schedule>({
        queryKey: ['schedule', scheduleId],
        queryFn: async () => {
            const response = await ScheduleService.getById(scheduleId!)
            return response.data;
        },
        enabled: !!scheduleId,
    });

    if (isLoading || !schedule) {
        return <Loading />;
    }

    return (
        <div>
            <Breadcrumb
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Schedules", href: "/schedules" },
                    { label: `Detail` },
                ]}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

                {/* LEFT */}
                <ComponentCard title="Schedule Information">
                    <div className="grid gap-4">

                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-600">Model Name</label>
                            <input
                                className="w-full border rounded px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 dark:border-gray-700"
                                value={schedule.modelName ?? "-"}
                                readOnly
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-600">Quantity</label>
                            <input
                                className="w-full border rounded px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 dark:border-gray-700"
                                value={formatNumber(schedule.quantity)}
                                readOnly
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-600">Created At</label>
                            <input
                                className="w-full border rounded px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 dark:border-gray-700"
                                value={schedule.createdAt ? new Date(schedule.createdAt).toLocaleString() : "-"}
                                readOnly
                            />
                        </div>
                    </div>
                </ComponentCard>
            </div>
        </div>
    );
}

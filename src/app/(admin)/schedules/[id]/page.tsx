"use client";
import React, { useEffect, useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import ComponentCard from "@/components/common/ComponentCard";
import parts from "@/data/part.json";
import customers from "@/data/customer.json";
import processes from "@/data/process.json";
import schedule from "@/data/schedule.json";
import { useParams } from "next/navigation";
import Loading from "@/components/common/Loading";
import ProcessListService from "@/services/ProcessListService";
import { useQuery } from "@tanstack/react-query";
import ScheduleService from "@/services/ScheduleService";
import { formatNumber } from "@/utils/currencyFormat";

type DetailProcessList = {
    id: number;
    partId: number;
    customerId: number;
    target: number;
    quantity: number;
    processIds: number[];
};

export default function ShowProcessMasterDetail() {
    const params = useParams();
    const scheduleId = Number(params?.id);

    const { data: schedule, isLoading } = useQuery({
        queryKey: ['schedule', scheduleId],
        queryFn: async () => {
            const response = await ScheduleService.getById(scheduleId!)
            return response.data;
        },
        enabled: !!scheduleId,
    });

    console.log({ schedule })

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

            <div className="grid grid-cols-[28%_1fr] items-start gap-6 mt-6">

                {/* LEFT */}
                <ComponentCard title="Schedule Information">
                    <div className="grid gap-4">

                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-600">Part</label>
                            <input
                                className="w-full border rounded px-2 py-1 text-sm bg-gray-100"
                                value={schedule.partName ?? "-"}
                                readOnly
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-600">Customer</label>
                            <input
                                className="w-full border rounded px-2 py-1 text-sm bg-gray-100"
                                value={schedule.customerName ?? "-"}
                                readOnly
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-600">Month</label>
                            <input
                                className="w-full border rounded px-2 py-1 text-sm bg-gray-100"
                                value={schedule.month}
                                readOnly
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-600">Year</label>
                            <input
                                className="w-full border rounded px-2 py-1 text-sm bg-gray-100"
                                value={schedule.year}
                                readOnly
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-600">Quantity</label>
                            <input
                                className="w-full border rounded px-2 py-1 text-sm bg-gray-100"
                                value={formatNumber(schedule.quantity)}
                                readOnly
                            />
                        </div>

                    </div>
                </ComponentCard>

                {/* RIGHT */}
                <ComponentCard title="Process List Detail">
                    <div className="space-y-4">
                        <table className="min-w-full border text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="border px-3 py-2 w-40">Step</th>
                                    <th className="border px-3 py-2">Process</th>
                                    <th className="border px-3 py-2">Process Type</th>
                                </tr>
                            </thead>

                            <tbody>
                                {schedule?.processLists?.map((detail: any, index: number) => {
                                    return (
                                        <tr key={detail.id}>
                                            <td className="border px-3 py-2">
                                                Step {detail.order}
                                            </td>

                                            <td className="border px-3 py-2">
                                                {detail.processName ?? "-"}
                                            </td>
                                            <td className="border px-3 py-2">
                                                {detail.processType ?? "-"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>

                        </table>
                    </div>
                </ComponentCard>
            </div>
        </div>
    );
}

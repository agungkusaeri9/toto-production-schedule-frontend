"use client";
import React, { useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import ComponentCard from "@/components/common/ComponentCard";
import ProcessListService from "@/services/ProcessListService";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/common/Loading";
import { useSearchParams } from "next/navigation";


export default function ShowProcessMasterDetail() {
    const searchParams = useSearchParams();
    const partId = Number(searchParams.get("partId"));
    const customerId = Number(searchParams.get("customerId"));

    const isValid = Number.isFinite(partId) && Number.isFinite(customerId);

    const { data: processList, isLoading } = useQuery({
        queryKey: ['process-list', partId, customerId],
        queryFn: async () => {
            const response = await ProcessListService.getByPartAndCustomer(partId!, customerId!)
            return response.data;
        },
        enabled: isValid,
    });

    if (isLoading || !processList) {
        return <Loading />;
    }

    return (
        <div>
            <Breadcrumb
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Process List Master", href: "/process-list-master" },
                    { label: "Detail" },
                ]}
            />

            <div className="grid grid-cols-[28%_1fr] items-start gap-6 mt-6">
                {/* LEFT: read-only info */}
                <ComponentCard title="Process List Information">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                        }}
                        className="space-y-4"
                    >
                        <div className="grid gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-600">Part</label>
                                <input
                                    className="w-full border rounded px-2 py-1 text-sm bg-gray-100"
                                    value={processList?.partName ?? "-"}
                                    readOnly
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-600">Customer</label>
                                <input
                                    className="w-full border rounded px-2 py-1 text-sm bg-gray-100"
                                    value={processList?.customerName ?? "-"}
                                    readOnly
                                />
                            </div>
                        </div>
                    </form>
                </ComponentCard>

                {/* RIGHT: detail steps (read-only) */}
                <ComponentCard title="Process List Detail">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-md font-semibold">Process Steps</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full border text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="border px-3 py-2 text-left w-40">Step</th>
                                        <th className="border px-3 py-2 text-left">Process</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {processList?.processLists.map((detail: any, index: number) => {
                                        return (
                                            <tr key={`${index}-process-${detail.id}`}>
                                                <td className="border px-3 py-2 align-top">
                                                    <div className="flex flex-col gap-1">
                                                        <input
                                                            className="w-full border rounded px-2 py-1 text-sm bg-gray-100"
                                                            value={`Step ${detail.order}`}
                                                            readOnly
                                                        />
                                                    </div>
                                                </td>
                                                <td className="border px-3 py-2 align-top">
                                                    <div className="flex flex-col gap-1">
                                                        <input
                                                            className="w-full border rounded px-2 py-1 text-sm bg-gray-100"
                                                            value={detail.processName ?? "-"}
                                                            readOnly
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {processList?.processLists.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={2}
                                                className="border px-3 py-4 text-center text-gray-500"
                                            >
                                                No process steps available.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </ComponentCard>
            </div>
        </div>
    );
}

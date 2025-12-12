"use client";
import React, { useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import ComponentCard from "@/components/common/ComponentCard";
import InputLabel from "@/components/form/FormInput";
import SelectLabel from "@/components/form/FormSelect";
import parts from "@/data/part.json";
import customers from "@/data/customer.json";
import processes from "@/data/process.json";

type DetailProcessList = {
    partId: string | number;
    customerId: string | number;
    processIds: (string | number)[];
};

export default function ShowProcessMasterDetail() {
    // contoh dummy detail, nanti tinggal ganti dari API/params
    const [detail] = useState<DetailProcessList>({
        partId: parts[0]?.id ?? "",
        customerId: customers[0]?.id ?? "",
        processIds: processes.slice(0, 3).map((p) => p.id), // contoh: 3 proses pertama
    });

    const selectedPart = parts.find((p) => p.id === detail.partId);
    const selectedCustomer = customers.find((c) => c.id === detail.customerId);

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
                                    value={selectedPart?.name ?? "-"}
                                    readOnly
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-600">Customer</label>
                                <input
                                    className="w-full border rounded px-2 py-1 text-sm bg-gray-100"
                                    value={selectedCustomer?.name ?? "-"}
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
                            {/* No Add Step button in detail page */}
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
                                    {detail.processIds.map((processId, index) => {
                                        const process = processes.find((p) => p.id === processId);

                                        return (
                                            <tr key={`${processId}-${index}`}>
                                                <td className="border px-3 py-2 align-top">
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-xs text-gray-600">
                                                            Step
                                                        </label>
                                                        <input
                                                            className="w-full border rounded px-2 py-1 text-sm bg-gray-100"
                                                            value={`Step ${index + 1}`}
                                                            readOnly
                                                        />
                                                    </div>
                                                </td>
                                                <td className="border px-3 py-2 align-top">
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-xs text-gray-600">
                                                            Process
                                                        </label>
                                                        <input
                                                            className="w-full border rounded px-2 py-1 text-sm bg-gray-100"
                                                            value={process?.name ?? "-"}
                                                            readOnly
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {detail.processIds.length === 0 && (
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

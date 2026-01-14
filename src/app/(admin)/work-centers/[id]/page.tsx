"use client";
import React from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { useParams } from "next/navigation";
import Loading from "@/components/common/Loading";
import { useFetchById } from "@/hooks/useFetchDetailData";
import WorkCenterService from "@/services/WorkCenterService";
import { WorkCenter } from "@/types/workCenter";

export default function WorkCenterDetail() {
    const params = useParams();
    const id = Number(params.id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: workCenter, isLoading } = useFetchById<WorkCenter>(
        WorkCenterService.getById,
        id,
        "work-center"
    );


    if (isLoading || !workCenter) {
        return <Loading />;
    }

    return (
        <div>
            <Breadcrumb
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Work Centers", href: "/work-centers" },
                    { label: "Detail" },
                ]}
            />
            <div className="space-y-6">
                <ComponentCard title="Work Center Detail">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Name</label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{workCenter.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Created At</label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                {workCenter.createdAt ? new Date(workCenter.createdAt).toLocaleString() : '-'}
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Process Components</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-[#00008B]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                            Part Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                            Operation Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                            WC Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                            WC Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                            Base Qty
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                            Setup
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                            Cycle Time
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {workCenter.processComponents?.length > 0 ? (
                                        workCenter.processComponents.map((component, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {component.partName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {component.operationNumber}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {component.workCenterName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {component.workCenterCategory}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {component.baseQuantity}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {component.setup}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {component.cycleTime}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                No components found.
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

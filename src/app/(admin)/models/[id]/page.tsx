"use client";
import Breadcrumb from "@/components/common/Breadcrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Loading from "@/components/common/Loading";
import { useFetchById } from "@/hooks/useFetchDetailData";
import ModelService from "@/services/ModelService";
import { Model } from "@/types/model";
import { useParams } from "next/navigation";
import React from "react";

export default function ModelDetailPage() {
    const params = useParams();
    const id = Number(params.id);

    const { data: model, isLoading } = useFetchById<Model>(
        ModelService.getById,
        id,
        "model"
    );

    if (isLoading || !model) {
        return <Loading />;
    }

    return (
        <div>
            <Breadcrumb
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Models", href: "/models" },
                    { label: "Detail" },
                ]}
            />
            <div className="space-y-6">
                <ComponentCard title="Model Detail">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {model.name}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Created Date
                            </p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {model.created ? model.created.split("T")[0] : "-"}
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Parts List
                        </h3>
                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-[#00008B]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                            Part Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                            Operator Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                            BOM
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                    {model.processDetails?.length > 0 ? (
                                        model.processDetails.map((detail, index) => (
                                            <tr key={index}>

                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {detail.partName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {detail.operationNumber}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {detail.bom}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                                            >
                                                No parts found.
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

"use client";
import React, { Suspense } from "react";
import ButtonLink from "@/components/ui/button/ButtonLink";
import Breadcrumb from "@/components/common/Breadcrumb";
import { confirmDelete } from "@/utils/confirm";
import Button from "@/components/ui/button/Button";
import DataTable from "@/components/common/DataTable";
import Loading from "@/components/common/Loading";
import toast from "react-hot-toast";
import { useFetchData } from "@/hooks/useFetchData";
import ProcessService from "@/services/ProcessService";
import { useDeleteData } from "@/hooks/useDeleteData";
// import processes from "@/data/process.json";


function ProcessListPage() {
    const { data: processes, isLoading } = useFetchData(ProcessService.getWithoutPagination, "processes");
    const { mutate: remove } = useDeleteData(
        ProcessService.remove,
        ["processes"]
    );
    const handleDelete = async (id: number) => {
        const confirmed = await confirmDelete();
        if (confirmed) {
            remove(id);
            toast.success("Process deleted successfully.");
        }
    };

    const columns = [
        {
            header: "Name",
            accessorKey: "name",
        },
        {
            header: "Type",
            accessorKey: "type",
            cell(item: { type: string }) {
                let bg = "bg-gray-100 text-gray-800";
                if (item.type === "INTERNAL") {
                    bg = "bg-green-100 text-green-800";
                } else if (item.type === "EXTERNAL") {
                    bg = "bg-blue-100 text-blue-800";
                }
                return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${bg}`}>{item.type || '-'}</span>;
            },
        },
        {
            header: "Action",
            accessorKey: "id",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (item: any) => (
                <div className="flex items-center gap-2">
                    <ButtonLink
                        href={`/processes/${item.id}/edit`}
                        variant='info'
                        size='xs'
                    >
                        Edit
                    </ButtonLink>
                    <Button
                        onClick={() => handleDelete(item.id!)}
                        variant='danger'
                        size='xs'
                    >
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    if (!processes && isLoading) {
        return <Loading />
    }

    return (
        <div>
            <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Process', href: '/processes' }]} />
            <div className="space-y-6">
                <div className="flex justify-end mb-4">
                    <ButtonLink size='xs' href="/processes/create">Create Process</ButtonLink>
                </div>
                <DataTable
                    title="Process List"
                    columns={columns}
                    data={processes || []}
                    isLoading={false}
                    pagination={{
                        currentPage: 1,
                        totalPages: 1,
                        totalItems: 20,
                        itemsPerPage: 10,
                        onPageChange: () => { },
                        onLimitChange: () => { },
                    }}
                    search={{
                        value: "",
                        onChange: () => { },
                        placeholder: "Search Process...",
                    }}
                />
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<Loading />}>
            <ProcessListPage />
        </Suspense>
    );
}

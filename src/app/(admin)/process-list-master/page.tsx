"use client";
import React, { Suspense } from "react";
import ButtonLink from "@/components/ui/button/ButtonLink";
import Breadcrumb from "@/components/common/Breadcrumb";
import DataTable from "@/components/common/DataTable";
import Loading from "@/components/common/Loading";
// import schedules from '@/data/schedule.json';
import Button from "@/components/ui/button/Button";
import { confirmDelete } from "@/utils/confirm";
import toast from "react-hot-toast";
import { useFetchData } from "@/hooks/useFetchData";
import ProcessListService from "@/services/ProcessListService";
import { useDeleteData } from "@/hooks/useDeleteData";
import { useMutation, useQueryClient } from "@tanstack/react-query";


function ProcessListmasterPage() {
    const { data: processLists, isLoading } = useFetchData(ProcessListService.getWithoutPagination, "process-lists");
    const queryClient = useQueryClient();
    const { mutate: remove } = useMutation({
        mutationKey: ["process-lists"],
        mutationFn: async ({ partId, customerId }: { partId: number; customerId: number }) => {
            const response = await ProcessListService.remove(partId, customerId);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["process-lists"] });
            toast.success("Process List deleted successfully.");
        },
        onError: () => {
            toast.error("Failed to delete process list.");
        },
    });
    const handleDelete = async (partId: number, customerId: number) => {
        const confirmed = await confirmDelete();
        if (confirmed) {
            remove({ partId, customerId });
        }
    };
    const columns = [
        {
            header: "Part Name",
            accessorKey: "partName",
        },
        {
            header: "Part Type",
            accessorKey: "partType",
        },
        {
            header: "Customer",
            accessorKey: "customerName",
            cell: (item: { customerName: string }) => item.customerName,
        },
        {
            header: "Action",
            accessorKey: "id",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (item: any) => (
                <div className="flex items-center gap-2">
                    <ButtonLink
                        href={`/process-list-master/detail?partId=${item.partId}&customerId=${item.customerId}`}
                        variant='warning'
                        size='xs'
                    >
                        Show
                    </ButtonLink>
                    <ButtonLink
                        href={`/process-list-master/${item.id}/edit`}
                        variant='info'
                        size='xs'
                    >
                        Edit
                    </ButtonLink>
                    <Button
                        onClick={() => handleDelete(item.partId!, item.customerId!)}
                        variant='danger'
                        size='xs'
                    >
                        Delete
                    </Button>
                </div >
            ),
        },
    ];

    if (isLoading || !processLists) {
        return <Loading />;
    }

    return (
        <div>
            <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Process List', href: '/process-list-master' }]} />
            <div className="space-y-6">
                <div className="flex justify-end mb-4">
                    <ButtonLink size='sm' href="/process-list-master/create">Create Process List</ButtonLink>
                </div>
                <DataTable
                    title="Master Process List"
                    columns={columns}
                    data={processLists || []}
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
                        placeholder: "Search schedule...",
                    }}
                />
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<Loading />}>
            <ProcessListmasterPage />
        </Suspense>
    );
}

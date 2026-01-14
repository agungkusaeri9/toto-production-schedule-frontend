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
import { useDeleteData } from "@/hooks/useDeleteData";
import WorkCenterService from "@/services/WorkCenterService";
import { WorkCenter } from "@/types/workCenter";

function WorkCenterListContent() {

    const { data: workCenters, isLoading } = useFetchData(WorkCenterService.getWithoutPagination, "work-centers");
    const { mutate: remove } = useDeleteData(WorkCenterService.remove, ["work-centers"]);

    const handleDelete = async (id: number) => {
        const confirmed = await confirmDelete();
        if (confirmed) {
            remove(id);
            toast.success("Work Center deleted successfully.");
        }
    };

    const columns = [
        {
            header: "Name",
            accessorKey: "name",
        },
        {
            header: "Created At",
            accessorKey: "createdAt",
            cell: (item: WorkCenter) => item.createdAt ? new Date(item.createdAt).toLocaleString() : '-',
        },
        {
            header: "Action",
            accessorKey: "id",
            cell: (item: WorkCenter) => (
                <div className="flex items-center gap-2">
                    <ButtonLink
                        href={`/work-centers/${item.id}`}
                        variant='warning'
                        size='xs'
                    >
                        Detail
                    </ButtonLink>
                    <ButtonLink
                        href={`/work-centers/${item.id}/edit`}
                        variant='info'
                        size='xs'
                    >
                        Edit
                    </ButtonLink>
                    <Button
                        onClick={() => handleDelete(item.id)}
                        variant='danger'
                        size='xs'
                    >
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    if (!workCenters && isLoading) {
        return <Loading />
    }

    return (
        <div>
            <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Work Centers', href: '/work-centers' }]} />
            <div className="space-y-6">
                <div className="flex justify-end mb-4">
                    <ButtonLink size='xs' href="/work-centers/create">Create Work Center</ButtonLink>
                </div>
                <DataTable
                    title="Work Center List"
                    columns={columns}
                    data={workCenters || []}
                    isLoading={false}
                    pagination={{
                        currentPage: 1,
                        totalPages: 1,
                        totalItems: workCenters?.length || 0,
                        itemsPerPage: 10,
                        onPageChange: () => { },
                        onLimitChange: () => { },
                    }}
                    search={{
                        value: "",
                        onChange: () => { },
                        placeholder: "Search Work Center...",
                    }}
                />
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<Loading />}>
            <WorkCenterListContent />
        </Suspense>
    );
}

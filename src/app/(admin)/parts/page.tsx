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
import PartService from "@/services/PartService";
import { useDeleteData } from "@/hooks/useDeleteData";


function OperatorListContent() {
    const { data: parts, isLoading } = useFetchData(PartService.getWithoutPagination, "parts");
    const { mutate: remove } = useDeleteData(PartService.remove, ["parts"]);
    const handleDelete = async (id: number) => {
        const confirmed = await confirmDelete();
        if (confirmed) {
            remove(id);
            toast.success("Part deleted successfully.");
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
        },
        {
            header: "Customer",
            accessorKey: "customer.name",
            cell(item: { customer: { name: string } }) {
                return item.customer?.name || '-';
            },
        },
        {
            header: "Action",
            accessorKey: "id",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (item: any) => (
                <div className="flex items-center gap-2">
                    <ButtonLink
                        href={`/parts/${item.id}/edit`}
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

    if (!parts && isLoading) {
        return <Loading />
    }


    return (
        <div>
            <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Parts', href: '/parts' }]} />
            <div className="space-y-6">
                <div className="flex justify-end mb-4">
                    <ButtonLink size='xs' href="/parts/create">Create Part</ButtonLink>
                </div>
                <DataTable
                    title="Parts List"
                    columns={columns}
                    data={parts || []}
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
                        placeholder: "Search Parts...",
                    }}
                />
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<Loading />}>
            <OperatorListContent />
        </Suspense>
    );
}

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
import ModelService from "@/services/ModelService";
import { Model } from "@/types/model";

function ModelListContent() {

    const { data: models, isLoading } = useFetchData(ModelService.getWithoutPagination, "models");
    const { mutate: remove } = useDeleteData(ModelService.remove, ["models"]);

    const handleDelete = async (id: number) => {
        const confirmed = await confirmDelete();
        if (confirmed) {
            remove(id);
            toast.success("Model deleted successfully.");
        }
    };

    const columns = [
        {
            header: "Name",
            accessorKey: "name",
        },
        {
            header: "Created",
            accessorKey: "created",
            cell: (item: Model) => item.created ? item.created.split('T')[0] : '-',
        },
        {
            header: "Action",
            accessorKey: "id",
            cell: (item: Model) => (
                <div className="flex items-center gap-2">
                    <ButtonLink
                        href={`/models/${item.id}`}
                        variant='warning'
                        size='xs'
                    >
                        Detail
                    </ButtonLink>
                    <ButtonLink
                        href={`/models/${item.id}/edit`}
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

    if (!models && isLoading) {
        return <Loading />
    }

    return (
        <div>
            <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Models', href: '/models' }]} />
            <div className="space-y-6">
                <div className="flex justify-end mb-4">
                    <ButtonLink size='xs' href="/models/create">Create Model</ButtonLink>
                </div>
                <DataTable
                    title="Model List"
                    columns={columns}
                    data={models || []}
                    isLoading={false}
                    pagination={{
                        currentPage: 1,
                        totalPages: 1,
                        totalItems: models?.length || 0,
                        itemsPerPage: 10,
                        onPageChange: () => { },
                        onLimitChange: () => { },
                    }}
                    search={{
                        value: "",
                        onChange: () => { },
                        placeholder: "Search Model...",
                    }}
                />
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<Loading />}>
            <ModelListContent />
        </Suspense>
    );
}

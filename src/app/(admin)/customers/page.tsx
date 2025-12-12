"use client";
import React, { Suspense } from "react";
import ButtonLink from "@/components/ui/button/ButtonLink";
import Breadcrumb from "@/components/common/Breadcrumb";
import { confirmDelete } from "@/utils/confirm";
import Button from "@/components/ui/button/Button";
import DataTable from "@/components/common/DataTable";
import Loading from "@/components/common/Loading";
// import Customers from '@/data/customer.json';
import toast from "react-hot-toast";
import { useFetchData } from "@/hooks/useFetchData";
import CustomerService from "@/services/CustomerService";
import { useDeleteData } from "@/hooks/useDeleteData";


function OperatorListContent() {

    const { data: customers, isLoading } = useFetchData(CustomerService.getWithoutPagination, "customers");
    const { mutate: remove } = useDeleteData(CustomerService.remove, ["customers"]);
    const handleDelete = async (id: number) => {
        const confirmed = await confirmDelete();
        if (confirmed) {
            remove(id);
            toast.success("Customer deleted successfully.");
        }
    };

    const columns = [
        {
            header: "Name",
            accessorKey: "name",
        },
        {
            header: "Action",
            accessorKey: "id",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (item: any) => (
                <div className="flex items-center gap-2">
                    <ButtonLink
                        href={`/customers/${item.id}/edit`}
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

    if (!customers && isLoading) {
        return <Loading />
    }


    return (
        <div>
            <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Customers', href: '/customers' }]} />
            <div className="space-y-6">
                <div className="flex justify-end mb-4">
                    <ButtonLink size='xs' href="/customers/create">Create Customer</ButtonLink>
                </div>
                <DataTable
                    title="Customer List"
                    columns={columns}
                    data={customers || []}
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
                        placeholder: "Search Customer...",
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

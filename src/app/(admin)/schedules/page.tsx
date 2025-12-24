"use client";
import React, { Suspense } from "react";
import ButtonLink from "@/components/ui/button/ButtonLink";
import Breadcrumb from "@/components/common/Breadcrumb";
import DataTable from "@/components/common/DataTable";
import Loading from "@/components/common/Loading";
import { dateFormat } from "@/utils/dateFormat";
import Button from "@/components/ui/button/Button";
import { confirmDelete } from "@/utils/confirm";
import toast from "react-hot-toast";
import { numberFormat } from "@/utils/numberFormat";
import { useFetchData } from "@/hooks/useFetchData";
import ScheduleService from "@/services/ScheduleService";
import { useDeleteData } from "@/hooks/useDeleteData";


function OperatorListContent() {
    const { data: schedules } = useFetchData(ScheduleService.get, "schedules");
    const { mutate: deleteSchedule, isPending } = useDeleteData(ScheduleService.remove, ["schedules"]);
    const handleDelete = (id: number) => deleteSchedule(id, {
        onSuccess: () => {
            toast.success("Schedule deleted successfully.");
        }
    });
    const columns = [
        {
            header: "#",
            accessorKey: "id",
            cell: (item: { id: number }) => item.id,
        },
        {
            header: "Part",
            accessorKey: "part.name",
            cell: (item: { part: any }) => item?.part?.name || '-',
        },
        {
            header: "Customer",
            accessorKey: "customer.name",
            cell: (item: { customer: any }) => item?.customer?.name || '-',
        },
        {
            header: "Month",
            accessorKey: "month",
            cell: (item: { month: any }) => item?.month || '-',
        },
        {
            header: "Year",
            accessorKey: "year",
            cell: (item: { year: any }) => item?.year || '-',
        },
        {
            header: "Quantity",
            accessorKey: "quantity",
            cell: (item: { quantity: number }) => numberFormat(item.quantity) || '-',
        },
        {
            header: "Action",
            accessorKey: "id",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cell: (item: any) => (
                <div className="flex items-center gap-2">
                    <ButtonLink
                        href={`/schedules/${item.id}`}
                        variant='warning'
                        size='xs'
                    >
                        Show
                    </ButtonLink>
                    {/* <ButtonLink
                        href={`/schedules/${item.id}/edit`}
                        variant='info'
                        size='xs'
                    >
                        Edit
                    </ButtonLink> */}
                    <Button
                        onClick={() => handleDelete(item.id)}
                        variant='danger'
                        size='xs'
                        disabled={isPending}
                        loading={isPending}
                    >
                        Delete
                    </Button>
                </div >
            ),
        },
    ];

    if (!schedules) {
        return <Loading />;
    }

    return (
        <div>
            <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Schedules', href: '/schedules' }]} />
            <div className="space-y-6">
                <div className="flex justify-end mb-4">
                    <ButtonLink size='sm' href="/schedules/create">Create Schedule</ButtonLink>
                </div>
                <DataTable
                    title="Schedules"
                    columns={columns}
                    data={schedules || []}
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
            <OperatorListContent />
        </Suspense>
    );
}

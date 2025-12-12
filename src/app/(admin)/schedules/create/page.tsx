"use client";
import React, { useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import ComponentCard from "@/components/common/ComponentCard";
import scheduleData from "@/data/schedule-detail.json";
import toast from "react-hot-toast";
import InputLabel from "@/components/form/FormInput";
import SelectLabel from "@/components/form/FormSelect";
import Button from "@/components/ui/button/Button";
import processes from "@/data/process.json";
import { useCreateData } from "@/hooks/useCreateData";
import ScheduleService from "@/services/ScheduleService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DatePicker from "@/components/form/datePicker";
import { useFetchData } from "@/hooks/useFetchData";
import PartService from "@/services/PartService";
import CustomerService from "@/services/CustomerService";
import FormSelect2 from "@/components/form/FormSelect2";
import Loading from "@/components/common/Loading";
import { Loader2 } from "lucide-react";
import monthData from "@/data/month.json";
import yearData from "@/data/year.json";

type Step = {
    id: number;
    processId: string;
};

export default function CreateProduct() {

    const { data: parts } = useFetchData(PartService.getWithoutPagination, "parts");

    const { mutate: createSchedule, isPending } = useCreateData(ScheduleService.create, ["schedules"], "/schedules");

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        control,
        formState: { errors },
        reset
    } = useForm<any>({
        mode: "onChange",
    });

    const onSubmit = (data: any) => {
        console.log("Raw form data:", data);
        console.log("Month:", data.month);
        console.log("Year:", data.year);

        const payload = {
            ...data,
            partId: data.partId?.value || null,
            month: data.month?.value || null,
            year: data.year?.value || null,
        }
        createSchedule(payload, {
            onSuccess: () => {
                toast.success("Schedule created successfully.");
                reset();
            }
        });
    };

    return (
        <div>
            <Breadcrumb
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Schedule", href: "/schedules" },
                    { label: "Create" },
                ]}
            />
            <div className="space-y-6">
                <ComponentCard title="Schedule Create">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <h3 className="text-lg font-semibold mb-6">
                            Schedule Form
                        </h3>
                        <div className="grid grid-cols-1">
                            {parts ? (
                                <FormSelect2
                                    label="Part"
                                    name="partId"
                                    control={control}
                                    options={parts?.map((d: any) => ({
                                        label: d.name + "(" + d.type + ")" + " - " + d.customer?.name,
                                        value: d.id || 0,
                                    }))}
                                    error={errors.partId?.message as string || undefined}
                                    placeholder="Select Part"
                                />
                            ) :
                                <div className="flex items-center">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <p>Loading parts...</p>
                                </div>}
                            {monthData ? (
                                <FormSelect2
                                    label="Month"
                                    name="month"
                                    control={control}
                                    options={monthData?.map((d: any) => ({
                                        label: d.name,
                                        value: d.number,
                                    }))}
                                    error={errors.month?.message as string || undefined}
                                    placeholder="Select Month"
                                />
                            ) :
                                <div className="flex items-center">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <p>Loading months...</p>
                                </div>}
                            {yearData ? (
                                <FormSelect2
                                    label="Year"
                                    name="year"
                                    control={control}
                                    options={yearData?.map((d: any) => ({
                                        label: d.name,
                                        value: d.number,
                                    }))}
                                    error={errors.year?.message as string || undefined}
                                    placeholder="Select Year"
                                />
                            ) :
                                <div className="flex items-center">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <p>Loading years...</p>
                                </div>}

                            <InputLabel
                                label="Qty"
                                name="quantity"
                                type="number"
                                required
                                placeholder="Enter Qty"
                                register={register("quantity", { valueAsNumber: true })}
                                error={errors.qty as any}
                            />

                            <Button
                                className="w-full mt-4"
                                type="submit"
                                variant="primary"
                                size="sm"
                                disabled={isPending}
                                loading={isPending}
                            >
                                Submit
                            </Button>
                        </div>
                    </form>
                </ComponentCard>
            </div>
        </div>
    );
}

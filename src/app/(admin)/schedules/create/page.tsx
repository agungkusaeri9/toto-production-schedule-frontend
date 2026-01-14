"use client";
import React from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import ComponentCard from "@/components/common/ComponentCard";
import toast from "react-hot-toast";
import InputLabel from "@/components/form/FormInput";
import Button from "@/components/ui/button/Button";
import { useCreateData } from "@/hooks/useCreateData";
import ScheduleService from "@/services/ScheduleService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFetchData } from "@/hooks/useFetchData";
import FormSelect2 from "@/components/form/FormSelect2";
import { Loader2 } from "lucide-react";
import ModelService from "@/services/ModelService";
import { createScheduleSchema } from "@/validators/scheduleValidator";
import { z } from "zod";

type CreateScheduleFormData = z.infer<typeof createScheduleSchema>;

export default function CreateSchedule() {

    const { data: models } = useFetchData(ModelService.getWithoutPagination, "models");

    const { mutate: createSchedule, isPending } = useCreateData(ScheduleService.create, ["schedules"], "/schedules");

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset
    } = useForm<CreateScheduleFormData>({
        resolver: zodResolver(createScheduleSchema),
        mode: "onChange",
    });

    const onSubmit = (data: CreateScheduleFormData) => {
        const payload = {
            modelId: data.modelId.value,
            quantity: data.quantity,
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createSchedule(payload as any, {
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
                        <div className="grid grid-cols-1 gap-6">
                            {models ? (
                                <FormSelect2
                                    label="Model"
                                    name="modelId"
                                    control={control}
                                    options={models?.map((d: any) => ({
                                        label: d.name,
                                        value: d.id,
                                    }))}
                                    error={errors.modelId?.message as string || undefined}
                                    placeholder="Select Model"
                                />
                            ) :
                                <div className="flex items-center">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <p>Loading models...</p>
                                </div>}

                            <InputLabel
                                label="Quantity"
                                name="quantity"
                                type="number"
                                required
                                placeholder="Enter Quantity"
                                register={register("quantity", { valueAsNumber: true })}
                                error={errors.quantity as any}
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

"use client";
import React, { useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import ComponentCard from "@/components/common/ComponentCard";
import toast from "react-hot-toast";
import InputLabel from "@/components/form/FormInput";
import Button from "@/components/ui/button/Button";
import { useUpdateData } from "@/hooks/useUpdateData";
import WorkCenterService from "@/services/WorkCenterService";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateWorkCenterValidator } from "@/validators/workCenterValidator";
import { z } from "zod";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useFetchById } from "@/hooks/useFetchDetailData";
import { WorkCenter } from "@/types/workCenter";

type UpdateWorkCenterFormData = z.infer<typeof updateWorkCenterValidator>;

export default function EditWorkCenter() {
    const params = useParams();
    const id = Number(params.id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: workCenter, isLoading } = useFetchById<WorkCenter>(
        WorkCenterService.getById,
        id,
        "work-center"
    );

    const { mutate: updateWorkCenter, isPending } = useUpdateData(
        WorkCenterService.update,
        id,
        "work-centers",
        "/work-centers"
    );

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
    } = useForm<UpdateWorkCenterFormData>({
        resolver: zodResolver(updateWorkCenterValidator),
        mode: "onChange",
        defaultValues: {
            name: "",
            processComponents: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "processComponents",
    });

    useEffect(() => {
        if (workCenter) {
            reset({
                name: workCenter.name,
                processComponents: workCenter.processComponents || [],
            });
        }
    }, [workCenter, reset]);

    const onSubmit = (data: UpdateWorkCenterFormData) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updateWorkCenter(data as any, {
            onSuccess: () => {
                toast.success("Work Center updated successfully.");
            },
        });
    };

    if (isLoading || !workCenter) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <Breadcrumb
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Work Centers", href: "/work-centers" },
                    { label: "Edit" },
                ]}
            />
            <div className="space-y-6">
                <ComponentCard title="Edit Work Center">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1">
                            <InputLabel
                                label="Name"
                                name="name"
                                type="text"
                                required
                                placeholder="Enter Name"
                                register={register("name")}
                                error={errors.name}
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="font-semibold text-gray-700 dark:text-gray-200">
                                    Process Components
                                </h3>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="primary"
                                    onClick={() =>
                                        append({
                                            partName: "",
                                            operationNumber: "",
                                            workCenterName: "",
                                            workCenterCategory: "",
                                            baseQuantity: 0,
                                            setup: 0,
                                            cycleTime: 0,
                                        })
                                    }
                                    className="flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" /> Add Component
                                </Button>
                            </div>

                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="p-4 border border-gray-200 rounded-lg space-y-4 dark:border-gray-700 relative bg-gray-50 dark:bg-gray-800/50"
                                >
                                    <div className="absolute right-2 top-2">
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                            title="Remove"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-6">
                                        <InputLabel
                                            label="Part Name"
                                            name={`processComponents.${index}.partName`}
                                            type="text"
                                            required
                                            placeholder="Part Name"
                                            register={register(`processComponents.${index}.partName`)}
                                            error={errors.processComponents?.[index]?.partName}
                                        />
                                        <InputLabel
                                            label="Operation Number"
                                            name={`processComponents.${index}.operationNumber`}
                                            type="text"
                                            required
                                            placeholder="Op Number"
                                            register={register(
                                                `processComponents.${index}.operationNumber`
                                            )}
                                            error={errors.processComponents?.[index]?.operationNumber}
                                        />
                                        <InputLabel
                                            label="WC Name"
                                            name={`processComponents.${index}.workCenterName`}
                                            type="text"
                                            required
                                            placeholder="WC Name"
                                            register={register(
                                                `processComponents.${index}.workCenterName`
                                            )}
                                            error={errors.processComponents?.[index]?.workCenterName}
                                        />
                                        <InputLabel
                                            label="WC Category"
                                            name={`processComponents.${index}.workCenterCategory`}
                                            type="text"
                                            required
                                            placeholder="WC Category"
                                            register={register(
                                                `processComponents.${index}.workCenterCategory`
                                            )}
                                            error={
                                                errors.processComponents?.[index]?.workCenterCategory
                                            }
                                        />
                                        <InputLabel
                                            label="Base Quantity"
                                            name={`processComponents.${index}.baseQuantity`}
                                            type="number"
                                            required
                                            placeholder="Base Qty"
                                            register={register(
                                                `processComponents.${index}.baseQuantity`
                                            )}
                                            error={errors.processComponents?.[index]?.baseQuantity}
                                        />
                                        <InputLabel
                                            label="Setup"
                                            name={`processComponents.${index}.setup`}
                                            type="number"
                                            required
                                            placeholder="Setup"
                                            register={register(`processComponents.${index}.setup`)}
                                            error={errors.processComponents?.[index]?.setup}
                                        />
                                        <InputLabel
                                            label="Cycle Time"
                                            name={`processComponents.${index}.cycleTime`}
                                            type="number"
                                            required
                                            placeholder="Cycle Time"
                                            register={register(`processComponents.${index}.cycleTime`)}
                                            error={errors.processComponents?.[index]?.cycleTime}
                                        />
                                    </div>
                                </div>
                            ))}
                            {errors.processComponents && (
                                <p className="text-sm text-red-500">{errors.processComponents.message}</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 mt-6 border-t pt-4">
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                className="px-4"
                                onClick={() => reset()}
                            >
                                Reset
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                variant="primary"
                                className="px-4"
                                disabled={isPending}
                                loading={isPending}
                            >
                                Update Work Center
                            </Button>
                        </div>
                    </form>
                </ComponentCard>
            </div>
        </div>
    );
}

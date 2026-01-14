"use client";
import Breadcrumb from "@/components/common/Breadcrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Loading from "@/components/common/Loading";
import InputLabel from "@/components/form/FormInput";
import Button from "@/components/ui/button/Button";
import { useFetchById } from "@/hooks/useFetchDetailData";
import { useUpdateData } from "@/hooks/useUpdateData";
import ModelService from "@/services/ModelService";
import { updateModelValidator } from "@/validators/modelValidator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import z from "zod";
import { Plus, Trash2 } from "lucide-react";

type UpdateModelFormData = z.infer<typeof updateModelValidator>;

const EditModelPage = () => {
    const params = useParams();
    const id = Number(params.id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: model, isLoading } = useFetchById<any>(
        ModelService.getById,
        id,
        "model"
    );

    const { mutate: updateMutation, isPending } = useUpdateData(
        ModelService.update,
        id,
        "models",
        "/models"
    );

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
    } = useForm<UpdateModelFormData>({
        resolver: zodResolver(updateModelValidator),
        mode: "onChange",
        defaultValues: {
            name: "",
            created: "",
            processDetails: [],
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "processDetails",
    });

    useEffect(() => {
        if (model) {
            const formattedDate =
                model.created && model.created.includes("T")
                    ? model.created.split("T")[0]
                    : model.created;

            reset({
                name: model.name,
                created: formattedDate,
                processDetails: model.processDetails || [],
            });
        }
    }, [model, reset]);

    const onSubmit = (data: UpdateModelFormData) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updateMutation(data as any);
    };

    if (isLoading || !model) {
        return <Loading />;
    }

    return (
        <div>
            <Breadcrumb
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Models", href: "/models" },
                    { label: "Edit" },
                ]}
            />
            <div className="space-y-6">
                <ComponentCard title="Edit Model">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputLabel
                                label="Name"
                                name="name"
                                type="text"
                                required
                                placeholder="Enter Name"
                                register={register("name")}
                                error={errors.name}
                            />
                            <InputLabel
                                label="Created Date"
                                name="created"
                                type="date"
                                required
                                placeholder="Select Date"
                                register={register("created")}
                                error={errors.created}
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="font-semibold text-gray-700 dark:text-gray-200">
                                    Process Details (Parts)
                                </h3>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="primary"
                                    onClick={() =>
                                        append({
                                            modelName: "",
                                            partName: "",
                                            operatorNumber: "",
                                            bom: 0,
                                        })
                                    }
                                    className="flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" /> Add Part
                                </Button>
                            </div>

                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="p-4 border border-gray-200 rounded-lg space-y-4 dark:border-gray-700 relative bg-gray-50 dark:bg-gray-800/50"
                                >
                                    <div className="absolute right-2 top-2">
                                        {fields.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="text-red-500 hover:text-red-700 p-1"
                                                title="Remove"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-6">
                                        <InputLabel
                                            label="Model Name"
                                            name={`processDetails.${index}.modelName`}
                                            type="text"
                                            required
                                            placeholder="Enter Model Name"
                                            register={register(`processDetails.${index}.modelName`)}
                                            error={errors.processDetails?.[index]?.modelName}
                                        />
                                        <InputLabel
                                            label="Part Name"
                                            name={`processDetails.${index}.partName`}
                                            type="text"
                                            required
                                            placeholder="Enter Part Name"
                                            register={register(`processDetails.${index}.partName`)}
                                            error={errors.processDetails?.[index]?.partName}
                                        />
                                        <InputLabel
                                            label="Operator Number"
                                            name={`processDetails.${index}.operatorNumber`}
                                            type="text"
                                            required
                                            placeholder="Enter Operator Number"
                                            register={register(`processDetails.${index}.operatorNumber`)}
                                            error={errors.processDetails?.[index]?.operatorNumber}
                                        />
                                        <InputLabel
                                            label="BOM"
                                            name={`processDetails.${index}.bom`}
                                            type="number"
                                            required
                                            placeholder="Enter BOM"
                                            register={register(`processDetails.${index}.bom`)}
                                            error={errors.processDetails?.[index]?.bom}
                                        />
                                    </div>
                                </div>
                            ))}
                            {errors.processDetails && (
                                <p className="text-sm text-red-500">{errors.processDetails.message}</p>
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
                                Update Model
                            </Button>
                        </div>
                    </form>
                </ComponentCard>
            </div>
        </div>
    );
};

export default EditModelPage;

"use client"
import React, { Suspense } from "react";
import Breadcrumb from '@/components/common/Breadcrumb'
import ComponentCard from '@/components/common/ComponentCard'
import InputLabel from '@/components/form/FormInput';
import Button from '@/components/ui/button/Button';
import { useCreateData } from '@/hooks/useCreateData';
import { useFetchData } from '@/hooks/useFetchData';
import KanbanService from '@/services/KanbanService';
import RackService from '@/services/RackService';
import { Rack } from '@/types/rack';
import { createKanbanValidator } from '@/validators/kanbanValidator';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import TextAreaLabel from '@/components/form/FormTextArea';
import { Machine } from '@/types/machine';
import MachineService from '@/services/MachineService';
import AreaService from '@/services/CustomerService';
import { Area } from '@/types/area';
import { z } from 'zod';
import Loading from '@/components/common/Loading';
import FormSelect2 from "@/components/form/FormSelect2";
import MakerService from "@/services/MakerService";
import { Maker } from "@/types/maker";

type CreateKanbanFormData = z.infer<typeof createKanbanValidator>;

function CreateKanbanForm() {
    const { data: machineAreas } = useFetchData(AreaService.getWithoutPagination, "machineAreas", false);
    const { data: racks } = useFetchData(RackService.getWithoutPagination, "racks", false);
    const { data: machines } = useFetchData(MachineService.getWithoutPagination, "machines", false);
    const { data: makers } = useFetchData(MakerService.getWithoutPagination, "makers", false);

    const { mutate: createMutation, isPending } = useCreateData(
        KanbanService.create,
        ["kanbans"],
        "/kanbans"
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
    } = useForm<CreateKanbanFormData>({
        resolver: zodResolver(createKanbanValidator),
        mode: "onChange",
    });

    const onSubmit = (data: CreateKanbanFormData) => {
        const formData = {
            ...data,
            machine_id: data.machine_id?.value || null,
            rack_id: data.rack_id?.value || null,
            machine_area_id: data.machine_area_id?.value || null,
            maker_id: data.maker_id?.value || null,
        } as const;
        createMutation(formData, {
            onSuccess: () => {
                reset();
            }
        });
    };

    return (
        <div>
            <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'kanbans', href: '/kanbans' }, { label: 'Create' }]} />
            <div className="space-y-6">
                <ComponentCard title="Create Kanban">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Basic Information */}
                        <div className="grid grid-cols-2 gap-3">
                            <InputLabel
                                label="Code"
                                name="code"
                                type="text"
                                required
                                placeholder="Enter Code"
                                register={register("code")}
                                error={errors.code}
                            />
                            <InputLabel
                                label="Uom"
                                name="uom"
                                type="text"
                                required
                                placeholder="Enter uom"
                                register={register("uom")}
                                error={errors.uom}
                            />
                        </div>

                        {/* Description */}
                        <div className="grid grid-cols-2 gap-3">
                            <TextAreaLabel
                                label="Description"
                                name="description"
                                required
                                placeholder="Enter Description"
                                register={register("description")}
                                error={errors.description}
                                rows={3}
                            />
                            <TextAreaLabel
                                label="Specification"
                                name="specification"
                                required
                                placeholder="Enter specification"
                                register={register("specification")}
                                error={errors.specification}
                                rows={3}
                            />
                        </div>

                        {/* Quantity Information */}
                        <div className="grid grid-cols-2 gap-3">
                            <InputLabel
                                label="Min Quantity"
                                name="min_quantity"
                                type="number"
                                required
                                placeholder="Enter min quantity"
                                register={register("min_quantity", { valueAsNumber: true })}
                                error={errors.min_quantity}
                            />
                            <InputLabel
                                label="Max Quantity"
                                name="max_quantity"
                                type="number"
                                required
                                placeholder="Enter max quantity"
                                register={register("max_quantity", { valueAsNumber: true })}
                                error={errors.max_quantity}
                            />
                        </div>

                        {/* Stock Information */}
                        <div className="grid grid-cols-2 gap-3">
                            <InputLabel
                                label="Safety Stock"
                                name="safety_stock"
                                type="number"
                                required
                                placeholder="Enter Safety Stock"
                                register={register("safety_stock", { valueAsNumber: true })}
                                error={errors.safety_stock}
                            />
                            <InputLabel
                                label="Order Point"
                                name="order_point"
                                type="number"
                                required
                                placeholder="Enter Order Point"
                                register={register("order_point", { valueAsNumber: true })}
                                error={errors.order_point}
                            />
                        </div>

                        {/* Order Information */}
                        <div className="grid grid-cols-2 gap-3">
                            <InputLabel
                                label="Lead Time"
                                name="lead_time"
                                type="number"
                                required
                                placeholder="Enter Lead Time"
                                register={register("lead_time", { valueAsNumber: true })}
                                error={errors.lead_time}
                            />
                            <InputLabel
                                label="Price"
                                name="price"
                                type="number"
                                required
                                placeholder="Enter Price"
                                register={register("price", { valueAsNumber: true })}
                                error={errors.price}
                            />
                        </div>

                        {/* Price Information */}
                        <div className="grid grid-cols-2 gap-3">

                            <InputLabel
                                label="Currency"
                                name="currency"
                                type="text"
                                required
                                placeholder="Enter Currency"
                                register={register("currency")}
                                error={errors.currency}
                            />
                            <InputLabel
                                label="Rank"
                                name="rank"
                                type="text"
                                required
                                placeholder="Enter Rank"
                                register={register("rank")}
                                error={errors.rank}
                            />
                        </div>

                        {/* Classification */}
                        <div className="grid grid-cols-2 gap-3">

                            {makers && (
                                <FormSelect2
                                    label="Maker"
                                    name="maker_id"
                                    control={control}
                                    options={makers.map((d: Maker) => ({
                                        label: d.name,
                                        value: d.id || 0,
                                    }))}
                                    error={errors.maker_id?.message}
                                    placeholder="Select Maker"
                                />
                            )}
                            {machines && (
                                <FormSelect2
                                    label="Machine"
                                    name="machine_id"
                                    control={control}
                                    options={machines.map((d: Machine) => ({
                                        label: d.code,
                                        value: d.id,
                                    }))}
                                    error={errors.machine_id?.message}
                                    placeholder="Select Machine"
                                />
                            )}
                        </div>

                        {/* Location Information */}
                        <div className="grid grid-cols-2 gap-3">

                            {racks && (
                                <FormSelect2
                                    label="Rack"
                                    name="rack_id"
                                    control={control}
                                    options={racks.map((d: Rack) => ({
                                        label: d.code,
                                        value: d.id,
                                    }))}
                                    error={errors.rack_id?.message}
                                    placeholder="Select Rack"
                                />
                            )}
                            {machineAreas && (
                                <FormSelect2
                                    label="Machine Area"
                                    name="machine_area_id"
                                    control={control}
                                    options={machineAreas.map((d: Area) => ({
                                        label: d.name || "",
                                        value: d.id,
                                    }))}
                                    error={errors.machine_area_id?.message}
                                    placeholder="Select Machine Area"
                                />
                            )}
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
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
                                Create Kanban
                            </Button>
                        </div>
                    </form>
                </ComponentCard>
            </div>
        </div>
    )
}

export default function Page() {
    return (
        <Suspense fallback={<Loading />}>
            <CreateKanbanForm />
        </Suspense>
    );
}

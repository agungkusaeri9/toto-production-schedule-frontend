"use client"
import Breadcrumb from '@/components/common/Breadcrumb'
import ComponentCard from '@/components/common/ComponentCard'
import InputLabel from '@/components/form/FormInput';
import Button from '@/components/ui/button/Button';
import { useFetchData } from '@/hooks/useFetchData';
import KanbanService from '@/services/KanbanService';
import RackService from '@/services/RackService';
import { Rack } from '@/types/rack';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form';
import TextAreaLabel from '@/components/form/FormTextArea';
import { Machine } from '@/types/machine';
import MachineService from '@/services/MachineService';
import AreaService from '@/services/CustomerService';
import { Area } from '@/types/area';
import { z } from 'zod';
import { useParams } from 'next/navigation';
import { useFetchById } from '@/hooks/useFetchDetailData';
import { Kanban } from '@/types/kanban';
import { useUpdateData } from '@/hooks/useUpdateData';
import { updateKanbanValidator } from '@/validators/kanbanValidator';
import MakerService from '@/services/MakerService';
import FormSelect2 from '@/components/form/FormSelect2';
import { Maker } from '@/types/maker';
type UpdateKanbanFormData = z.infer<typeof updateKanbanValidator>;
const Page = () => {
    const { data: machineAreas } = useFetchData(AreaService.getWithoutPagination, "machineAreas", false);
    const { data: racks } = useFetchData(RackService.getWithoutPagination, "racks", false);
    const { data: machines } = useFetchData(MachineService.getWithoutPagination, "machines", false);
    const { data: makers } = useFetchData(MakerService.getWithoutPagination, "makers", false);

    const params = useParams();
    const id = Number(params.id);

    const { data: kanban } = useFetchById<Kanban>(KanbanService.getById, id, "kanban");
    const { mutate: updateMutation, isPending } = useUpdateData(
        KanbanService.update,
        id,
        "kanbans",
        "/kanbans"
    );
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control
    } = useForm<UpdateKanbanFormData>({
        resolver: zodResolver(updateKanbanValidator),
        mode: "onChange"
    });

    useEffect(() => {
        if (kanban) {
            reset({
                code: kanban.code,
                // balance: Number(kanban.balance),
                description: kanban.description.toString(),
                specification: kanban.specification,
                lead_time: kanban.lead_time,
                machine_id: { value: Number(kanban.machine?.id || 0), label: kanban.machine?.code },
                machine_area_id: { value: Number(kanban.machine_area?.id), label: kanban.machine_area?.name },
                rack_id: { value: Number(kanban.rack?.id), label: kanban.rack?.code },
                max_quantity: Number(kanban.max_quantity),
                min_quantity: Number(kanban.min_quantity),
                uom: kanban.uom,
                maker_id: { value: Number(kanban.maker?.id), label: kanban.maker?.name },
                order_point: Number(kanban.order_point),
                currency: kanban.currency,
                rank: kanban.rank,
                price: Number(kanban.price),
                safety_stock: Number(kanban.safety_stock),
            });
        }
    }, [kanban, reset]);


    const onSubmit = (data: UpdateKanbanFormData) => {
        const formData = {
            ...data,
            machine_id: data.machine_id?.value || null,
            rack_id: data.rack_id?.value || null,
            machine_area_id: data.machine_area_id?.value || null,
            maker_id: data.maker_id?.value || null,
        } as const;
        updateMutation(formData, {
            onSuccess: () => {
                reset();
            }
        });
    };

    return (
        <div>
            <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'kanbans', href: '/kanbans' }, { label: 'Edit' }]} />
            <div className="space-y-6">
                <ComponentCard title="Edit Kanban">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Basic Information */}
                        <div className="grid grid-cols-2 gap-3">
                            <InputLabel
                                label="Code"
                                name="code"
                                type="text"
                                required
                                defaultValue={kanban?.code || ""}
                                disabled
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
                                    // options={machineAreas.map((d: Area) => ({
                                    //     label: d.name,
                                    //     value: d.id,
                                    // }))}
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
                                Update Kanban
                            </Button>
                        </div>
                    </form>
                </ComponentCard>
            </div>
        </div>
    )
}

export default Page

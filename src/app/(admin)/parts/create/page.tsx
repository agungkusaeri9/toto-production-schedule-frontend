"use client"
import Breadcrumb from '@/components/common/Breadcrumb'
import ComponentCard from '@/components/common/ComponentCard'
import InputLabel from '@/components/form/FormInput';
import SelectLabel from '@/components/form/FormSelect';
import Button from '@/components/ui/button/Button';
import { useRouter } from 'next/navigation';
import React from 'react'
import customers from '@/data/customer.json';
import toast from 'react-hot-toast';
import { useCreateData } from '@/hooks/useCreateData';
import PartService from '@/services/PartService';
import { createPartValidator } from '@/validators/PartValidator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFetchData } from '@/hooks/useFetchData';
import CustomerService from '@/services/CustomerService';
import z from 'zod';
import FormSelect2 from '@/components/form/FormSelect2';
type CreatePartFormData = z.infer<typeof createPartValidator>;
const CreateOperator = () => {
    const { data: customers } = useFetchData(CustomerService.getWithoutPagination, "customers");
    const { mutate: createMutation, isPending } = useCreateData(
        PartService.create,
        ["parts"],
        "/parts"
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control
    } = useForm<CreatePartFormData>({
        resolver: zodResolver(createPartValidator),
        mode: "onChange",

    });

    const onSubmit = (data: CreatePartFormData) => {
        const payload = {
            ...data,
            customerId: data.customerId?.value || null,
        }

        createMutation(payload, {
            onSuccess: () => {
                toast.success("Part created successfully.");
                reset();
            }
        });
    };

    return (
        <div>
            <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Parts', href: '/parts' }, { label: 'Create' }]} />
            <div className="space-y-6">
                <ComponentCard title="Create Parts">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                            label="Type"
                            name="type"
                            type="text"
                            required
                            placeholder="Enter Type"
                            register={register("type")}
                            error={errors.type}
                        />
                        {customers && (
                            <FormSelect2
                                label="Customer"
                                name="customerId"
                                control={control}
                                options={customers?.map((d: any) => ({
                                    label: d.name,
                                    value: d.id,
                                }))}
                                error={errors.customerId?.message}
                                placeholder="Select Customer"
                            />
                        )}

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
                                Create Part
                            </Button>
                        </div>
                    </form>
                </ComponentCard>
            </div>
        </div>
    )
}

export default CreateOperator

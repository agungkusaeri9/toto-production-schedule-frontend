"use client"
import Breadcrumb from '@/components/common/Breadcrumb'
import ComponentCard from '@/components/common/ComponentCard'
import InputLabel from '@/components/form/FormInput';
import Button from '@/components/ui/button/Button';
import { useCreateData } from '@/hooks/useCreateData';
import CustomerService from '@/services/CustomerService';
import { createCustomerValidator } from '@/validators/customerValidator';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import React from 'react'
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import z from 'zod';
type CreateCustomerFormData = z.infer<typeof createCustomerValidator>;

const CreateOperator = () => {

    const { mutate: createMutation, isPending } = useCreateData(
        CustomerService.create,
        ["customers"],
        "/customers"
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<CreateCustomerFormData>({
        resolver: zodResolver(createCustomerValidator),
        mode: "onChange",
    });

    const onSubmit = (data: CreateCustomerFormData) => {
        createMutation(data, {
            onSuccess: () => {
                toast.success("Customer created successfully.");
                reset();
            }
        });
    };

    return (
        <div>
            <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Customers', href: '/customers' }, { label: 'Create' }]} />
            <div className="space-y-6">
                <ComponentCard title="Create Customers">
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
                                Create Customers
                            </Button>
                        </div>
                    </form>
                </ComponentCard>
            </div>
        </div>
    )
}

export default CreateOperator

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
import ProcessService from '@/services/ProcessService';
import { createProcessValidator } from '@/validators/processValidator';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
type CreateProcessFormData = z.infer<typeof createProcessValidator>;
const CreateProcessPage = () => {
    const { mutate: createMutation, isPending } = useCreateData(
        ProcessService.create,
        ["processes"],
        "/processes"
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<CreateProcessFormData>({
        resolver: zodResolver(createProcessValidator),
        mode: "onChange",
    });

    const onSubmit = (data: CreateProcessFormData) => {
        createMutation(data, {
            onSuccess: () => {
                toast.success("Process created successfully.");
                reset();
            }
        });
    };

    return (
        <div>
            <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Process', href: '/processes' }, { label: 'Create' }]} />
            <div className="space-y-6">
                <ComponentCard title="Create Process">
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
                        <SelectLabel
                            label="Type"
                            name="type"
                            required
                            placeholder="Select Type"
                            register={register("type")}
                            error={errors.type}
                            options={[
                                { label: "INTERNAL", value: "INTERNAL" },
                                { label: "EXTERNAL", value: "EXTERNAL" }
                            ]}
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
                                Create Process
                            </Button>
                        </div>
                    </form>
                </ComponentCard>
            </div>
        </div>
    )
}

export default CreateProcessPage

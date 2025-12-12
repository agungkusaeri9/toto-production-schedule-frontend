"use client"
import Breadcrumb from '@/components/common/Breadcrumb'
import ComponentCard from '@/components/common/ComponentCard'
import InputLabel from '@/components/form/FormInput';
import SelectLabel from '@/components/form/FormSelect';
import Button from '@/components/ui/button/Button';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect } from 'react'
import customers from '@/data/customer.json';
import toast from 'react-hot-toast';
import ComingSoonAlert from '@/components/ComingSoonAlert';
import { useFetchById } from '@/hooks/useFetchDetailData';
import ProcessService from '@/services/ProcessService';
import { useUpdateData } from '@/hooks/useUpdateData';
import { updateProcessValidator } from '@/validators/processValidator';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader } from 'lucide-react';
import Loading from '@/components/common/Loading';
type UpdateProcessFormData = z.infer<typeof updateProcessValidator>;

const UpdateProcessPage = () => {
    const params = useParams();
    const id = Number(params.id);

    const { data: process, isLoading } = useFetchById<any>(ProcessService.getById, id, "process");
    const { mutate: updateMutation, isPending } = useUpdateData(
        ProcessService.update,
        id,
        "processes",
        "/processes"
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<UpdateProcessFormData>({
        resolver: zodResolver(updateProcessValidator),
        mode: "onChange",
    });

    useEffect(() => {
        if (process) {
            reset({
                name: process.name,
                type: process.type,
            });
        }
    }, [process, reset]);

    const onSubmit = (data: UpdateProcessFormData) => {
        updateMutation(data);
    };

    if (isLoading || !process) {
        return <Loading />
    }


    return (
        <div>
            <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Process', href: '/processes' }, { label: 'Edit' }]} />
            <div className="space-y-6">
                <ComponentCard title="Edit Process">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <InputLabel
                            label="Name"
                            name="name"
                            type="text"
                            required
                            placeholder="Enter Name"
                            register={register('name')}
                            error={errors.name}
                        />
                        <SelectLabel
                            label="Type"
                            name="type"
                            required
                            placeholder="Select Type"
                            register={register('type')}
                            options={[
                                { label: "INTERNAL", value: "INTERNAL" },
                                { label: "EXTERNAL", value: "EXTERNAL" }
                            ]}
                            error={errors.type}
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
                                Update Process
                            </Button>
                        </div>
                    </form>
                </ComponentCard>
            </div>
        </div>
    )
}

export default UpdateProcessPage

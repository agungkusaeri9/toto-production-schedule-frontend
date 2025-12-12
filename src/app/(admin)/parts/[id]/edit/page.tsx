"use client"
import Breadcrumb from '@/components/common/Breadcrumb'
import ComponentCard from '@/components/common/ComponentCard'
import InputLabel from '@/components/form/FormInput';
import SelectLabel from '@/components/form/FormSelect';
import Button from '@/components/ui/button/Button';
import { useParams, useRouter } from 'next/dist/client/components/navigation';
import React, { useEffect } from 'react'
import { useFetchById } from '@/hooks/useFetchDetailData';
import PartService from '@/services/PartService';
import { useUpdateData } from '@/hooks/useUpdateData';
import { updatePartValidator } from '@/validators/PartValidator';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormSelect2 from '@/components/form/FormSelect2';
import Loading from '@/components/common/Loading';
import { useFetchData } from '@/hooks/useFetchData';
import CustomerService from '@/services/CustomerService';
type UpdatePartFormData = z.infer<typeof updatePartValidator>;
const EditUserPage = () => {

    const { data: customers } = useFetchData(CustomerService.getWithoutPagination, "customers");
    const params = useParams();
    const id = Number(params.id);

    const { data: part, isLoading } = useFetchById<any>(PartService.getById, id, "part");
    const { mutate: updateMutation, isPending } = useUpdateData(
        PartService.update,
        id,
        "parts",
        "/parts"
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control
    } = useForm<UpdatePartFormData>({
        resolver: zodResolver(updatePartValidator),
        mode: "onChange"
    });

    useEffect(() => {
        if (part) {
            reset({
                name: part.name,
                type: part.type,
                customerId: part.customer ? { value: part.customer.id, label: part.customer.name } : null,
            });
        }
    }, [part, reset]);

    const onSubmit = (data: UpdatePartFormData) => {
        const payload = {
            ...data,
            customerId: data.customerId?.value || null,
        }
        updateMutation(payload);
    };

    if (isLoading || !part) {
        return <Loading />
    }

    return (
        <div>
            <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Parts', href: '/parts' }, { label: 'Edit' }]} />
            <div className="space-y-6">
                <ComponentCard title="Edit Part">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <InputLabel
                            label="Name"
                            name="name"
                            type="text"
                            required
                            placeholder="Enter Name"
                            defaultValue={'Part Sensor Utama'}
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
                                Update Part
                            </Button>
                        </div>
                    </form>
                </ComponentCard>
            </div>
        </div>
    )
}

export default EditUserPage

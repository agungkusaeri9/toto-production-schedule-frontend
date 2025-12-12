"use client"
import ComingSoonAlert from '@/components/ComingSoonAlert';
import Breadcrumb from '@/components/common/Breadcrumb'
import ComponentCard from '@/components/common/ComponentCard'
import Loading from '@/components/common/Loading';
import InputLabel from '@/components/form/FormInput';
import Button from '@/components/ui/button/Button';
import { useFetchById } from '@/hooks/useFetchDetailData';
import { useUpdateData } from '@/hooks/useUpdateData';
import CustomerService from '@/services/CustomerService';
import { updateCustomerValidator } from '@/validators/customerValidator';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useRouter } from 'next/dist/client/components/navigation';
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import z from 'zod';

type UpdateCustomerFormData = z.infer<typeof updateCustomerValidator>;
const EditUserPage = () => {

    const params = useParams();
    const id = Number(params.id);

    const { data: customer, isLoading } = useFetchById<any>(CustomerService.getById, id, "customer");
    const { mutate: updateMutation, isPending } = useUpdateData(
        CustomerService.update,
        id,
        "customers",
        "/customers"
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<UpdateCustomerFormData>({
        resolver: zodResolver(updateCustomerValidator),
        mode: "onChange",
    });

    useEffect(() => {
        if (customer) {
            reset({
                name: customer.name
            });
        }
    }, [customer, reset]);

    const onSubmit = (data: any) => {
        updateMutation(data);
    };

    if (isLoading || !customer) {
        return <Loading />
    }

    return (
        <div>
            <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Customers', href: '/customers' }, { label: 'Edit' }]} />
            <div className="space-y-6">


                <ComponentCard title="Edit Customer">
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
                                Update Customer
                            </Button>
                        </div>
                    </form>
                </ComponentCard>
            </div>
        </div>
    )
}

export default EditUserPage

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

const SettingPage = () => {
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        toast.success("Feature not implemented yet.");
        router.push('/setting');
    }

    return (
        <div>
            <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Settings', href: '/setting' }, { label: 'Create' }]} />
            <div className="space-y-6">
                <ComponentCard title="Settings">
                    <form onSubmit={handleSubmit}>
                        <InputLabel
                            label="Internal Process (Days)"
                            name="internalProcessDays"
                            type="number"
                            required
                            defaultValue={'2'}
                            placeholder="Enter Internal Process Days"
                        />
                        <InputLabel
                            label="External Process (Days)"
                            name="externalProcessDays"
                            type="number"
                            required
                            defaultValue={'4'}
                            placeholder="Enter External Process Days"
                        />
                        <InputLabel
                            label="Before Check PO (Days)"
                            name="beforeCheckPODays"
                            type="number"
                            required
                            defaultValue={'3'}
                            placeholder="Enter Before Check PO Days"
                        />


                        <div className="flex justify-end gap-2 mt-6">
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                className="px-4"
                            // onClick={() => reset()}
                            >
                                Reset
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                variant="primary"
                                className="px-4"
                            // disabled={isPending}
                            // loading={isPending}
                            >
                                Save Setting
                            </Button>
                        </div>
                    </form>
                </ComponentCard>
            </div>
        </div>
    )
}

export default SettingPage

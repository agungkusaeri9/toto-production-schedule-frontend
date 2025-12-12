"use client"
import React, { useState } from 'react';
import Breadcrumb from '@/components/common/Breadcrumb'
import ComponentCard from '@/components/common/ComponentCard'
import Button from '@/components/ui/button/Button';
import products from '@/data/product.json';
import toast from 'react-hot-toast';
import DatePicker from '@/components/form/datePicker';

export default function CreateProduct() {
    // const { data: products } = useFetchData(productservice.getWithoutPagination, "products", false);
    // const { mutate: createMutation, isPending } = useCreateData(
    //     ProductService.create,
    //     ["productCreate"],
    //     "/products"
    // );

    const [form, setForm] = useState({
        name: '',
        description: '',
        products: [
            { id: 0, quantity: 1 }
        ]
    });


    const handleProductChange = (idx: number, value: number) => {
        setForm(prev => ({
            ...prev,
            products: prev.products.map((item, i) => i === idx ? { ...item, id: value } : item)
        }));
    };

    const handleQuantityChange = (idx: number, value: number) => {
        setForm(prev => ({
            ...prev,
            products: prev.products.map((item, i) => i === idx ? { ...item, quantity: value } : item)
        }));
    };

    const handleAddProduct = () => {
        setForm(prev => ({
            ...prev,
            products: [...prev.products, { id: 0, quantity: 1 }]
        }));
    };

    const handleRemoveProduct = (idx: number) => {
        setForm(prev => ({
            ...prev,
            products: prev.products.filter((_, i) => i !== idx)
        }));
    };

    const getAvailableProductOptions = (currentIdx: number) => {
        const selectedIds = form.products
            .map((item, idx) => idx !== currentIdx ? item.id : null)
            .filter(id => typeof id === 'number' && id !== 0);
        return products
            ? products.filter((k: { id: number }) => !selectedIds.includes(k.id))
            : [];
    };


    return (
        <div>
            <Breadcrumb
                items={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Request Schedule', href: '/request-schedules' },
                    { label: 'Edit' }
                ]}
            />
            <div className="space-y-6">
                <ComponentCard title="Edit Request Schedule">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        toast.success("Request schedule created successfully.");
                    }} className="space-y-4">
                        <h3 className="text-lg font-semibold mb-6">Form Request Schedule</h3>
                        <div className='grid grid-cols-2 gap-4'>
                            <DatePicker
                                placeholder="Start Date"
                                label="Start Date"
                                id="start_date"
                                onChange={() => { }}
                                mode="single"
                                defaultDate={new Date("2025-09-03")}
                            />

                            <DatePicker
                                placeholder="End Date"
                                label="End Date"
                                id="end_date"
                                onChange={() => { }}
                                mode="single"
                                defaultDate={new Date("2025-09-12")}
                            />

                        </div>
                        <div className='flex items-center justify-between'>
                            <h3 className="text-lg font-semibold mb-2">Form Product</h3>
                            <Button variant="info" size='xs' type="button" onClick={handleAddProduct} >
                                + Tambah Product/Part
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {products.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                                        <select
                                            className="w-full border rounded px-2 py-2"
                                            value={item.id}
                                            onChange={e => handleProductChange(idx, Number(e.target.value))}
                                            required
                                        >
                                            <option value={0}>Choose Product</option>
                                            {getAvailableProductOptions(idx).map((Product: { id: number; code: string; description: string; }) => (
                                                <option key={Product.id} value={Product.id}>
                                                    {Product.code} - {Product.description}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-40">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                                        <input
                                            type="number"
                                            value={Math.floor(Math.random() * 10)}
                                            onChange={e => handleQuantityChange(idx, Number(e.target.value))}
                                            required
                                            placeholder="Enter quantity"
                                            className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                                        />
                                    </div>
                                    <div className="w-28 flex items-start pt-6">
                                        <Button
                                            type="button"
                                            variant="danger"
                                            size="sm"
                                            className="ml-2 w-full"
                                            onClick={() => handleRemoveProduct(idx)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <Button
                                type="submit"
                                size="sm"
                                variant="primary"
                                className="px-4"
                            // disabled={isPending}
                            // loading={isPending}
                            >
                                Update Request Schedule
                            </Button>
                        </div>
                    </form>
                </ComponentCard>
            </div>
        </div>
    );
}

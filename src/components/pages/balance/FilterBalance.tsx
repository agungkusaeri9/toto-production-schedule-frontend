import InputLabel from '@/components/form/FormInput'
import SelectLabel from '@/components/form/FormSelect'
import Button from '@/components/ui/button/Button'
import React, { useState, useEffect } from 'react'
import { useFetchData } from '@/hooks/useFetchData'
import MachineService from '@/services/MachineService'
import AreaService from '@/services/CustomerService'
import RackService from '@/services/RackService'
import { Machine } from '@/types/machine'
import { Area } from '@/types/area'
import { Rack } from '@/types/rack'
import { useForm } from 'react-hook-form'
import FormSelect2 from '@/components/form/FormSelect2'
import { Dropdown } from '@/components/ui/dropdown/Dropdown'

interface FilterFormData {
    keyword: string;
    machine_id: { value: number; label: string } | null;
    machine_area_id: { value: number; label: string } | null;
    rack_id: { value: number; label: string } | null;
    status: string | null;
    js_balance_status: string;
}

const FilterBalance = ({
    filter,
    setFilter
}: {
    filter: {
        machine_id: number | null,
        machine_area_id: number | null,
        rack_id: number | null,
        keyword: string,
        status: string | null,
        js_balance_status: string
    },
    setFilter: (filter: {
        machine_id: number | null,
        machine_area_id: number | null,
        rack_id: number | null,
        keyword: string,
        status: string | null,
        js_balance_status: string
    }) => void
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState(0);
    const { register, handleSubmit, reset, control, setValue, watch } = useForm<FilterFormData>({
        defaultValues: {
            keyword: filter.keyword,
            machine_id: null,
            machine_area_id: null,
            rack_id: null,
            status: null,
            js_balance_status: ""
        }
    });
    const statuses = ([
        { label: "Normal", value: "Normal" },
        { label: "Overstock", value: "Overstock" },
        { label: "Understock", value: "Understock" },
    ]);
    const status_balances = ([
        { label: "All", value: "" },
        { label: "Balance", value: "balance" },
        { label: "Unbalance", value: "unbalance" },
    ]);

    const { data: machines } = useFetchData(MachineService.getWithoutPagination, "machines", false);
    const { data: machineAreas } = useFetchData(AreaService.getWithoutPagination, "machineAreas", false);
    const { data: racks } = useFetchData(RackService.getWithoutPagination, "racks", false);

    // Watch form values to update active filters count
    const formValues = watch();
    useEffect(() => {
        let count = 0;
        if (formValues.keyword) count++;
        if (formValues.machine_id) count++;
        if (formValues.machine_area_id) count++;
        if (formValues.rack_id) count++;
        if (formValues.status) count++;
        if (formValues.js_balance_status) count++;
        setActiveFilters(count);
    }, [formValues]);

    const onSubmit = (data: FilterFormData) => {
        console.log("Filter Data:", data);
        setFilter({
            machine_id: data.machine_id?.value || null,
            machine_area_id: data.machine_area_id?.value || null,
            rack_id: data.rack_id?.value || null,
            keyword: data.keyword,
            status: data.status,
            js_balance_status: data.js_balance_status
        });
        setIsOpen(false);
    };

    const handleReset = () => {
        reset();
        setFilter({
            machine_id: null,
            machine_area_id: null,
            rack_id: null,
            keyword: "",
            status: null,
            js_balance_status: filter.js_balance_status
        });
        setIsOpen(false);
    };

    const removeFilter = (type: keyof FilterFormData) => {
        setValue(type, type === 'keyword' ? '' : null);
        setFilter({
            ...filter,
            [type]: type === 'keyword' ? '' : null,
        });
    };

    return (
        <div className="relative">
            <div className="flex items-center gap-2">
                {/* Active Filter Chips */}
                {filter.keyword && (
                    <div className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 rounded-full dark:bg-gray-800">
                        <span>Search: {filter.keyword}</span>
                        <button
                            onClick={() => removeFilter('keyword')}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            ×
                        </button>
                    </div>
                )}
                {filter.machine_area_id && machineAreas && (
                    <div className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 rounded-full dark:bg-gray-800">
                        <span>Area: {machineAreas.find(a => a.id === filter.machine_area_id)?.name}</span>
                        <button
                            onClick={() => removeFilter('machine_area_id')}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            ×
                        </button>
                    </div>
                )}
                {filter.machine_id && machines && (
                    <div className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 rounded-full dark:bg-gray-800">
                        <span>Machine: {machines.find(m => m.id === filter.machine_id)?.code}</span>
                        <button
                            onClick={() => removeFilter('machine_id')}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            ×
                        </button>
                    </div>
                )}

                {filter.rack_id && racks && (
                    <div className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 rounded-full dark:bg-gray-800">
                        <span>Rack: {racks.find(r => r.id === filter.rack_id)?.code}</span>
                        <button
                            onClick={() => removeFilter('rack_id')}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            ×
                        </button>
                    </div>
                )}
                {filter.status && (
                    <div className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 rounded-full dark:bg-gray-800">
                        <span>Status: {filter.status}</span>
                        <button
                            onClick={() => removeFilter('status')}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            ×
                        </button>
                    </div>
                )}
                {filter.js_balance_status && (
                    <div className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 rounded-full dark:bg-gray-800">
                        <span>JS Balance Status: {filter.js_balance_status}</span>
                        <button
                            onClick={() => removeFilter('js_balance_status')}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Filter Button */}
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    variant="secondary"
                    size="sm"
                    className="flex items-center gap-2 relative"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                        />
                    </svg>
                    Filter
                    {activeFilters > 0 && (
                        <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-500 rounded-full">
                            {activeFilters}
                        </span>
                    )}
                </Button>
            </div>

            <Dropdown
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                className="w-[400px] p-4 shadow-lg"
            >
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filter Options</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Select your filter criteria</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-4">
                        <InputLabel
                            placeholder="Search"
                            label="Search"
                            name="keyword"
                            onChange={(e) => setValue('keyword', e.target.value)}
                            register={register("keyword")}
                        />
                        {machineAreas && (
                            <FormSelect2
                                label="Area"
                                name="machine_area_id"
                                control={control}
                                options={machineAreas.map((d: Area) => ({
                                    label: d.name || "",
                                    value: Number(d.id),
                                }))}
                                placeholder="Select Area"
                            />
                        )}
                        {machines && (
                            <FormSelect2
                                label="Machine"
                                name="machine_id"
                                control={control}
                                options={machines.map((d: Machine) => ({
                                    label: d.code,
                                    value: Number(d.id),
                                }))}
                                placeholder="Select Machine"
                            />
                        )}

                        {racks && (
                            <FormSelect2
                                label="Rack"
                                name="rack_id"
                                control={control}
                                options={racks.map((d: Rack) => ({
                                    label: d.code,
                                    value: Number(d.id),
                                }))}
                                placeholder="Select Rack"
                            />
                        )}
                        <SelectLabel
                            label="Status"
                            name="status"
                            register={register("status")}
                            options={statuses}
                            placeholder="Select Status"
                        />
                        <SelectLabel
                            label="JS Balance Status"
                            name="js_balance_status"
                            register={register("js_balance_status")}
                            options={status_balances}
                            placeholder="Select JS Balance Status"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                            type="button"
                            onClick={handleReset}
                            variant="outline"
                            size="sm"
                        >
                            Reset
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                        >
                            Apply Filter
                        </Button>
                    </div>
                </form>
            </Dropdown>
        </div>
    )
}

export default FilterBalance

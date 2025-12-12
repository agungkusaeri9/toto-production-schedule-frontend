import InputLabel from '@/components/form/FormInput'
import Button from '@/components/ui/button/Button'
import React, { useState, useEffect } from 'react'
import { useFetchData } from '@/hooks/useFetchData'
import MachineService from '@/services/MachineService'
import AreaService from '@/services/CustomerService'
import { Machine } from '@/types/machine'
import { Area } from '@/types/area'
import { useForm } from 'react-hook-form'
import FormSelect2 from '@/components/form/FormSelect2'
import DatePicker from '@/components/form/datePicker'
import { dateFormat } from '@/utils/dateFormat'
import { Dropdown } from '@/components/ui/dropdown/Dropdown'

interface FilterFormData {
    start_date: string;
    end_date: string;
    code: string;
    machine_id: { value: number; label: string } | null;
    machine_area_id: { value: number; label: string } | null;
}

const FilterStockOut = ({
    filter,
    setFilter
}: {
    filter: {
        start_date: string,
        end_date: string,
        code: string,
        machine_id: number | null,
        machine_area_id: number | null,
        keyword: string
    },
    setFilter: (filter: {
        start_date: string,
        end_date: string,
        code: string,
        machine_id: number | null,
        machine_area_id: number | null,
        keyword: string
    }) => void
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState(0);
    const { register, handleSubmit, reset, control, setValue, watch } = useForm<FilterFormData>({
        defaultValues: {
            start_date: filter.start_date,
            end_date: filter.end_date,
            code: filter.code,
            machine_id: null,
            machine_area_id: null,
        }
    });

    const { data: machines } = useFetchData(MachineService.getWithoutPagination, "machines", false);
    const { data: machineAreas } = useFetchData(AreaService.getWithoutPagination, "machineAreas", false);

    const formValues = watch();
    useEffect(() => {
        let count = 0;
        if (formValues.start_date) count++;
        if (formValues.end_date) count++;
        if (formValues.code) count++;
        if (formValues.machine_id) count++;
        if (formValues.machine_area_id) count++;
        setActiveFilters(count);
    }, [formValues]);

    const onSubmit = (data: FilterFormData) => {
        const newFilter = {
            machine_id: data.machine_id?.value || null,
            machine_area_id: data.machine_area_id?.value || null,
            start_date: data.start_date,
            end_date: data.end_date,
            code: data.code,
            keyword: ""
        };
        setFilter(newFilter);
        setIsOpen(false);
    };

    const handleReset = () => {
        reset();
        const emptyFilter = {
            start_date: "",
            end_date: "",
            code: "",
            machine_id: null,
            machine_area_id: null,
            keyword: ""
        };
        setFilter(emptyFilter);
        setIsOpen(false);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDateChange = (selectedDates: Date[], dateStr: string, instance: any) => {
        const inputId = instance.element.id;
        if (inputId === 'start_date') {
            setValue('start_date', dateStr);
        } else if (inputId === 'end_date') {
            setValue('end_date', dateStr);
        }
    };

    const removeFilter = (type: keyof FilterFormData) => {
        setValue(type, type.includes('date') ? '' : null);
        setFilter({
            ...filter,
            [type]: type.includes('date') ? '' : null,
        });
    };

    return (
        <div className="relative">
            <div className="flex items-center gap-2">
                {/* Active Filter Chips */}
                {filter.start_date && (
                    <div className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 rounded-full dark:bg-gray-800">
                        <span>Start: {dateFormat(filter.start_date, 'DD MMM YYYY')}</span>
                        <button
                            onClick={() => removeFilter('start_date')}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            ×
                        </button>
                    </div>
                )}
                {filter.end_date && (
                    <div className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 rounded-full dark:bg-gray-800">
                        <span>End: {dateFormat(filter.end_date, 'DD MMM YYYY')}</span>
                        <button
                            onClick={() => removeFilter('end_date')}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            ×
                        </button>
                    </div>
                )}
                {filter.code && (
                    <div className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 rounded-full dark:bg-gray-800">
                        <span>Search: {filter.code}</span>
                        <button
                            onClick={() => removeFilter('code')}
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
                    {/* {activeFilters} */}
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
                            name="code"
                            onChange={(e) => setValue('code', e.target.value)}
                            register={register("code")}
                        />
                        <DatePicker
                            placeholder='Start Date'
                            label='Start Date'
                            id='start_date'
                            onChange={handleDateChange}
                            mode='single'
                            defaultDate={watch('start_date')}
                        />
                        <DatePicker
                            placeholder='End Date'
                            label='End Date'
                            id='end_date'
                            onChange={handleDateChange}
                            mode='single'
                            defaultDate={watch('end_date')}
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

export default FilterStockOut

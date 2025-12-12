import ComponentCard from '@/components/common/ComponentCard'
import InputLabel from '@/components/form/FormInput'
import Button from '@/components/ui/button/Button'
import React, { useState } from 'react'
import { useFetchData } from '@/hooks/useFetchData'
import MachineService from '@/services/MachineService'
import AreaService from '@/services/CustomerService'
import { Machine } from '@/types/machine'
import { Area } from '@/types/area'
import { useForm } from 'react-hook-form'
import FormSelect2 from '@/components/form/FormSelect2'
import DatePicker from '@/components/form/datePicker'

interface FilterFormData {
    start_date: string;
    end_date: string;
    code: string;
    machine_id: { value: number; label: string } | null;
    machine_area_id: { value: number; label: string } | null;
}

const FilterStockOutOld = ({
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
    const [localFilter, setLocalFilter] = useState({
        start_date: filter.start_date,
        end_date: filter.end_date,
        code: filter.code,
        machine_id: filter.machine_id,
        machine_area_id: filter.machine_area_id,
        keyword: filter.keyword
    });

    const { register, handleSubmit, reset, control, setValue } = useForm<FilterFormData>({
        defaultValues: {
            start_date: localFilter.start_date,
            end_date: localFilter.end_date,
            code: localFilter.code,
            machine_id: null,
            machine_area_id: null,
        }
    });

    const { data: machines } = useFetchData(MachineService.getWithoutPagination, "machines", false);
    const { data: machineAreas } = useFetchData(AreaService.getWithoutPagination, "machineAreas", false);

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
        setLocalFilter(emptyFilter);
        setFilter(emptyFilter);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDateChange = (selectedDates: Date[], dateStr: string, instance: any) => {
        const inputId = instance.element.id;
        if (inputId === 'start_date') {
            setLocalFilter(prev => ({ ...prev, start_date: dateStr }));
            setValue('start_date', dateStr);
        } else if (inputId === 'end_date') {
            setLocalFilter(prev => ({ ...prev, end_date: dateStr }));
            setValue('end_date', dateStr);
        }
    };

    return (
        <>
            <ComponentCard title="Filter" className="mb-4">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-6 gap-4">
                        <InputLabel
                            placeholder="Code"
                            label="Code"
                            name="code"
                            onChange={(e) => setLocalFilter(prev => ({ ...prev, code: e.target.value }))}
                            register={register("code")}
                        />
                        <DatePicker
                            placeholder='Start Date'
                            label='Start Date'
                            id='start_date'
                            mode='single'
                            defaultDate={localFilter.start_date}
                            onChange={handleDateChange}
                        />
                        <DatePicker
                            placeholder='End Date'
                            label='End Date'
                            id='end_date'
                            mode='single'
                            defaultDate={localFilter.end_date}
                            onChange={handleDateChange}
                        />
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
                        {machineAreas && (
                            <FormSelect2
                                label="Area"
                                name="machine_area_id"
                                control={control}
                                options={machineAreas.map((d: Area) => ({
                                    label: d.name,
                                    value: Number(d.id),
                                }))}
                                placeholder="Select Area"
                            />
                        )}

                        <div className="flex flex-wrap gap-2 mt-1">
                            <Button
                                type="reset"
                                onClick={() => handleReset()}
                                className="mt-5 mb-4 px-6"
                                size="sm"
                                variant="outline"
                            >
                                Reset
                            </Button>
                            <Button
                                type="submit"
                                className="mt-5 mb-4 px-6"
                                size="sm"
                                variant="primary"
                            >
                                Filter
                            </Button>
                        </div>
                    </div>
                </form>
            </ComponentCard>
        </>
    )
}

export default FilterStockOutOld

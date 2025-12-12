import ComponentCard from '@/components/common/ComponentCard'
import InputLabel from '@/components/form/FormInput'
import Button from '@/components/ui/button/Button'
import React from 'react'
import { useFetchData } from '@/hooks/useFetchData'
import MachineService from '@/services/MachineService'
import AreaService from '@/services/CustomerService'
import RackService from '@/services/RackService'
import { Machine } from '@/types/machine'
import { Area } from '@/types/area'
import { Rack } from '@/types/rack'
import { useForm } from 'react-hook-form'
import FormSelect2 from '@/components/form/FormSelect2'

interface FilterFormData {
    keyword: string;
    machine_id: { value: number; label: string } | null;
    machine_area_id: { value: number; label: string } | null;
    rack_id: { value: number; label: string } | null;
}

const FilterKanban = ({
    filter,
    setFilter
}: {
    filter: {
        machine_id: number | null,
        machine_area_id: number | null,
        rack_id: number | null,
        keyword: string
    },
    setFilter: (filter: {
        machine_id: number | null,
        machine_area_id: number | null,
        rack_id: number | null,
        keyword: string
    }) => void
}) => {
    const { register, handleSubmit, reset, control } = useForm<FilterFormData>({
        defaultValues: {
            keyword: "",
            machine_id: null,
            machine_area_id: null,
            rack_id: null
        }
    });

    const { data: machines } = useFetchData(MachineService.getWithoutPagination, "machines", false);
    const { data: machineAreas } = useFetchData(AreaService.getWithoutPagination, "machineAreas", false);
    const { data: racks } = useFetchData(RackService.getWithoutPagination, "racks", false);

    const onSubmit = (data: FilterFormData) => {
        setFilter({
            machine_id: data.machine_id?.value || null,
            machine_area_id: data.machine_area_id?.value || null,
            rack_id: data.rack_id?.value || null,
            keyword: data.keyword
        });
    };

    const handleReset = () => {
        reset();
        setFilter({
            machine_id: null,
            machine_area_id: null,
            rack_id: null,
            keyword: ""
        });
    };

    return (
        <>
            <ComponentCard title="Filter" className="mb-4">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-5 gap-4">
                        <InputLabel
                            placeholder="Code"
                            label="Code"
                            name="keyword"
                            onChange={(e) => setFilter({ ...filter, keyword: e.target.value })}
                            register={register("keyword")}
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
                        <div className="flex flex-wrap gap-2 mt-1">
                            <Button
                                type="reset"
                                onClick={() => handleReset()}
                                className="mt-5 mb-4 px-6"
                                size="xs"
                                variant="outline"
                            >
                                Reset
                            </Button>
                            <Button
                                type="submit"
                                className="mt-5 mb-4 px-6"
                                size="xs"
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

export default FilterKanban

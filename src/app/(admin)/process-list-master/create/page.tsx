"use client";

import React, { useMemo, useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import ComponentCard from "@/components/common/ComponentCard";
import scheduleData from "@/data/schedule-detail.json";
import toast from "react-hot-toast";
import InputLabel from "@/components/form/FormInput";
import SelectLabel from "@/components/form/FormSelect";
// import parts from "@/data/part.json";
import Button from "@/components/ui/button/Button";
import processesFallback from "@/data/process.json";
import ProcessListService from "@/services/ProcessListService";
import { useCreateData } from "@/hooks/useCreateData";
import { useFetchData } from "@/hooks/useFetchData";
import PartService from "@/services/PartService";
import CustomerService from "@/services/CustomerService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import ProcessService from "@/services/ProcessService";
import Loading from "@/components/common/Loading";
// OPTIONAL: kalau lo sudah punya service-nya, tinggal uncomment
// import { ProcessListService } from "@/services/process-list.service";

type Step = {
    id: number;       // internal id buat UI
    processId: string; // id process yang dipilih di select (sementara string)
};

type ProcessListItemPayload = {
    customerId: number;
    partId: number;
    order: number;
    processId: number;
};

export default function CreateProcessMaster() {
    const queryClient = useQueryClient();
    const [schedule, setSchedule] = useState(scheduleData);
    const { data: parts, isLoading: partsLoading } = useFetchData(PartService.getWithoutPagination, "parts");
    const { data: customers, isLoading: customersLoading } = useFetchData(CustomerService.getWithoutPagination, "customers");
    const [selectedPartId, setSelectedPartId] = useState<string>("");
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
    const router = useRouter();
    const [steps, setSteps] = useState<Step[]>([
        { id: 1, processId: "" },
    ]);
    const { data: processes, isLoading: processesLoading } = useFetchData(ProcessService.getWithoutPagination, "processes");

    const processOptions = useMemo(() => {
        if (processes && Array.isArray(processes)) return processes;
        return processesFallback;
    }, [processes]);

    if ((partsLoading || customersLoading) && !processOptions) {
        return <Loading />;
    }
    const handleAddStep = () => {
        if (steps.length >= processOptions.length) {
            toast.error("All processes are already used.");
            return;
        }

        setSteps((prev) => [
            ...prev,
            {
                id: prev.length ? prev[prev.length - 1].id + 1 : 1,
                processId: "",
            },
        ]);
    };

    const handleRemoveStep = (id: number) => {
        setSteps((prev) => prev.filter((s) => s.id !== id));
    };

    const handleChangeProcess = (id: number, value: string) => {
        setSteps((prev) =>
            prev.map((s) =>
                s.id === id ? { ...s, processId: value } : s
            )
        );
    };

    const getAvailableProcessesForStep = (stepId: number) => {
        const usedProcessIds = steps
            .filter((s) => s.id !== stepId && s.processId)
            .map((s) => s.processId);

        return processOptions.filter((p) => !usedProcessIds.includes(String(p.id)));
    };

    const partOptions: { label: string; value: string | number }[] = useMemo(() => {
        return (parts ?? []).map((part: any) => ({
            label: part.name + "(" + part.type + ")" + " - " + part.customer?.name,
            value: String(part.id),
        }));
    }, [parts]);



    const handleSubmitProcessList = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedPartId || !selectedCustomerId) {
            toast.error("Part dan customer harus dipilih dulu.");
            return;
        }

        const partIdNum = Number(selectedPartId);
        const customerIdNum = Number(selectedCustomerId);

        if (!Number.isFinite(partIdNum) || !Number.isFinite(customerIdNum)) {
            toast.error("Part atau customer tidak valid.");
            return;
        }

        const invalidStep = steps.some((s) => !s.processId);
        if (invalidStep) {
            toast.error("Semua step harus punya process.");
            return;
        }

        const payload: ProcessListItemPayload[] = steps.map((step, index) => ({
            customerId: customerIdNum,
            partId: partIdNum,
            order: index + 1,
            processId: Number(step.processId),
        }));
        createMutation(payload);
    };

    const { mutate: createMutation, isPending } = useMutation({
        mutationFn: ProcessListService.create,
        onSuccess: () => {
            toast.success("Process List has been sent.");
            queryClient.invalidateQueries({ queryKey: ["process-lists"] });
            router.push("/process-list-master");

        },
        onError: (err) => {
            console.log(err);
            toast.error("Failed to save process list.");
        },
    });


    return (
        <div>
            <Breadcrumb
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Process List Master", href: "/process-list-master" },
                    { label: "Create" }
                ]}
            />

            <div className="grid grid-cols-[28%_1fr] items-start gap-6 mt-6">
                {/* LEFT: Part & Customer Form */}
                <ComponentCard title="Create Process List Master">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            // form kiri ini sekarang cuma buat milih part & customer
                            // submit utama di form kanan (Process List)
                        }}
                        className="space-y-4"
                    >
                        <h3 className="text-lg font-semibold mb-6">
                            Process List Form
                        </h3>
                        <div className="grid gap-4">
                            {partsLoading ? (
                                <p>Loading parts...</p>
                            ) : (
                                <SelectLabel
                                    label="Part"
                                    name="part"
                                    required
                                    placeholder="Select Part"
                                    value={selectedPartId}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                        setSelectedPartId(e.target.value)
                                    }
                                    options={partOptions}
                                />
                            )}

                            {customersLoading ? (
                                <p>Loading customers...</p>
                            ) : (
                                <SelectLabel
                                    label="Customer"
                                    name="customer"
                                    required
                                    placeholder="Select Customer"
                                    value={selectedCustomerId}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                        setSelectedCustomerId(e.target.value)
                                    }
                                    options={(customers ?? []).map((customer) => ({
                                        label: customer.name,
                                        value: String(customer.id),
                                    }))}
                                />
                            )}

                            {/* Optional: tombol di sini kalau mau trigger sesuatu */}
                            <Button
                                type="button"
                                variant="outline"
                                className=""
                                size="sm"
                                onClick={() => {
                                    if (!selectedPartId || !selectedCustomerId) {
                                        toast.error("Pilih part dan customer dulu.");
                                        return;
                                    }
                                    toast.success("Part & customer selected.");
                                }}
                            >
                                Set Part & Customer
                            </Button>
                        </div>
                    </form>
                </ComponentCard>

                {/* RIGHT: Process Steps & Submit ke API */}
                <ComponentCard title="Request Process List Detail">
                    <form onSubmit={handleSubmitProcessList} className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-md font-semibold">
                                Process Steps
                            </h3>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddStep}
                                disabled={steps.length >= processOptions.length}
                            >
                                + Add Step
                            </Button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full border text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="border px-3 py-2 text-left w-40">
                                            Step
                                        </th>
                                        <th className="border px-3 py-2 text-left">
                                            Process
                                        </th>
                                        <th className="border px-3 py-2 text-center w-24">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {steps.map((step, index) => (
                                        <tr key={step.id}>
                                            <td className="border px-3 py-2 align-top">
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-xs text-gray-600">
                                                        Step
                                                    </label>
                                                    <input
                                                        className="w-full border rounded px-2 py-1 text-sm bg-gray-100"
                                                        value={`Step ${index + 1}`}
                                                        readOnly
                                                    />
                                                </div>
                                            </td>
                                            <td className="border px-3 py-2 align-top">
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-xs text-gray-600">
                                                        Process
                                                    </label>
                                                    <select
                                                        className="w-full border rounded px-2 py-1 text-sm"
                                                        value={step.processId}
                                                        onChange={(e) =>
                                                            handleChangeProcess(step.id, e.target.value)
                                                        }
                                                    >
                                                        <option value="">Select Process</option>
                                                        {getAvailableProcessesForStep(step.id).map((p) => (
                                                            <option key={p.id} value={String(p.id)}>
                                                                {p.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="border px-3 py-2 text-center align-top">
                                                {steps.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        className="mt-4"
                                                        variant="danger"
                                                        size="xs"
                                                        onClick={() => handleRemoveStep(step.id)}
                                                    >
                                                        Remove
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                variant="primary"
                                size="sm"
                                disabled={isPending}
                                loading={isPending}
                            >
                                Save Process List
                            </Button>
                        </div>
                    </form>
                </ComponentCard>
            </div>
        </div>
    );
}

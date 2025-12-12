"use client";

import React, { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { EventContentArg } from "@fullcalendar/core";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import Breadcrumb from "@/components/common/Breadcrumb";
import timelineProcess from "@/data/timeline-process.json";
import { getColorsByPoNumber } from "@/utils/color";
import { useFetchData } from "@/hooks/useFetchData";
import ProcessService from "@/services/ProcessService";
import ComponentCard from "@/components/common/ComponentCard";
import SelectLabel from "@/components/form/FormSelect";
import { useQuery } from "@tanstack/react-query";
import ScheduleService from "@/services/ScheduleService";

interface ProcessDetail {
    partName: string;
    quantity: number;
    poNumber: string;
}

interface ScheduleItem {
    date: string;
    processDetail: ProcessDetail[];
}

interface TimelineData {
    processName: string;
    dataList: ScheduleItem[];
}

const dummyScheduleData: Record<
    number,
    { date: string; quantity: number; partName: string; poNumber: string }[]
> = timelineProcess;



const renderEventContent = (eventInfo: EventContentArg) => {
    const qty = eventInfo.event.extendedProps.quantity;
    const partName = eventInfo.event.extendedProps.partName;
    const poNumber = eventInfo.event.extendedProps.poNumber;
    const colors = getColorsByPoNumber(poNumber);
    return (
        <div
            className="flex flex-col items-center justify-center p-2 rounded-lg shadow-sm w-full"
            style={{
                backgroundColor: colors.bg,
                color: colors.text,
                minHeight: "48px",
            }}
        >
            <span className="text-lg font-bold">{qty.toLocaleString()}</span>
            <span className="text-xs opacity-90">PO : {poNumber}</span>
            <span className="text-xs opacity-90">{partName}</span>
        </div>
    );
};

export default function ProcessCalendarPage() {
    const [processId, setProcessId] = useState<number>(0);
    const { isOpen, openModal, closeModal } = useModal();
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedDateDetails, setSelectedDateDetails] = useState<ProcessDetail[]>([]);

    const { data: processes } = useFetchData(ProcessService.getWithoutPagination, "processes", false);
    const { data: timelinesData } = useQuery<TimelineData>({
        queryKey: ["timelines", processId],
        queryFn: async () => {
            const response = await ScheduleService.getByProcessId(processId);
            return response.data as TimelineData;
        },
        enabled: !!processId,
    });

    const timelines = timelinesData ?? null;

    const handleProcessChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = parseInt(e.target.value) || 0;
        setProcessId(val);
    };

    const handleDateClick = (info: DateClickArg) => {
        const dateStr = info.dateStr;
        setSelectedDate(dateStr);

        // Find the schedule data for this date
        const scheduleData = timelines?.dataList ?? [];
        const dateItem = scheduleData.find(item => item.date?.split("T")[0] === dateStr);

        if (dateItem && Array.isArray(dateItem.processDetail)) {
            setSelectedDateDetails(dateItem.processDetail);
        } else {
            setSelectedDateDetails([]);
        }
        openModal();
    };

    const processInfo = useMemo(() => {
        return processes?.find((p) => p.id === processId) || { id: 0, name: "Unknown", type: "" };
    }, [processId, processes]);

    const selectedDateTotal = useMemo(() => {
        return selectedDateDetails.reduce((sum, d) => sum + (d.quantity || 0), 0);
    }, [selectedDateDetails]);


    const events = useMemo(() => {
        const scheduleData = timelines?.dataList ?? []

        if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
            return [];
        }

        const result = scheduleData.flatMap((item: any, idxDate: number) => {
            const dateStr = item.date?.split("T")[0];
            const date = new Date(item.date);
            const dayOfWeek = date.getDay();

            if (dayOfWeek === 0 || dayOfWeek === 6) {
                return [];
            }

            const details = Array.isArray(item.processDetail) ? item.processDetail : [];

            return details.map((d: any, idxDetail: number) => ({
                id: `event-${processId}-${idxDate}-${idxDetail}`,
                title: `${d.partName} — ${d.quantity}`,
                start: dateStr,
                allDay: true,
                extendedProps: {
                    quantity: d.quantity,
                    partName: d.partName,
                    poNumber: d.poNumber?.split(" ")[0] ?? "",
                    processName: timelines?.processName ?? null,
                },
            }));
        });

        return result;
    }, [timelines, processId]);


    const totalQuantity = useMemo(() => {
        const scheduleData = timelines?.dataList ?? timelines ?? [];
        if (!Array.isArray(scheduleData)) return 0;

        return scheduleData.reduce((sum, item) => {
            const details = Array.isArray(item.processDetail) ? item.processDetail : [];
            return sum + details.reduce((s, d) => s + (d.quantity || 0), 0);
        }, 0);
    }, [timelines]);


    return (
        <>
            <Breadcrumb
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Timelines", href: "#" },
                    { label: processInfo.name, href: `/timeline-process?process=${processId}` },
                ]}
            />

            <ComponentCard title="Select Process" className="mb-5">
                {processes && (
                    <SelectLabel
                        name="process"
                        label="Process"
                        required
                        options={processes.map((item: any) => ({ label: item.name, value: String(item.id) }))}
                        value={String(processId)}
                        onChange={handleProcessChange}
                    />
                )}
            </ComponentCard>


            <div className="space-y-6">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                {processInfo.name}
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">
                                Timeline calendar showing daily production quantity
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <div className="rounded-lg bg-emerald-50 px-4 py-2">
                                <p className="text-xs text-emerald-600 font-medium">Total Quantity</p>
                                <p className="text-xl font-bold text-emerald-700">
                                    {totalQuantity.toLocaleString()}
                                </p>
                            </div>
                            <div className="rounded-lg bg-blue-50 px-4 py-2">
                                <p className="text-xs text-blue-600 font-medium">Process Type</p>
                                <p className="text-xl font-bold text-blue-700">
                                    {processInfo.type || "-"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="process-calendar">
                        <FullCalendar
                            plugins={[dayGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            initialDate={new Date().toISOString().split("T")[0]}
                            headerToolbar={{
                                left: "prev,next today",
                                center: "title",
                                right: "dayGridMonth,dayGridWeek",
                            }}
                            events={events}
                            eventContent={renderEventContent}
                            dateClick={handleDateClick}
                            height="auto"
                            dayMaxEvents={3}
                            fixedWeekCount={false}
                        />
                    </div>
                </div>

            </div>

            {/* Modal for date details */}
            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] p-0">
                <div className="p-6 pt-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">
                                Schedule Details
                            </h2>
                            <p className="text-sm text-slate-500">
                                {selectedDate &&
                                    new Date(selectedDate).toLocaleDateString("id-ID", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end mb-4">
                        <div className="text-right">
                            <p className="text-sm text-slate-500">Total Production</p>
                            <p className="text-2xl font-bold text-emerald-600">
                                {selectedDateTotal.toLocaleString()} pcs
                            </p>
                        </div>
                    </div>

                    {selectedDateDetails.length > 0 ? (
                        <div className="rounded-lg border border-slate-200 overflow-hidden">
                            <div
                                className="px-4 py-3 flex items-center justify-between bg-blue-500"
                            >
                                <h3 className="font-semibold text-white">
                                    {processInfo.name}
                                </h3>
                                <span className="font-bold text-lg text-white">
                                    {selectedDateTotal.toLocaleString()} pcs
                                </span>
                            </div>
                            <div className="p-3">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-slate-500 border-b border-slate-100">
                                            <th className="pb-2 font-medium">PO Number</th>
                                            <th className="pb-2 font-medium">Part</th>
                                            <th className="pb-2 font-medium text-right">Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedDateDetails.map((item, idx) => {
                                            const poColors = getColorsByPoNumber(item.poNumber?.split(" ")[0] ?? "");
                                            return (
                                                <tr
                                                    key={idx}
                                                    className="border-b border-slate-50"
                                                >
                                                    <td className="py-2">
                                                        <span
                                                            className="px-2 py-0.5 rounded text-xs font-medium"
                                                            style={{
                                                                backgroundColor: poColors.bg,
                                                                color: poColors.text,
                                                            }}
                                                        >
                                                            {item.poNumber?.split(" ")[0] ?? "-"}
                                                        </span>
                                                    </td>
                                                    <td className="py-2 text-slate-700">
                                                        {item.partName}
                                                    </td>
                                                    <td className="py-2 text-right font-semibold text-slate-800">
                                                        {item.quantity.toLocaleString()}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-slate-400 mb-4">
                                <svg
                                    className="w-16 h-16 mx-auto"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-700">
                                No Schedule
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                                There is no production schedule for this date.
                            </p>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={closeModal}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal>

            <style jsx global>{`
                .process-calendar .fc {
                font-family: inherit;
                }
                .process-calendar .fc-toolbar-title {
                font-size: 1.25rem !important;
                font-weight: 700;
                color: #1e293b;
                }
                .process-calendar .fc-button {
                background: #3b82f6 !important;
                border: none !important;
                box-shadow: none !important;
                font-weight: 500 !important;
                text-transform: capitalize !important;
                }
                .process-calendar .fc-button:hover {
                background: #2563eb !important;
                }
                .process-calendar .fc-button-active {
                background: #1d4ed8 !important;
                }
                .process-calendar .fc-daygrid-day-number {
                font-weight: 600;
                color: #475569;
                }
                .process-calendar .fc-day-today {
                background: #dbeafe !important;
                }
                .process-calendar .fc-event {
                border: none !important;
                background: transparent !important;
                }
                .process-calendar .fc-daygrid-event {
                margin: 2px 4px !important;
                }
                .process-calendar .fc-daygrid-day {
                cursor: pointer;
                }
                .process-calendar .fc-daygrid-day:hover {
                background: #f1f5f9;
                }
      `}
            </style>
        </>
    );
}

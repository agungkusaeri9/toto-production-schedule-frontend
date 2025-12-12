"use client";

import React, { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { EventContentArg } from "@fullcalendar/core";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { getColorsByPoNumber } from "@/utils/color";
import { useQuery } from "@tanstack/react-query";
import ScheduleService from "@/services/ScheduleService";
import { PALETTE_COLOR } from "@/utils/palette_color";

type ScheduleItem = {
    date: string;
    quantity: number;
    partName: string;
    poNumber: string;
};

type ProcessDataItem = {
    processName: string;
    dataList: {
        date: string;
        processDetail: {
            partName: string;
            quantity: number;
            poNumber: string;
        }[];
    }[];
};

// Get process color based on index using PALETTE_COLOR
const getProcessColor = (index: number): { bg: string; text: string } => {
    const bg = PALETTE_COLOR[index % PALETTE_COLOR.length];
    // Use white text for dark colors, black for light colors
    const isLightColor = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5;
    };
    return { bg, text: isLightColor(bg) ? "#000000" : "#ffffff" };
};

// Aggregate all schedule data by date and process from API response
const aggregateByDateAndProcess = (processData: ProcessDataItem[] | undefined) => {
    const aggregated: Record<
        string,
        Record<string, { totalQty: number; items: ScheduleItem[]; processIndex: number }>
    > = {};

    if (!processData) return aggregated;

    processData.forEach((process, processIndex) => {
        const processName = process.processName;

        process.dataList?.forEach((dateItem) => {
            const dateStr = dateItem.date.split("T")[0]; // Extract date part only

            if (!aggregated[dateStr]) {
                aggregated[dateStr] = {};
            }
            if (!aggregated[dateStr][processName]) {
                aggregated[dateStr][processName] = { totalQty: 0, items: [], processIndex };
            }

            dateItem.processDetail?.forEach((detail) => {
                aggregated[dateStr][processName].totalQty += detail.quantity;
                aggregated[dateStr][processName].items.push({
                    date: dateStr,
                    quantity: detail.quantity,
                    partName: detail.partName,
                    poNumber: detail.poNumber?.split(" ")[0] ?? "",
                });
            });
        });
    });

    return aggregated;
};

// Build calendar events from aggregated data
const buildCalendarEvents = (processData: ProcessDataItem[] | undefined) => {
    const aggregated = aggregateByDateAndProcess(processData);
    const events: {
        id: string;
        title: string;
        start: string;
        allDay: boolean;
        extendedProps: {
            processIndex: number;
            processName: string;
            totalQty: number;
            items: ScheduleItem[];
        };
    }[] = [];

    Object.entries(aggregated).forEach(([date, processesData]) => {
        Object.entries(processesData).forEach(([processName, data]) => {
            // Skip weekends
            const dateObj = new Date(date);
            const dayOfWeek = dateObj.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) return;

            events.push({
                id: `${date}-${processName}`,
                title: `${processName}: ${data.totalQty}`,
                start: date,
                allDay: true,
                extendedProps: {
                    processIndex: data.processIndex,
                    processName: processName,
                    totalQty: data.totalQty,
                    items: data.items,
                },
            });
        });
    });

    return events;
};

const renderEventContent = (eventInfo: EventContentArg) => {
    const { processIndex, totalQty, processName } = eventInfo.event.extendedProps;
    const colors = getProcessColor(processIndex);

    return (
        <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs cursor-pointer hover:opacity-90 transition-opacity"
            style={{
                backgroundColor: colors.bg,
                color: colors.text,
            }}
        >
            <span className="font-medium truncate">{processName}</span>
            <span className="font-bold">{totalQty.toLocaleString()}</span>
        </div>
    );
};

export default function DailyScheduleCalendarPage() {
    const { isOpen, openModal, closeModal } = useModal();
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedDateData, setSelectedDateData] = useState<
        { processIndex: number; processName: string; totalQty: number; items: ScheduleItem[] }[]
    >([]);

    const { data: processData } = useQuery({
        queryKey: ["processData"],
        queryFn: async () => {
            const response = await ScheduleService.getByProcess();
            return response.data as ProcessDataItem[];
        },
    });

    const events = useMemo(() => buildCalendarEvents(processData), [processData]);
    const aggregatedData = useMemo(() => aggregateByDateAndProcess(processData), [processData]);

    const handleDateClick = (info: DateClickArg) => {
        const date = info.dateStr;
        setSelectedDate(date);

        const dateData = aggregatedData[date];
        if (dateData) {
            const processesForDate = Object.entries(dateData).map(
                ([processName, data]) => ({
                    processIndex: data.processIndex,
                    processName: processName,
                    totalQty: data.totalQty,
                    items: data.items,
                })
            );
            setSelectedDateData(processesForDate);
        } else {
            setSelectedDateData([]);
        }
        openModal();
    };

    const totalForDate = useMemo(() => {
        return selectedDateData.reduce((sum, p) => sum + p.totalQty, 0);
    }, [selectedDateData]);

    return (
        <>
            <Breadcrumb
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Daily Schedule", href: "/daily-schedule" },
                ]}
            />

            <div className="space-y-6">
                {/* Header */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                Daily Schedule Calendar
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">
                                View production schedule for all processes. Click on a date to see details.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Process Legend</h3>
                    <div className="flex flex-wrap gap-2">
                        {processData?.slice(0, 10).map((process, idx) => {
                            const colors = getProcessColor(idx);
                            return (
                                <div
                                    key={process.processName}
                                    className="flex items-center gap-1.5 text-xs"
                                >
                                    <span
                                        className="w-3 h-3 rounded"
                                        style={{ backgroundColor: colors.bg }}
                                    ></span>
                                    <span className="text-slate-600">{process.processName}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Calendar */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="daily-schedule-calendar">
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
                            dayMaxEvents={5}
                            moreLinkText={(num) => `+${num} more`}
                            fixedWeekCount={false}
                        />
                    </div>
                </div>
            </div>

            {/* Modal for date details */}
            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[800px] p-0">
                <div className="p-6">
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
                        <div className="text-right">
                            <p className="text-sm text-slate-500">Total Production</p>
                            <p className="text-2xl font-bold text-emerald-600">
                                {totalForDate.toLocaleString()} pcs
                            </p>
                        </div>
                    </div>

                    {selectedDateData.length > 0 ? (
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                            {selectedDateData.map((pData) => {
                                const colors = getProcessColor(pData.processIndex);
                                return (
                                    <div
                                        key={pData.processName}
                                        className="rounded-lg border border-slate-200 overflow-hidden"
                                    >
                                        <div
                                            className="px-4 py-3 flex items-center justify-between"
                                            style={{ backgroundColor: colors.bg }}
                                        >
                                            <h3
                                                className="font-semibold"
                                                style={{ color: colors.text }}
                                            >
                                                {pData.processName}
                                            </h3>
                                            <span
                                                className="font-bold text-lg"
                                                style={{ color: colors.text }}
                                            >
                                                {pData.totalQty.toLocaleString()} pcs
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
                                                    {pData.items.map((item: ScheduleItem, idx: number) => {
                                                        const poColors = getColorsByPoNumber(item.poNumber);
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
                                                                        {item.poNumber}
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
                                );
                            })}
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
                .daily-schedule-calendar .fc {
                    font-family: inherit;
                }
                .daily-schedule-calendar .fc-toolbar-title {
                    font-size: 1.25rem !important;
                    font-weight: 700;
                    color: #1e293b;
                }
                .daily-schedule-calendar .fc-button {
                    background: #3b82f6 !important;
                    border: none !important;
                    box-shadow: none !important;
                    font-weight: 500 !important;
                    text-transform: capitalize !important;
                }
                .daily-schedule-calendar .fc-button:hover {
                    background: #2563eb !important;
                }
                .daily-schedule-calendar .fc-button-active {
                    background: #1d4ed8 !important;
                }
                .daily-schedule-calendar .fc-daygrid-day-number {
                    font-weight: 600;
                    color: #475569;
                }
                .daily-schedule-calendar .fc-day-today {
                    background: #dbeafe !important;
                }
                .daily-schedule-calendar .fc-event {
                    border: none !important;
                    background: transparent !important;
                    margin: 1px 2px !important;
                }
                .daily-schedule-calendar .fc-daygrid-day {
                    cursor: pointer;
                }
                .daily-schedule-calendar .fc-daygrid-day:hover {
                    background: #f1f5f9;
                }
                .daily-schedule-calendar .fc-more-link {
                    color: #3b82f6;
                    font-weight: 600;
                }
            `}</style>
        </>
    );
}

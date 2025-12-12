"use client";

import React, { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { EventContentArg } from "@fullcalendar/core";
import Breadcrumb from "@/components/common/Breadcrumb";
import processes from "@/data/process.json";
import timelineProcess from "@/data/timeline-process.json";
import { getColorsByPoNumber } from "@/utils/color";

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
    const searchParams = useSearchParams();
    const processId = parseInt(searchParams.get("process") || "1", 10);

    const processInfo = useMemo(() => {
        return processes.find((p) => p.id === processId) || { id: 0, name: "Unknown", type: "" };
    }, [processId]);

    const events = useMemo(() => {
        const scheduleData = dummyScheduleData[processId] || [];
        return scheduleData.map((item, idx) => ({
            id: `event-${processId}-${idx}`,
            title: `${item.quantity}`,
            start: item.date,
            allDay: true,
            extendedProps: {
                quantity: item.quantity,
                partName: item.partName,
                poNumber: item.poNumber,
            },
        }));
    }, [processId]);

    const totalQuantity = useMemo(() => {
        return (dummyScheduleData[processId] || []).reduce(
            (sum, item) => sum + item.quantity,
            0
        );
    }, [processId]);


    return (
        <>
            <Breadcrumb
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Timelines", href: "#" },
                    { label: processInfo.name, href: `/timeline-process?process=${processId}` },
                ]}
            />

            <div className="space-y-6">
                {/* Header */}
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

                {/* Calendar */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="process-calendar">
                        <FullCalendar
                            plugins={[dayGridPlugin]}
                            initialView="dayGridMonth"
                            initialDate={new Date().toISOString().split("T")[0]}
                            headerToolbar={{
                                left: "prev,next today",
                                center: "title",
                                right: "dayGridMonth,dayGridWeek",
                            }}
                            events={events}
                            eventContent={renderEventContent}
                            height="auto"
                            dayMaxEvents={3}
                            fixedWeekCount={false}
                            datesSet={(info) => {
                                console.log("View changed!");
                                console.log("Start:", info.start);
                                console.log("End:", info.end);
                                console.log("Current View:", info.view.type);
                            }}
                        />
                    </div>
                </div>

            </div>

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
      `}
            </style>
        </>
    );
}

"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Loading from "@/components/common/Loading";
import { useQuery } from "@tanstack/react-query";
import ProductionTimelineService from "@/services/ProductionTimelineService";
import { TimelineScheduleDetail, TimelineData } from "@/types/productionTimeline";
import { format, addDays, startOfDay, startOfHour, addHours, differenceInHours, differenceInDays } from "date-fns";
import Button from "@/components/ui/button/Button";
import { X } from "lucide-react";

type ZoomLevel = "1hour" | "3hour" | "5hour" | "12hour" | "day";

const PIXELS_PER_HOUR_1H = 60;
const PIXELS_PER_HOUR_3H = 30; // Compressed view
const PIXELS_PER_HOUR_5H = 20; // More compressed view
const PIXELS_PER_HOUR_12H = 10;
const PIXELS_PER_HOUR_DAY = 5; // 24 * 5 = 120px per day

export default function ProductionTimelinePage() {
    const [zoomLevel, setZoomLevel] = useState<ZoomLevel>("1hour");

    // Popover State
    const [popover, setPopover] = useState<{
        isOpen: boolean;
        x: number;
        y: number;
        data: TimelineScheduleDetail | null;
        modelName: string;
    }>({ isOpen: false, x: 0, y: 0, data: null, modelName: "" });

    const popoverRef = useRef<HTMLDivElement>(null);

    // Close popover when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setPopover(prev => ({ ...prev, isOpen: false }));
            }
        };

        if (popover.isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [popover.isOpen]);

    const { data: timelineData, isLoading } = useQuery<TimelineData>({
        queryKey: ["production-timeline"],
        queryFn: ProductionTimelineService.get,
    });

    const PIXELS_PER_HOUR = useMemo(() => {
        switch (zoomLevel) {
            case "1hour": return PIXELS_PER_HOUR_1H;
            case "3hour": return PIXELS_PER_HOUR_3H;
            case "5hour": return PIXELS_PER_HOUR_5H;
            case "12hour": return PIXELS_PER_HOUR_12H;
            case "day": return PIXELS_PER_HOUR_DAY;
            default: return PIXELS_PER_HOUR_1H;
        }
    }, [zoomLevel]);

    // 1. Calculate Time Range (Dynamic based on data)
    const { startDate, endDate, totalHours, days } = useMemo(() => {
        if (!timelineData || !timelineData.data || timelineData.data.length === 0) {
            const now = startOfHour(new Date());
            const end = addDays(now, 7);
            return { startDate: now, endDate: end, totalHours: 7 * 24, days: Array.from({ length: 7 }, (_, i) => addDays(now, i)) };
        }

        let minTime = Number.MAX_VALUE;
        let maxTime = 0;
        let hasValidDates = false;

        timelineData.data.forEach((model) => {
            if (model.scheduleDetails) {
                model.scheduleDetails.forEach((detail) => {
                    const start = new Date(detail.startTime).getTime();
                    const end = new Date(detail.finishTime).getTime();

                    if (!isNaN(start) && start > 946684800000) { // Jan 1 2000
                        if (start < minTime) minTime = start;
                        if (end > maxTime) maxTime = end;
                        hasValidDates = true;
                    }
                });
            }
        });

        if (!hasValidDates) {
            const now = startOfDay(new Date());
            const end = addDays(now, 7);
            return { startDate: now, endDate: end, totalHours: 7 * 24, days: Array.from({ length: 7 }, (_, i) => addDays(now, i)) };
        }

        // Use Start of Data Hour as visual start
        const start = startOfDay(new Date(minTime));
        // Use End of Data (rounded up to next hour + buffer) as visual end
        // Let's add at least 1 day buffer or end at the end of the last day
        let end = new Date(maxTime);
        if (end <= start) {
            end = addDays(start, 7);
        } else {
            // Round up to cover the full duration + some buffer
            // Actually, the user said "ngambil paling akhir end date", meaning take the latest end date
            // We'll calculate total full days needed
            const daysDiff = differenceInDays(end, start) + 1; // +1 to cover the last partial day
            end = addDays(start, Math.max(daysDiff, 1));
        }

        const totalHours = differenceInHours(end, start);
        const dayCount = Math.ceil(totalHours / 24);

        // Generate Days Array
        const daysArr = [];
        let current = new Date(start);
        for (let i = 0; i < dayCount; i++) {
            daysArr.push(new Date(current));
            current = addDays(current, 1);
        }

        return { startDate: start, endDate: end, totalHours: dayCount * 24, days: daysArr };
    }, [timelineData]);

    const handleBarClick = (e: React.MouseEvent, detail: TimelineScheduleDetail, modelName: string) => {
        e.stopPropagation(); // Prevent immediate close
        const rect = e.currentTarget.getBoundingClientRect();

        // Calculate position (centered above the bar)
        // We'll trust fixed positioning relative to viewport
        const x = rect.left + (rect.width / 2);
        const y = rect.top;

        setPopover({
            isOpen: true,
            x,
            y,
            data: detail,
            modelName
        });
    };

    if (isLoading) return <Loading />;
    if (!timelineData) return <div>No data found or failed to load.</div>;

    const totalWidth = totalHours * PIXELS_PER_HOUR;

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] relative">
            <Breadcrumb
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Production Timeline By Model" },
                ]}
            />

            <div className="bg-white p-4 border border-gray-200 rounded-t-lg border-b-0 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Production Timeline By Model</h2>
                <div className="flex gap-2">
                    <Button
                        size="xs"
                        variant={zoomLevel === "1hour" ? "primary" : "secondary"}
                        onClick={() => setZoomLevel("1hour")}
                    >
                        1 Hour
                    </Button>
                    <Button
                        size="xs"
                        variant={zoomLevel === "3hour" ? "primary" : "secondary"}
                        onClick={() => setZoomLevel("3hour")}
                    >
                        3 Hours
                    </Button>
                    <Button
                        size="xs"
                        variant={zoomLevel === "5hour" ? "primary" : "secondary"}
                        onClick={() => setZoomLevel("5hour")}
                    >
                        5 Hours
                    </Button>
                    <Button
                        size="xs"
                        variant={zoomLevel === "12hour" ? "primary" : "secondary"}
                        onClick={() => setZoomLevel("12hour")}
                    >
                        12 Hours
                    </Button>
                    <Button
                        size="xs"
                        variant={zoomLevel === "day" ? "primary" : "secondary"}
                        onClick={() => setZoomLevel("day")}
                    >
                        Day
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden border border-gray-200 rounded-b-lg bg-white flex flex-col">
                {/* Scrollable Container */}
                <div className="flex-1 overflow-auto relative">
                    <div className="flex" style={{ minWidth: "100%" }}>

                        {/* LEFT SIDEBAR (Not Sticky) */}
                        <div className="w-[250px] bg-white border-r border-gray-200 shadow-md flex-shrink-0">
                            <div className="h-[80px] border-b border-gray-200 bg-gray-50 flex items-center sticky top-0 z-30 font-semibold text-gray-700 text-sm">
                                <div className="w-[100px] px-2 text-center border-r border-gray-200 h-full flex items-center justify-center">Model</div>
                                <div className="flex-1 px-4 h-full flex items-center justify-center">Work Center</div>
                            </div>
                            <div className="bg-white">
                                {timelineData.data?.filter(m => m.scheduleDetails && m.scheduleDetails.length > 0).map((model, mIdx) => (
                                    <div key={mIdx} className="flex border-b border-gray-200">
                                        {/* Model Column */}
                                        <div className="w-[100px] bg-blue-50 border-r border-gray-100 flex items-center justify-center p-2 text-xs font-bold text-gray-700 text-center break-words">
                                            {model.modelName}
                                        </div>
                                        {/* Details Column (Parts only) */}
                                        <div className="flex-1">
                                            {model.scheduleDetails?.map((detail, dIdx) => (
                                                <div
                                                    key={detail.id}
                                                    className={`h-[40px] px-4 py-1 flex items-center text-sm gap-2 ${dIdx !== model.scheduleDetails.length - 1 ? 'border-b border-gray-100' : ''}`}
                                                >
                                                    <div className="text-gray-700 text-xs flex-1 truncate font-medium" title={detail.workCenterName}>{detail.workCenterName}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* TIMELINE AREA */}
                        <div className="flex-1 relative" style={{ width: Math.max(totalWidth, 100) }}>

                            {/* Header (Sticky Top) */}
                            <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 flex h-[80px]" style={{ width: totalWidth }}>
                                {days.map((day, dIdx) => (
                                    <div key={dIdx} className="flex-shrink-0 relative border-r border-gray-300 flex flex-col" style={{ width: 24 * PIXELS_PER_HOUR }}>
                                        {/* Day Row */}
                                        <div className="h-[40px] relative border-b border-gray-200 w-full bg-gray-100">
                                            <div className="sticky left-0 px-2 h-full flex items-center text-xs font-bold text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
                                                {format(day, "EEE, MMM d")}
                                            </div>
                                        </div>

                                        {/* Hours Row */}
                                        <div className="flex-1 flex h-[40px]">
                                            {Array.from({ length: 24 }).map((_, h) => {
                                                const showLabel =
                                                    zoomLevel === "1hour" ||
                                                    (zoomLevel === "3hour" && h % 3 === 0) ||
                                                    (zoomLevel === "5hour" && h % 5 === 0) ||
                                                    (zoomLevel === "12hour" && h % 12 === 0);

                                                // For Day view, we don't show hour labels in the hour row, maybe just the first one?
                                                // Or honestly, for Day view, the top row is enough.

                                                const hourDate = addHours(day, h);
                                                return (
                                                    <div
                                                        key={h}
                                                        className={`flex-shrink-0 border-r border-gray-200 flex items-center justify-center text-[10px] text-gray-500 font-medium ${zoomLevel === "3hour" && h % 3 !== 0
                                                            ? 'border-gray-100'
                                                            : (zoomLevel === "5hour" && h % 5 !== 0
                                                                ? 'border-gray-100'
                                                                : (zoomLevel === "12hour" && h % 12 !== 0
                                                                    ? 'border-gray-100'
                                                                    : (zoomLevel === "day" && h % 24 !== 0
                                                                        ? 'border-gray-100' // Make lines very faint for day view
                                                                        : 'border-gray-200')
                                                                )
                                                            )
                                                            }`}
                                                        style={{ width: PIXELS_PER_HOUR }}
                                                    >
                                                        {zoomLevel !== "day" && showLabel ? format(hourDate, "HH") : ''}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Grid Body */}
                            <div className="relative">
                                {/* Grid Lines Background */}
                                <div className="absolute inset-0 flex pointer-events-none z-0">
                                    {days.map((_, dIdx) => (
                                        <div key={dIdx} className="flex-shrink-0 flex border-r border-gray-100" style={{ width: 24 * PIXELS_PER_HOUR }}>
                                            {Array.from({ length: 24 }).map((_, h) => (
                                                <div
                                                    key={h}
                                                    className={`flex-shrink-0 border-r h-full ${(zoomLevel === "3hour" && h % 3 === 0) ||
                                                        (zoomLevel === "5hour" && h % 5 === 0) ||
                                                        (zoomLevel === "12hour" && h % 12 === 0) ||
                                                        zoomLevel === "1hour"
                                                        ? 'border-gray-200 opacity-50'
                                                        : 'border-gray-100 opacity-30'
                                                        }`}
                                                    style={{ width: PIXELS_PER_HOUR }}
                                                ></div>
                                            ))}
                                        </div>
                                    ))}
                                </div>

                                {/* Bars */}
                                {timelineData.data?.filter(m => m.scheduleDetails && m.scheduleDetails.length > 0).map((model, mIdx) => (
                                    <React.Fragment key={mIdx}>
                                        {/* Matches sidebar grouping */}

                                        {/* Detail Bars */}
                                        {model.scheduleDetails?.map((detail) => {
                                            const start = new Date(detail.startTime).getTime();
                                            const end = new Date(detail.finishTime).getTime();

                                            if (isNaN(start) || isNaN(end)) return <div key={detail.id} className="h-[40px] border-b border-gray-100"></div>;

                                            const durationMinutes = (end - start) / (1000 * 60);
                                            const offsetMinutes = (start - startDate.getTime()) / (1000 * 60);

                                            const left = (offsetMinutes / 60) * PIXELS_PER_HOUR;
                                            const width = (durationMinutes / 60) * PIXELS_PER_HOUR;

                                            // Don't render if completely out of 7-day view
                                            // 7 days * 24 hours * pixels
                                            if (left > totalWidth || (left + width) < 0) return <div key={detail.id} className="h-[40px] border-b border-gray-100"></div>;


                                            return (
                                                <div key={detail.id} className="h-[40px] relative border-b border-gray-100 z-10 w-full pointer-events-none">
                                                    <div
                                                        className="absolute top-1 bottom-1 rounded shadow-sm border flex items-center px-2 text-white text-xs overflow-hidden whitespace-nowrap transition-colors cursor-pointer pointer-events-auto bg-blue-500 border-blue-600 hover:bg-blue-600"
                                                        style={{ left: `${Math.max(0, left)}px`, width: `${Math.max(1, width)}px` }}
                                                        title={`Model: ${model.modelName}\nWork Center: ${detail.workCenterName}\nStart: ${format(new Date(detail.startTime), "HH:mm")}\nEnd: ${format(new Date(detail.finishTime), "HH:mm")}`}
                                                        onClick={(e) => handleBarClick(e, detail, model.modelName)}
                                                    >
                                                        {width > 20 && detail.workCenterName}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </React.Fragment>
                                ))}
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Popover Card */}
            {popover.isOpen && popover.data && (
                <div
                    ref={popoverRef}
                    className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-[300px] text-sm animate-in fade-in zoom-in-95 duration-200"
                    style={{
                        left: popover.x,
                        top: popover.y,
                        transform: "translate(-50%, -100%) translateY(-10px)" // Centered horizontally, moved above
                    }}
                >
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-gray-200 rotate-45 shadow-sm"></div>

                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <h3 className="font-bold text-gray-800">{popover.modelName}</h3>
                        <button
                            onClick={() => setPopover(prev => ({ ...prev, isOpen: false }))}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="space-y-2 relative z-10">
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-500">Work Center</span>
                            <span className="font-medium text-gray-800">{popover.data.workCenterName}</span>
                        </div>
                        {popover.data.quantity && (
                            <div className="flex justify-between border-b border-gray-100 pb-1">
                                <span className="text-gray-500">Quantity</span>
                                <span className="font-medium text-gray-800">{popover.data.quantity.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-500">Start</span>
                            <span className="font-medium text-gray-800">{format(new Date(popover.data.startTime), "d MMM HH:mm")}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-500">End</span>
                            <span className="font-medium text-gray-800">{format(new Date(popover.data.finishTime), "d MMM HH:mm")}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

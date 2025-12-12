"use client";

import React, { HTMLAttributes, useEffect, useMemo, useState } from "react";
import Timeline, { TimelineHeaders, DateHeader, TimelineItemBase } from "react-calendar-timeline";
import moment from "moment";
import "react-calendar-timeline/dist/style.css";

import Breadcrumb from "@/components/common/Breadcrumb";
import DatePicker from "@/components/form/datePicker";
import Button from "@/components/ui/button/Button";
import Loading from "@/components/common/Loading";
import { useQuery } from "@tanstack/react-query";
import ScheduleService from "@/services/ScheduleService";



type ProcessDetail = {
    order: number;
    processName: string;
    targetQtyPerDay: number;
    targetQtyTotal: number;
    dates: string[];
};

type ApiSchedule = {
    scheduleId?: number;
    id?: number;
    target?: string;
    qty?: number;
    quantity?: number;
    part?: { name?: string; type?: string };
    partName?: string;
    partType?: string;
    customer?: { name?: string };
    customerName?: string;
    schedulesDetails?: ProcessDetail[];
    scheduleDetails?: ProcessDetail[];
};

type ScheduleData = ApiSchedule;
type TimelineItemType = TimelineItemBase<number> & { meta: ProcessDetail };

const buildGroups = (details: ProcessDetail[]) =>
    details?.map((proc) => ({
        id: proc.order,
        title: `${proc.order}. ${proc.processName}`,
    }));

const buildItems = (details: ProcessDetail[]): TimelineItemType[] => {
    const items: TimelineItemType[] = [];

    details?.forEach((proc, idx) => {
        const dates = (proc.dates ?? [])
            .map((d) => moment(d))
            .filter((m) => m.isValid());

        dates.forEach((day, localId) => {
            const dayStart = day.clone().startOf("day").add(4, "hours");
            const dayEnd = day.clone().startOf("day").add(20, "hours");

            items.push({
                id: Number(`${idx + 1}${localId}`),
                group: proc.order,
                title: proc.processName,
                start_time: dayStart.valueOf(),
                end_time: dayEnd.valueOf(),
                canMove: false,
                canResize: false,
                itemProps: {
                    "data-process": proc.processName,
                } as HTMLAttributes<HTMLDivElement>,
                meta: proc,
            });
        });
    });

    return items;
};

const getRange = (details: ProcessDetail[]) => {
    const starts = (details ?? [])
        .map((d) => moment(d.dates?.[0]))
        .filter((m) => m.isValid());
    const ends = (details ?? [])
        .map((d) => {
            if (!d?.dates || d.dates.length === 0) return null;
            return moment(d.dates[d.dates.length - 1]);
        })
        .filter((m): m is moment.Moment => !!m && m.isValid());

    if (!starts.length || !ends.length) {
        const today = moment();
        return {
            visibleStart: today.clone().startOf("day").valueOf(),
            visibleEnd: today.clone().endOf("day").valueOf(),
            label: `${today.format("DD MMM YYYY")} - ${today.format("DD MMM YYYY")}`,
        };
    }

    const minStart = moment.min(starts);
    const maxEnd = moment.max(ends);

    return {
        visibleStart: minStart.clone().subtract(12, "hours").valueOf(),
        visibleEnd: maxEnd.clone().add(12, "hours").valueOf(),
        label: `${minStart.format("DD MMM YYYY")} - ${maxEnd.format("DD MMM YYYY")}`,
    };
};

function ScheduleTimeline({
    schedule,
    filterStart,
    filterEnd,
}: {
    schedule: ScheduleData;
    filterStart?: string;
    filterEnd?: string;
}) {
    const filterStartMoment = filterStart ? moment(filterStart) : null;

    const filterEndMoment = filterEnd ? moment(filterEnd).endOf("day") : null;

    const filteredDetails = useMemo<ProcessDetail[]>(() => {
        const excludeSunday = (dateStr: string) => moment(dateStr).isoWeekday() === 7;

        const filterDates = (dates: string[]) =>
            dates
                .map((d) => moment(d))
                .filter((m) => m.isValid() && m.isoWeekday() !== 7)
                .map((m) => m.toISOString());

        return (schedule?.schedulesDetails ?? [])
            .map((d: ProcessDetail) => {
                const dates = filterDates(d?.dates ?? []);
                return { ...d, dates };
            })
            .filter((d: ProcessDetail) => {
                if (!d.dates || d.dates.length === 0) return false;
                const startDate = d.dates[0];
                const endDate = d.dates[d.dates.length - 1];
                const s = moment(startDate);
                const e = moment(endDate);
                if (!s.isValid() || !e.isValid()) return false;
                if (filterStartMoment && s.isBefore(filterStartMoment, "day")) return false;
                if (filterEndMoment && e.isAfter(filterEndMoment, "day")) return false;
                return true;
            });
    }, [filterEndMoment, filterStartMoment, schedule?.schedulesDetails]);

    const groups = useMemo(() => buildGroups(filteredDetails ?? []), [filteredDetails]);
    const items = useMemo(() => buildItems(filteredDetails ?? []), [filteredDetails]);
    const range = useMemo(
        () =>
            filteredDetails && filteredDetails.length
                ? getRange(filteredDetails)
                : getRange(schedule?.schedulesDetails ?? []),
        [filteredDetails, schedule?.schedulesDetails]
    );

    const [visibleStart, setVisibleStart] = useState(range.visibleStart);
    const [visibleEnd, setVisibleEnd] = useState(range.visibleEnd);

    useEffect(() => {
        setVisibleStart(range.visibleStart);
        setVisibleEnd(range.visibleEnd);
    }, [range.visibleStart, range.visibleEnd]);


    const totalTarget = (filteredDetails ?? []).reduce((sum, d) => sum + d.targetQtyTotal, 0);

    return (
        <section className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Schedule #{schedule?.scheduleId ?? 0}
                    </p>
                    <h2 className="text-lg font-bold text-slate-800">
                        {schedule?.part?.name ?? "Part"} ({schedule?.part?.type ?? "-"})
                    </h2>
                    <p className="text-sm text-slate-500">
                        {schedule?.customer?.name ?? "Customer"} · Range {range.label}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                    <span className="rounded-md bg-blue-50 px-3 py-1 font-semibold text-blue-700">
                        {filteredDetails?.length ?? 0} proses
                    </span>
                    <span className="rounded-md bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                        Target total {schedule?.qty?.toLocaleString()}
                    </span>
                </div>
            </header>

            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-4">
                <div className="min-w-[900px]">
                    <Timeline
                        key={schedule?.scheduleId}
                        groups={groups}
                        items={items}
                        visibleTimeStart={visibleStart}
                        visibleTimeEnd={visibleEnd}
                        lineHeight={48}
                        itemHeightRatio={0.9}
                        stackItems
                        canMove={false}
                        canResize={false}
                        canChangeGroup={false}
                        onTimeChange={(start, end) => {
                            setVisibleStart(start);
                            setVisibleEnd(end);
                        }}
                        timeSteps={{
                            year: 1,
                            month: 1,
                            day: 1,
                            hour: 24,
                            minute: 0,
                            second: 0,
                        }}
                        minZoom={12 * 60 * 60 * 1000}
                        maxZoom={150 * 24 * 60 * 60 * 1000}
                        itemRenderer={({ item, itemContext, getItemProps }) => {
                            const start = moment(item.start_time);
                            const end = moment(item.end_time);
                            const meta = (item as TimelineItemType).meta;

                            return (
                                <div
                                    {...getItemProps({
                                        style: {
                                            background: itemContext.selected
                                                ? "linear-gradient(90deg, #2563eb, #38bdf8)"
                                                : "linear-gradient(90deg, #22c55e, #10b981)",
                                            borderRadius: 10,
                                            color: "#0f172a",
                                            boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                                            padding: "8px 12px",
                                            fontWeight: 700,
                                        },
                                    })}
                                    title={`${item.title}\n${start.format(
                                        "DD MMM YYYY"
                                    )} - ${end.format("DD MMM YYYY")}\nTarget total ${meta.targetQtyTotal.toLocaleString()}`}
                                >
                                    <div className="flex items-center justify-center text-xs">
                                        {/* <span>{item.title}</span> */}
                                        <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                                            {meta.targetQtyPerDay.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            );
                        }}
                    >
                        <TimelineHeaders className="sticky top-0">
                            <DateHeader
                                unit="primaryHeader"
                                labelFormat={(interval) => {
                                    const [start] = interval as [unknown, unknown];
                                    const ts =
                                        start && typeof (start as { valueOf?: () => number }).valueOf === "function"
                                            ? (start as { valueOf: () => number }).valueOf()
                                            : (start as moment.MomentInput);
                                    return moment(ts).format("MMM YYYY");
                                }}
                            />
                            <DateHeader
                                unit="day"
                                labelFormat={(interval) => {
                                    const [start] = interval as [unknown, unknown];
                                    const ts =
                                        start && typeof (start as { valueOf?: () => number }).valueOf === "function"
                                            ? (start as { valueOf: () => number }).valueOf()
                                            : (start as moment.MomentInput);
                                    return moment(ts).format("DD");
                                }}
                            />
                        </TimelineHeaders>
                    </Timeline>
                </div>
                {filteredDetails?.length === 0 ? (
                    <p className="mt-2 text-xs text-slate-500">Tidak ada proses pada rentang ini.</p>
                ) : null}
            </div>
        </section>
    );
}

export default function CustomTimeline() {
    const { data, isLoading } = useQuery({
        queryKey: ["timeline-schedules"],
        queryFn: async () => {
            const res = await ScheduleService.getWithoutPagination();
            const raw = (res?.data as any[]) ?? [];
            console.log({ raw });
            return raw.map((s) => ({
                scheduleId: s.scheduleId ?? s.id ?? 0,
                target: s.target,
                qty: s.qty ?? s.quantity ?? 0,
                part: s.part ?? { name: s.partName ?? "Part", type: s.partType ?? "-" },
                customer: s.customer ?? { name: s.customerName ?? "Customer" },
                schedulesDetails: s.schedulesDetails ?? s.scheduleDetails ?? [],
            }));
        },
    });
    const schedules: ScheduleData[] = (data as ScheduleData[]) ?? [];
    const [filterStart, setFilterStart] = useState<string>("");
    const [filterEnd, setFilterEnd] = useState<string>("");
    const [pendingStart, setPendingStart] = useState<string>("");
    const [pendingEnd, setPendingEnd] = useState<string>("");
    const [resetKey, setResetKey] = useState<number>(0);

    const clearFilter = () => {
        setFilterStart("");
        setFilterEnd("");
        setPendingStart("");
        setPendingEnd("");
        setResetKey((k) => k + 1);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDateChange = (selectedDates: Date[], dateStr: string, instance: any) => {
        const inputId = instance.element.id;
        if (inputId === "filter_start") {
            setPendingStart(dateStr);
        } else if (inputId === "filter_end") {
            setPendingEnd(dateStr);
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <>
            <Breadcrumb
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Timeline Schedule", href: "/timeline-schedules" }
                ]}
            />
            <div className="space-y-4">

                <div className=" gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="">
                        <h3 className="text-lg font-semibold mb-2">Filter</h3>
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="w-52">
                            <DatePicker
                                key={`start-${resetKey}`}
                                placeholder="Start Date"
                                label="Start Date"
                                id="filter_start"
                                onChange={handleDateChange}
                                mode="single"
                                defaultDate={pendingStart || undefined}
                            />
                        </div>
                        <div className="w-52">
                            <DatePicker
                                key={`end-${resetKey}`}
                                placeholder="End Date"
                                label="End Date"
                                id="filter_end"
                                onChange={handleDateChange}
                                mode="single"
                                defaultDate={pendingEnd || undefined}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                onClick={() => {
                                    setFilterStart(pendingStart);
                                    setFilterEnd(pendingEnd);
                                }}
                            >
                                Apply Filter
                            </Button>
                            <Button
                                variant="secondary"
                                type="button"
                                onClick={clearFilter}

                            >
                                Clear
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {schedules?.map((schedule, index) => (
                        <div key={schedule.scheduleId + `-${index}`} className="mb-6">
                            <ScheduleTimeline
                                schedule={schedule}
                                filterStart={filterStart}
                                filterEnd={filterEnd}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

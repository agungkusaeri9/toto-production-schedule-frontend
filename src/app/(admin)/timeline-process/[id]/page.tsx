"use client";

import React, { HTMLAttributes, useMemo } from "react";
import Timeline, { TimelineHeaders, DateHeader, TimelineItemBase } from "react-calendar-timeline";
import moment from "moment";
import "react-calendar-timeline/dist/style.css";

import scheduleProcess from "@/data/schedule-process-timeline.json";
import Breadcrumb from "@/components/common/Breadcrumb";

type ScheduleData = (typeof scheduleProcess.data)[number];
type ProcessDetail = ScheduleData["schedulesDetails"][number];
type TimelineItemType = TimelineItemBase<number> & { meta: ProcessDetail };

const buildGroups = (details: ProcessDetail[]) =>
    details.map((proc, idx) => ({
        id: idx + 1,
        title: proc.processName,
    }));

const buildItems = (details: ProcessDetail[]): TimelineItemType[] =>
    details.map((proc, idx) => ({
        id: idx + 1,
        group: idx + 1,
        title: proc.processName,
        start_time: moment(proc.startDate).valueOf(),
        end_time: moment(proc.finishDate).valueOf(),
        canMove: false,
        canResize: false,
        itemProps: {
            "data-process": proc.processName,
        } as HTMLAttributes<HTMLDivElement>,
        meta: proc,
    }));

const getRange = (details: ProcessDetail[]) => {
    const starts = details.map((d) => moment(d.startDate));
    const ends = details.map((d) => moment(d.finishDate));

    const minStart = moment.min(starts);
    const maxEnd = moment.max(ends);

    return {
        visibleStart: minStart.clone().subtract(12, "hours").valueOf(),
        visibleEnd: maxEnd.clone().add(12, "hours").valueOf(),
        label: `${minStart.format("DD MMM YYYY")} - ${maxEnd.format("DD MMM YYYY")}`,
    };
};

function ScheduleTimeline({ schedule }: { schedule: ScheduleData }) {
    const details = schedule.schedulesDetails;

    const groups = useMemo(() => buildGroups(details), [details]);
    const items = useMemo(() => buildItems(details), [details]);
    const range = useMemo(() => getRange(details), [details]);

    const totalTarget = details.reduce((sum, d) => sum + d.targetQtyTotal, 0);

    return (
        <section className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Schedule #{schedule.scheduleId}
                    </p>
                    <h2 className="text-lg font-bold text-slate-800">
                        {schedule.partName ?? "Part"}
                    </h2>
                    <p className="text-sm text-slate-500">
                        {schedule.customerName ?? "Customer"} · Range {range.label}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                    <span className="rounded-md bg-blue-50 px-3 py-1 font-semibold text-blue-700">
                        {details.length} proses
                    </span>
                    <span className="rounded-md bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                        Target total {schedule.quantity.toLocaleString()}
                    </span>
                    <span className="rounded-md bg-slate-50 px-3 py-1 font-semibold text-slate-700">
                        Sum detail {totalTarget.toLocaleString()}
                    </span>
                </div>
            </header>

            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-4">
                <div className="min-w-[900px]">
                    <Timeline
                        key={schedule.scheduleId}
                        groups={groups}
                        items={items}
                        visibleTimeStart={range.visibleStart}
                        visibleTimeEnd={range.visibleEnd}
                        lineHeight={48}
                        itemHeightRatio={0.9}
                        stackItems
                        canMove={false}
                        canResize={false}
                        canChangeGroup={false}
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
                                    <div className="flex items-center justify-between text-xs">
                                        <span>{item.title}</span>
                                        <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                                            {meta.targetQtyPerDay.toLocaleString()}/hari
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
                                    return moment(ts).format("DD MMM YYYY");
                                }}
                            />
                        </TimelineHeaders>
                    </Timeline>
                </div>
            </div>
        </section>
    );
}

export default function CustomTimeline() {
    const schedules = scheduleProcess.data;

    return (
        <>
            <Breadcrumb
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Timeline Schedule", href: "/timeline-schedules" },
                    { label: "Detail" },
                ]}
            />
            <div className="space-y-6">
                {schedules.map((schedule) => (
                    <ScheduleTimeline key={schedule.scheduleId} schedule={schedule} />
                ))}
            </div>
        </>
    );
}

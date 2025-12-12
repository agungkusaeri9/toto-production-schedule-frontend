"use client";

import React, { HTMLAttributes, useMemo, useState } from "react";
import Timeline, { TimelineHeaders, DateHeader, TimelineItemBase } from "react-calendar-timeline";
import moment from "moment";
import "react-calendar-timeline/dist/style.css";

import Breadcrumb from "@/components/common/Breadcrumb";
import Loading from "@/components/common/Loading";
import { useQuery } from "@tanstack/react-query";
import ScheduleService from "@/services/ScheduleService";

type ApiDetail = {
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
    schedulesDetails?: ApiDetail[];
    scheduleDetails?: ApiDetail[];
};

type MonthlyItem = TimelineItemBase<number> & {
    meta: {
        month: string;
        totalQty: number;
        partName: string;
        customerName: string;
    };
};

const toMoment = (v?: string) => {
    const m = moment(v);
    return m.isValid() ? m : null;
};

const normalizeSchedules = (raw: ApiSchedule[]): ApiSchedule[] =>
    (raw ?? []).map((s) => ({
        scheduleId: s.scheduleId ?? s.id ?? 0,
        target: s.target,
        qty: s.qty ?? s.quantity ?? 0,
        part: s.part ?? { name: s.partName ?? "Part", type: s.partType ?? "-" },
        customer: s.customer ?? { name: s.customerName ?? "Customer" },
        schedulesDetails: s.schedulesDetails ?? s.scheduleDetails ?? [],
    }));

const buildGroups = (records: ApiSchedule[]) =>
    records.map((record, idx) => ({
        id: idx + 1,
        title: `${record.part?.name ?? "Part"} (${record.part?.type ?? "-"}) · ${record.customer?.name ?? "Customer"}`,
    }));

const buildMonthlyTotalsPerPart = (records: ApiSchedule[]): { items: MonthlyItem[]; rangeLabel: string } => {
    const items: MonthlyItem[] = [];
    let id = 1;

    const allDates: moment.Moment[] = [];

    records.forEach((record, idx) => {
        const groupId = idx + 1;

        type MonthSpan = { key: string; activeDays: number; start: moment.Moment; end: moment.Moment };
        const monthSpans: MonthSpan[] = [];

        (record.schedulesDetails ?? []).forEach((detail) => {
            const validDates = (detail.dates ?? [])
                .map((d) => toMoment(d))
                .filter((m): m is moment.Moment => !!m);

            validDates.forEach((md) => allDates.push(md));

            if (!validDates.length) return;

            const start = validDates[0].clone().startOf("day");
            const end = validDates[validDates.length - 1].clone().endOf("day");

            const cursor = start.clone().startOf("month");
            const endMonth = end.clone().endOf("month");

            for (; cursor.isSameOrBefore(endMonth, "month"); cursor.add(1, "month")) {
                const monthStart = moment.max(cursor.clone().startOf("month"), start);
                const monthEnd = moment.min(cursor.clone().endOf("month"), end);
                if (monthEnd.isBefore(monthStart, "day")) continue;

                const key = monthStart.format("YYYY-MM");
                const days = monthEnd.diff(monthStart, "days") + 1;

                const existing = monthSpans.find((m) => m.key === key);
                if (existing) {
                    existing.activeDays += days;
                    existing.start = moment.min(existing.start, monthStart);
                    existing.end = moment.max(existing.end, monthEnd);
                } else {
                    monthSpans.push({ key, activeDays: days, start: monthStart, end: monthEnd });
                }
            }
        });

        if (!monthSpans.length) return;

        const totalQty = record.qty ?? 0;
        const totalDays = monthSpans.reduce((sum, m) => sum + m.activeDays, 0);
        if (totalDays <= 0 || totalQty <= 0) return;

        let assignedTotal = 0;
        monthSpans
            .sort((a, b) => a.key.localeCompare(b.key))
            .forEach((span, index) => {
                let qtyForMonth: number;
                if (index === monthSpans.length - 1) {
                    qtyForMonth = totalQty - assignedTotal;
                } else {
                    qtyForMonth = Math.floor((totalQty * span.activeDays) / totalDays);
                    assignedTotal += qtyForMonth;
                }

                if (qtyForMonth <= 0) return;

                items.push({
                    id,
                    group: groupId,
                    title: `${qtyForMonth.toLocaleString()} PO`,
                    start_time: span.start.valueOf(),
                    end_time: span.end.valueOf(),
                    canMove: false,
                    canResize: false,
                    itemProps: {
                        "data-month": span.key,
                    } as HTMLAttributes<HTMLDivElement>,
                    meta: {
                        month: span.key,
                        totalQty: qtyForMonth,
                        partName: record.part?.name ?? "Part",
                        customerName: record.customer?.name ?? "Customer",
                    },
                });

                id += 1;
            });
    });

    const minDate = allDates.length ? moment.min(allDates) : moment();
    const maxDate = allDates.length ? moment.max(allDates) : moment();
    const rangeLabel = `${minDate.format("DD MMM YYYY")} - ${maxDate.format("DD MMM YYYY")}`;

    return { items, rangeLabel };
};

export default function GlobalTimeline() {
    const { data, isLoading } = useQuery({
        queryKey: ["timeline-schedules-monthly"],
        queryFn: async () => {
            const res = await ScheduleService.getWithoutPagination();
            return normalizeSchedules((res?.data as ApiSchedule[]) ?? []);
        },
    });

    const schedules = (data as ApiSchedule[]) ?? [];

    const groups = useMemo(() => buildGroups(schedules), [schedules]);
    const { items, rangeLabel } = useMemo(() => buildMonthlyTotalsPerPart(schedules), [schedules]);

    const grandTotal = useMemo(
        () => schedules.reduce((sum, r) => sum + (r.qty ?? 0), 0),
        [schedules]
    );

    const visibleStart = useMemo(() => {
        if (!items.length) return moment().startOf("year").valueOf();
        return Math.min(...items.map((i) => i.start_time));
    }, [items]);

    const visibleEnd = useMemo(() => {
        if (!items.length) return moment().endOf("year").valueOf();
        return Math.max(...items.map((i) => i.end_time));
    }, [items]);

    if (isLoading) {
        return <Loading />;
    }

    return (
        <>
            <Breadcrumb
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Timeline PO", href: "/timelines" },
                ]}
            />

            <div className="space-y-6">
                <header className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Global PO Timeline</h1>
                        <p className="text-sm text-slate-500">Range {rangeLabel}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                        <span className="rounded-md bg-blue-50 px-3 py-1 font-semibold text-blue-700">
                            {schedules.length} part
                        </span>
                        <span className="rounded-md bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                            Total PO {grandTotal.toLocaleString()}
                        </span>
                    </div>
                </header>

                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="min-w-[900px]">
                        <Timeline
                            groups={groups}
                            items={items}
                            visibleTimeStart={visibleStart}
                            visibleTimeEnd={visibleEnd}
                            lineHeight={46}
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
                            minZoom={28 * 24 * 60 * 60 * 1000} // ~1 bulan
                            maxZoom={365 * 24 * 60 * 60 * 1000} // 1 tahun
                            itemRenderer={({ item, itemContext, getItemProps }) => {
                                const meta = (item as MonthlyItem).meta;
                                const monthLabel = moment(meta.month + "-01").format("MMM");

                                return (
                                    <div
                                        {...getItemProps({
                                            style: {
                                                background: itemContext.selected
                                                    ? "linear-gradient(90deg, #2563eb, #38bdf8)"
                                                    : "linear-gradient(90deg, #22c55e, #16a34a)",
                                                borderRadius: 10,
                                                color: "#0f172a",
                                                boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                                                padding: "6px 10px",
                                                fontWeight: 700,
                                            },
                                        })}
                                        title={`${monthLabel}\nTotal ${meta.totalQty.toLocaleString()} PO`}
                                    >
                                        <div className="flex items-center justify-between text-xs">
                                            <span>{monthLabel}</span>
                                            <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                                                {meta.totalQty.toLocaleString()} PO
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
                                            start &&
                                                typeof (start as { valueOf?: () => number }).valueOf === "function"
                                                ? (start as { valueOf: () => number }).valueOf()
                                                : (start as moment.MomentInput);
                                        return moment(ts).format("YYYY");
                                    }}
                                />
                                <DateHeader
                                    unit="month"
                                    labelFormat={(interval) => {
                                        const [start] = interval as [unknown, unknown];
                                        const ts =
                                            start &&
                                                typeof (start as { valueOf?: () => number }).valueOf === "function"
                                                ? (start as { valueOf: () => number }).valueOf()
                                                : (start as moment.MomentInput);
                                        return moment(ts).format("MMM");
                                    }}
                                />
                            </TimelineHeaders>
                        </Timeline>
                    </div>
                </div>
            </div>
        </>
    );
}

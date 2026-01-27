import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebounce } from "./useDebounce";
import { ScheduleDetailResponse } from "@/types/productionTimeline";

export type FetchFunctionWithModel = (
    page?: number,
    limit?: number,
    modelId?: number
) => Promise<ScheduleDetailResponse>;

export const useFetchScheduleDetail = (
    fetchFunction: FetchFunctionWithModel,
    queryKey: string,
    modelId: number
) => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [currentPage, setCurrentPage] = useState(
        Number(searchParams.get("page")) || 1
    );
    const [limit, setLimit] = useState(
        Number(searchParams.get("limit")) || 10
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        const tableElement = document.querySelector('.overflow-x-auto');
        if (tableElement) {
            tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    useEffect(() => {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("limit", limit.toString());
        newParams.set("page", currentPage.toString());
        if (modelId !== 0) {
            newParams.set("modelId", modelId.toString());
        } else {
            newParams.delete("modelId");
        }
        router.push(`?${newParams.toString()}`, { scroll: false });
    }, [currentPage, limit, modelId, router, searchParams]);

    const { data: responseData, isLoading, refetch } = useQuery<ScheduleDetailResponse>({
        queryKey: [queryKey, currentPage, limit, modelId],
        queryFn: () => fetchFunction(currentPage, limit, modelId),
    });

    return {
        data: responseData?.data,
        pagination: responseData?.paging,
        isLoading,
        currentPage,
        limit,
        setCurrentPage: handlePageChange,
        setLimit,
        refetch,
    };
};


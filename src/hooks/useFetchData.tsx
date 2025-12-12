import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebounce } from "./useDebounce";
import { FetchFunctionWithoutPagination, FetchFunctionWithPagination } from "../types/fetch";

type PaginatedResponse<T> = {
    data: T[];
    pagination: {
        curr_page: number;
        total_page: number;
        limit: number;
        total: number;
    };
};

export const useFetchData = <T,>(
    fetchFunction: FetchFunctionWithPagination<T> | FetchFunctionWithoutPagination<T>,
    queryKey: string,
    usePagination: boolean = true,
) => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [currentPage, setCurrentPage] = useState(
        usePagination ? Number(searchParams.get("page")) || 1 : 1
    );
    const [limit, setLimit] = useState(
        usePagination ? Number(searchParams.get("limit")) || 10 : 50
    );

    const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
    const debouncedSearch = useDebounce(keyword, 500);
    const [pagination, setPagination] = useState<PaginatedResponse<T>["pagination"] | null>(null);

    useEffect(() => {
        if (!usePagination) return;

        const newParams = new URLSearchParams(searchParams.toString());
        // newParams.set("limit", limit.toString());
        // newParams.set("page", currentPage.toString());
        if (keyword) newParams.set("keyword", keyword);
        router.push(`?${newParams.toString()}`, { scroll: false });
    }, [keyword, currentPage, limit, router, searchParams, usePagination]);

    const fetchData = async (): Promise<T[]> => {
        if (usePagination) {
            const res = await (fetchFunction as FetchFunctionWithPagination<T>)(currentPage, limit, debouncedSearch);
            setPagination(res.pagination);
            return res.data;
        } else {
            const res = await (fetchFunction as FetchFunctionWithoutPagination<T>)(debouncedSearch);
            return res.data;
        }
    };

    const { data, isLoading, refetch } = useQuery<T[]>({
        queryKey: usePagination
            ? [queryKey, currentPage, limit, debouncedSearch]
            : [queryKey],
        queryFn: fetchData,
    });

    return {
        data,
        isLoading,
        pagination,
        currentPage,
        limit,
        keyword,
        setKeyword,
        setCurrentPage,
        setLimit,
        refetch,
        fetchData,
    };
}; 
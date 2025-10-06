import { getUserById, getUsers } from "@/lib/actions/users";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useUsers() {
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const result = await getUsers();
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 5, // 5 min "fresh"
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });
}

export function useUser(userId: string) {
    return useQuery({
        queryKey: ['user', userId],
        queryFn: async () => {
            const result = await getUserById(userId);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        enabled: !!userId,
    });
}
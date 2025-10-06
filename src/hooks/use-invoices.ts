import { createInvoice, deleteInvoice, getInvoiceById, getInvoices, updateInvoice } from "@/lib/actions/invoices";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useInvoices(userId: string, filter: Parameters<typeof getInvoices>[1] = {}) {
    return useQuery({
        queryKey: ['invoices', filter],
        queryFn: async () => {
            const result = await getInvoices(userId, filter);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        enabled: !!userId,
        placeholderData: keepPreviousData,
        // staleTime: 1000 * 60 * 5, // 5 min "fresh"
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
}

export function useInvoice(invoiceId: string) {
    return useQuery({
        queryKey: ['invoice', invoiceId],
        queryFn: async () => {
            const result = await getInvoiceById(invoiceId);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        enabled: !!invoiceId,
    });
}

export function useCreateInvoice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Parameters<typeof createInvoice>[0]) => {
            const result = await createInvoice(data);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            // toast.success('Invoice created successfully!');
        },
        onError: (error: Error) => {
            // toast.error(error.message || 'Failed to create invoice');
        },
    });
}

export function useUpdateInvoiceStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            invoiceId,
            data,
        }: {
            invoiceId: string;
            data: Parameters<typeof updateInvoice>[1];
        }) => {
            const result = await updateInvoice(invoiceId, data);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
            // toast.success('Invoice status updated!');
        },
        onError: (error: Error) => {
            // toast.error(error.message || 'Failed to update invoice');
        },
    });
}

export function useDeleteInvoice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (invoiceId: string) => {
            const result = await deleteInvoice(invoiceId);
            if (!result.success) throw new Error(result.error);
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            // toast.success('Invoice deleted successfully!');
        },
        onError: (error: Error) => {
            // toast.error(error.message || 'Failed to delete invoice');
        },
    });
}
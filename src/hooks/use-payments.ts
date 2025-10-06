import { createPayment, getPaymentsByInvoice } from "@/lib/actions/payments";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function usePaymentsByInvoice(invoiceId: string) {
    return useQuery({
        queryKey: ['payments', 'invoice', invoiceId],
        queryFn: async () => {
            const result = await getPaymentsByInvoice(invoiceId);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        enabled: !!invoiceId,
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 5, // 5 min "fresh"
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });
}

export function useCreatePayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Parameters<typeof createPayment>[0]) => {
            const result = await createPayment(data);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
            // toast.success('Payment processed successfully!');
        },
        onError: (error: Error) => {
            // toast.error(error.message || 'Failed to process payment');
        },
    });
}
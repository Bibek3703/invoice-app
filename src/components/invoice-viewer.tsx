"use client"
import React, { useMemo, useState } from 'react'
import { pdf, PDFDownloadLink, Text, usePDF } from "@react-pdf/renderer";
import { InvoiceFormValues } from './dashboard/forms/invoice-form';
import { calculateInvoiceItemTotal, calculateInvoiceTotals } from '@/lib/utils/invoices';
import { Download, FileText, Loader2 } from 'lucide-react';
import InvoicePDF from './invoice-pdf';
import { Button } from './ui/button';
import { getCurrencySign } from '@/lib/utils';


function InvoiceDownloadButton({ invoiceData }: { invoiceData: InvoiceFormValues | null }) {
    const memoizedInvoice = useMemo(() => invoiceData, [invoiceData]);
    const [{ loading, url, error }] = usePDF({
        document: <InvoicePDF invoiceData={memoizedInvoice} />,
    });

    if (!invoiceData) return

    if (error) {
        console.error(error);
        return <p className="text-red-500">Failed to generate PDF</p>;
    }

    return (
        <Button
            className="ml-auto"
            size="icon"
            asChild
            disabled={loading || !url}
        >
            {loading ? (
                <div className="flex items-center">
                    <Loader2 className="animate-spin" />
                </div>
            ) : (
                <a href={url || ""} download={`${invoiceData.invoiceNumber}.pdf`}>
                    <Download />
                </a>
            )}
        </Button>
    );
}

function InvoiceViewer({ invoiceData }: { invoiceData: InvoiceFormValues | null }) {
    const [logo, setLogo] = useState(null)
    if (!invoiceData) return


    const totals = calculateInvoiceTotals(invoiceData.items)

    const [loading, setLoading] = useState(false);

    async function downloadPDF(fileName: string) {
        try {
            setLoading(true)
            const blob = await pdf(<InvoicePDF invoiceData={invoiceData} />).toBlob();
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            a.click();

            // Clean up
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Failed to generate PDF:", err);
        } finally {
            setLoading(false)
        }
    }



    return (
        <div className='relative w-full h-full text-[12px]'>
            <div className='sticky top-0 w-full bg-primary text-primary-foreground p-2 z-10 flex gap-4'>
                {invoiceData && (
                    <Button
                        size="icon"
                        className="ml-auto"
                        onClick={() => downloadPDF(`${invoiceData.invoiceNumber}.pdf`)}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Download />}
                    </Button>
                )}
            </div>
            <div className='w-full h-full'>
                <div className='flex justify-between items-end w-full bg-black text-white px-5'>
                    <div className='flex flex-col gap-1 pb-5'>
                        <h1 className='font-bold uppercase underline underline-offset-8 text-6xl'>Invoice</h1>
                        <div className='flex gap-2 mt-4'>
                            <h2 className='font-bold'>Invoice number:</h2>
                            <p>
                                {invoiceData?.invoiceNumber}
                            </p>
                        </div>
                        <div className='flex gap-2'>
                            <h2 className='font-bold'>Invoice Date:</h2>
                            <p>
                                {new Date(invoiceData?.issueDate).toLocaleDateString()}
                            </p>
                        </div>
                        <div className='flex gap-2'>
                            <h2 className='font-bold'>Due Date:</h2>
                            <p >
                                {new Date(invoiceData?.issueDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <div className='w-[35%] aspect-square relative'>
                        <div
                            className='absolute top-0 w-full h-[110%] flex justify-center items-center'
                            style={{ backgroundColor: "hsl(45.4 93.4% 47.5%)" }}
                        >
                            {logo ? null : <FileText />}
                        </div>
                    </div>
                </div>
                <div className='flex justify-between items-end p-5 mt-5'>

                    {invoiceData?.sender && <div className='flex flex-col'>
                        <h2 className='text-[14px] font-bold mb-1'>Billing From:</h2>
                        <div className='flex gap-2'>
                            <h3 className='font-bold'>Client name:</h3>
                            <p>{invoiceData?.sender?.name}</p>
                        </div>
                        <div className='flex gap-2'>
                            <h3 className='font-bold'>Company name:</h3>
                            <p>{invoiceData?.sender?.company?.name}</p>
                        </div>
                        <div className='flex gap-2'>
                            <h3 className='font-bold'>Billing address:</h3>
                            <p>
                                {invoiceData?.sender?.company?.address?.city},&nbsp;
                                {invoiceData?.sender?.company?.address?.country}
                            </p>
                        </div>
                        <div className='flex gap-2'>
                            <h3 className='font-bold'>Phone:</h3>
                            <p>
                                {invoiceData?.sender?.company?.phone}
                            </p>
                        </div>
                        <div className='flex gap-2'>
                            <h3 className='font-bold'>Email:</h3>
                            <p>
                                {invoiceData?.sender?.company?.email || invoiceData?.sender?.email}
                            </p>
                        </div>
                    </div>}


                    {invoiceData?.recipient && <div className='flex flex-col'>
                        <h2 className='text-[14px] font-bold mb-1'>Billing To:</h2>
                        <div className='flex gap-2'>
                            <h3 className='font-bold'>Client name:</h3>
                            <p>{invoiceData?.recipient?.name}</p>
                        </div>
                        <div className='flex gap-2'>
                            <h3 className='font-bold'>Company name:</h3>
                            <p>{invoiceData?.recipient?.company?.name}</p>
                        </div>
                        <div className='flex gap-2'>
                            <h3 className='font-bold'>Billing address:</h3>
                            <p>
                                {invoiceData?.recipient?.company?.address?.city},&nbsp;
                                {invoiceData?.recipient?.company?.address?.country}
                            </p>
                        </div>
                        <div className='flex gap-2'>
                            <h3 className='font-bold'>Phone:</h3>
                            <p>
                                {invoiceData?.recipient?.company?.phone}
                            </p>
                        </div>
                        <div className='flex gap-2'>
                            <h3 className='font-bold'>Email:</h3>
                            <p>
                                {invoiceData?.recipient?.company?.email || invoiceData?.recipient?.email}
                            </p>
                        </div>
                    </div>}

                </div>

                <div className='table-fixed p-5'>
                    <div className='flex'>
                        <div className='w-[40%] p-2.5 text-white' style={{ backgroundColor: "hsl(240 3.7% 15.9%)" }}>
                            <h3>ITEM DESCRIPTION</h3>
                        </div>
                        <div className='w-[20%] p-2.5 text-white' style={{ backgroundColor: "hsl(240 3.7% 15.9%)" }}>
                            <h3>QTY</h3>
                        </div>
                        <div className='w-[20%] p-2.5 text-white' style={{ backgroundColor: "hsl(240 3.7% 15.9%)" }}>
                            <h3 >PRICE</h3></div>
                        <div className='w-[20%] p-2.5 text-white' style={{ backgroundColor: "hsl(240 3.7% 15.9%)" }}>
                            <h3 >TOTAL</h3>
                        </div>
                    </div>
                    {invoiceData.items.map((item, i) => {
                        const { total } = calculateInvoiceItemTotal(item)
                        return (
                            <div key={i} className='flex'>
                                <div className='p-2.5 w-[40%]' style={i % 2 === 0 ? { backgroundColor: "hsl(20 5.9% 90%)" } : { backgroundColor: "hsl(60 4.8% 95.9%)" }}>
                                    <p>{item.description}</p>
                                </div>
                                <div className='p-2.5 w-[20%]' style={i % 2 === 0 ? { backgroundColor: "hsl(20 5.9% 90%)" } : { backgroundColor: "hsl(60 4.8% 95.9%)" }}>
                                    <p>{item.quantity} {item.unitType}</p>
                                </div>
                                <div className='p-2.5 w-[20%]' style={i % 2 === 0 ? { backgroundColor: "hsl(20 5.9% 90%)" } : { backgroundColor: "hsl(60 4.8% 95.9%)" }}>
                                    <p>{getCurrencySign(invoiceData.currency)}{item.unitPrice}</p></div>
                                <div className='p-2.5 w-[20%]' style={i % 2 === 0 ? { backgroundColor: "hsl(20 5.9% 90%)" } : { backgroundColor: "hsl(60 4.8% 95.9%)" }}>
                                    <p>{getCurrencySign(invoiceData.currency)}{total.toFixed(2)} </p>
                                </div>
                            </div>
                        )
                    })}
                    <div className="flex gap-2 mt-5">
                        <div className='w-[50%] flex flex-col gap-1' >
                            <h2 className='text-[14px] font-bold mb-1'>Payment Method</h2>
                            <div className='flex gap-1'>
                                <h3 className='font-bold'>Payment Method: </h3>
                                <p>Bank Transfer</p>
                            </div>
                            <div className='flex gap-1'>
                                <h3 className='font-bold'>Account Number: </h3>
                                <p>1234567RTE</p>
                            </div>
                            <div className='flex gap-1'>
                                <h3 className='font-bold'>Bank Name: </h3>
                                <p>ABC Bank</p>
                            </div>
                            <div className='flex gap-1'>
                                <h3 className='font-bold'>Branch Name: </h3>
                                <p>ABC address</p>
                            </div>
                        </div>
                        <div style={{
                            width: "50%",
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                            backgroundColor: "hsl(20 5.9% 90%)",
                            borderRadius: 8,
                            alignItems: "stretch"

                        }}>
                            <div style={{ flex: 1, padding: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                                <div className='flex gap-1'>
                                    <h3 className='font-bold'>Subtotal: </h3>
                                    <p>{getCurrencySign(invoiceData.currency)}{totals.subtotal.toFixed(2)}</p>
                                </div>
                                <div className='flex gap-1'>
                                    <h3 className='font-bold'>Tax: </h3>
                                    <p>{getCurrencySign(invoiceData.currency)}{totals.taxTotal.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className='flex p-2.5 rounded-bl-[8px] rounded-br-[8px] gap-1' style={{
                                backgroundColor: "hsl(45.4 93.4% 47.5%)",
                            }}>
                                <h3 className='font-bold'>Total: </h3>
                                <p>{getCurrencySign(invoiceData.currency)}{totals.total}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='flex items-end'>
                    <div className='w-[60%] p-5 flex flex-col gap-1'>
                        <h3 className='font-bold'>Terms & Conditions</h3>
                        <p>{invoiceData.terms}</p>

                        <h3 className='font-bold mt-1.5'>Notes</h3>
                        <p>{invoiceData.notes}</p>
                    </div>
                    <div className='w-[40%] p-5 flex flex-col justify-end gap-1'>
                        <div className='w-full aspect-video bg-white/50 border-b-[2px]' style={{
                            borderColor: "hsl(45.4 93.4% 47.5%)",
                        }}>

                        </div>
                        <h3 className='font-bold'>Signature</h3>
                    </div>
                </div>

                <div className='w-[80%] flex justify-center flex-wrap gap-0.5 px-5 pb-2 mx-auto' >
                    <span className='text-[6px]'>
                        {invoiceData?.sender?.company?.address?.street},
                        {invoiceData?.sender?.company?.address?.city},
                        {invoiceData?.sender?.company?.address?.state},
                        {invoiceData?.sender?.company?.address?.postalCode}&nbsp;
                        {invoiceData?.sender?.company?.address?.country}
                    </span>
                    <span className='text-[6px]'>|</span>
                    <span className='text-[6px]'>
                        Registration Number: {invoiceData?.sender?.company?.companyRegistrationNumber}
                    </span>
                    <span className='text-[6px]'>|</span>
                    <span className='text-[6px]'>
                        VAT Number: {invoiceData?.sender?.company?.vatNumber}
                    </span>
                </div>
            </div>
        </div >
    )
}

export default InvoiceViewer

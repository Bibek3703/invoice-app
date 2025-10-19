"use client"
import React, { useState } from 'react'
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { InvoiceFormValues } from './dashboard/forms/invoice-form';
import { Logo } from './icons/logo';
import { calculateInvoiceItemTotal, calculateInvoiceTotals } from '@/lib/utils/invoices';


const styles = StyleSheet.create({
    document: { width: "100%", height: "100%" },
    page: { width: "100%", backgroundColor: 'hsl(60 4.8% 95.9%)', height: "100%" },
    headerSection: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        width: "100%",
        backgroundColor: "black",
        height: "auto",
        color: "white",
        paddingHorizontal: 20
    },
    headerTitle: {
        fontSize: 60,
        fontWeight: "bold",
        textTransform: "uppercase",
        textDecoration: "underline"
    },
    logoWrapper: {
        width: "35%",
        height: "auto",
        aspectRatio: "1/1",
        position: "relative"
    },
    logoBox: {
        position: "absolute",
        top: 0,
        width: "100%",
        height: "110%",
        backgroundColor: "hsl(45.4 93.4% 47.5%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    infoSection: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginTop: 20,
        padding: 20
    },
    contactSection: {
        display: "flex",
        flexDirection: "column"
    },
    heading: {
        fontSize: 14,
        fontWeight: "bold",
    },
    label: {
        fontSize: 12,
        fontWeight: "bold",
    },
    text: {
        fontSize: 12,
    },
    rowSection: {
        display: "flex",
        flexDirection: "row",
        gap: 4,
    },
    table: { display: "flex", table: "fixed", width: "auto", padding: 20 },
    tableRow: { flexDirection: "row" },
    tableCol: { width: "40%", padding: 10, backgroundColor: "hsl(20 5.9% 90%)" },
    tableCol2: { width: "20%", padding: 10, textAlign: "center", backgroundColor: "hsl(20 5.9% 90%)" },
    tableColAlt: { width: "40%", padding: 10, backgroundColor: "hsl(60 4.8% 95.9%)" },
    tableColAlt2: { width: "20%", padding: 10, textAlign: "center", backgroundColor: "hsl(60 4.8% 95.9%)" },
    tableHead: { width: "40%", backgroundColor: "hsl(240 3.7% 15.9%)", padding: 10, color: "white" },
    tableHead2: {
        width: "20%",
        backgroundColor: "hsl(45.4 93.4% 47.5%)",
        padding: 10,
        color: "white",
        textAlign: "center"
    },
    tableCell: { fontSize: 12 },
});

function InvoicePDF({ invoiceData }: { invoiceData: InvoiceFormValues | null }) {
    const [logo, setLogo] = useState(null)
    if (!invoiceData) return


    const totals = calculateInvoiceTotals(invoiceData.items)

    return (
        <Document style={styles.document}>
            <Page size="A4" style={styles.page}>
                <View style={styles.headerSection}>
                    <View style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                        paddingBottom: 20
                    }}>
                        <Text style={styles.headerTitle}>Invoice</Text>
                        <View style={{ ...styles.rowSection, marginTop: 5 }}>
                            <Text style={styles.label}>Invoice number:</Text>
                            <Text style={styles.text}>
                                {invoiceData?.invoiceNumber}
                            </Text>
                        </View>
                        <View style={{ ...styles.rowSection }}>
                            <Text style={styles.label}>Invoice Date:</Text>
                            <Text style={styles.text}>
                                {new Date(invoiceData?.issueDate).toLocaleDateString()}
                            </Text>
                        </View>
                        <View style={{ ...styles.rowSection }}>
                            <Text style={styles.label}>Due Date:</Text>
                            <Text style={styles.text}>
                                {new Date(invoiceData?.issueDate).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.logoWrapper}>
                        <View style={styles.logoBox}>
                            {logo ? null : <Logo />}
                        </View>
                    </View>
                </View>
                <View style={styles.infoSection}>
                    {invoiceData?.sender && <View style={styles.contactSection}>
                        <Text style={{ ...styles.heading, marginBottom: 6 }}>Billing From:</Text>
                        <View style={{ ...styles.rowSection, marginBottom: 4 }}>
                            <Text style={styles.label}>Client name:</Text>
                            <Text style={styles.text}>{invoiceData?.sender?.name}</Text>
                        </View>
                        <View style={{ ...styles.rowSection, marginBottom: 4 }}>
                            <Text style={styles.label}>Company name:</Text>
                            <Text style={styles.text}>{invoiceData?.sender?.company?.name}</Text>
                        </View>
                        <View style={{ ...styles.rowSection, marginBottom: 4 }}>
                            <Text style={styles.label}>Billing address:</Text>
                            <Text style={styles.text}>
                                {invoiceData?.sender?.company?.address?.city},&nbsp;
                                {invoiceData?.sender?.company?.address?.country}
                            </Text>
                        </View>
                        <View style={{ ...styles.rowSection, marginBottom: 4 }}>
                            <Text style={styles.label}>Phone:</Text>
                            <Text style={styles.text}>
                                {invoiceData?.sender?.company?.phone}
                            </Text>
                        </View>
                        <View style={{ ...styles.rowSection, marginBottom: 4 }}>
                            <Text style={styles.label}>Email:</Text>
                            <Text style={styles.text}>
                                {invoiceData?.sender?.company?.email || invoiceData?.sender?.email}
                            </Text>
                        </View>
                    </View>}

                    {invoiceData?.recipient && <View style={styles.contactSection}>
                        <Text style={{ ...styles.heading, marginBottom: 6 }}>Billing To:</Text>
                        <View style={{ ...styles.rowSection, marginBottom: 4 }}>
                            <Text style={styles.label}>Client name:</Text>
                            <Text style={styles.text}>{invoiceData?.recipient?.name}</Text>
                        </View>
                        <View style={{ ...styles.rowSection, marginBottom: 4 }}>
                            <Text style={styles.label}>Company name:</Text>
                            <Text style={styles.text}>{invoiceData?.recipient?.company?.name}</Text>
                        </View>
                        <View style={{ ...styles.rowSection, marginBottom: 4 }}>
                            <Text style={styles.label}>Billing address:</Text>
                            <Text style={styles.text}>
                                {invoiceData?.recipient?.company?.address?.city},&nbsp;
                                {invoiceData?.recipient?.company?.address?.country}
                            </Text>
                        </View>
                        <View style={{ ...styles.rowSection, marginBottom: 4 }}>
                            <Text style={styles.label}>Phone:</Text>
                            <Text style={styles.text}>
                                {invoiceData?.recipient?.company?.phone}
                            </Text>
                        </View>
                        <View style={{ ...styles.rowSection, marginBottom: 4 }}>
                            <Text style={styles.label}>Email:</Text>
                            <Text style={styles.text}>
                                {invoiceData?.recipient?.company?.email || invoiceData?.recipient?.email}
                            </Text>
                        </View>
                    </View>}

                </View>

                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={styles.tableHead}><Text style={styles.tableCell}>ITEM DESCRIPTION</Text></View>
                        <View style={styles.tableHead2}><Text style={styles.tableCell}>QTY</Text></View>
                        <View style={styles.tableHead2}><Text style={styles.tableCell}>PRICE</Text></View>
                        <View style={styles.tableHead2}><Text style={styles.tableCell}>TOTAL</Text></View>
                    </View>
                    {invoiceData.items.map((item, i) => {
                        const { total } = calculateInvoiceItemTotal(item)
                        return (
                            <View style={styles.tableRow} key={i}>
                                <View style={i % 2 === 0 ? styles.tableCol : styles.tableColAlt}><Text style={styles.tableCell}>{item.description}</Text></View>
                                <View style={i % 2 === 0 ? styles.tableCol2 : styles.tableColAlt2}><Text style={styles.tableCell}>{item.quantity} {item.unitType}</Text></View>
                                <View style={i % 2 === 0 ? styles.tableCol2 : styles.tableColAlt2}><Text style={styles.tableCell}>{item.unitPrice}</Text></View>
                                <View style={i % 2 === 0 ? styles.tableCol2 : styles.tableColAlt2}><Text style={styles.tableCell}>{total.toFixed(2)}</Text></View>
                            </View>
                        )
                    })}
                    <View style={{ ...styles.rowSection, marginTop: 20 }}>
                        <View style={{
                            width: "50%",
                            display: "flex",
                            flexDirection: "column",
                            gap: 4
                        }}>
                            <Text style={{ ...styles.heading, marginBottom: 4 }}>Payment Method</Text>
                            <View style={styles.rowSection}>
                                <Text style={styles.label}>Payment Method: </Text>
                                <Text style={styles.text}>Bank Transfer</Text>
                            </View>
                            <View style={styles.rowSection}>
                                <Text style={styles.label}>Account Number: </Text>
                                <Text style={styles.text}>1234567RTE</Text>
                            </View>
                            <View style={styles.rowSection}>
                                <Text style={styles.label}>Bank Name: </Text>
                                <Text style={styles.text}>ABC Bank</Text>
                            </View>
                            <View style={styles.rowSection}>
                                <Text style={styles.label}>Branch Name: </Text>
                                <Text style={styles.text}>ABC address</Text>
                            </View>
                        </View>
                        <View style={{
                            width: "50%",
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                            backgroundColor: "hsl(20 5.9% 90%)",
                            borderRadius: 8,
                            alignItems: "stretch"

                        }}>
                            <View style={{ flex: 1, padding: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                                <View style={styles.rowSection}>
                                    <Text style={styles.label}>Subtotal: </Text>
                                    <Text style={styles.text}>{totals.subtotal}</Text>
                                </View>
                                <View style={styles.rowSection}>
                                    <Text style={styles.label}>Tax: </Text>
                                    <Text style={styles.text}>{totals.taxTotal}</Text>
                                </View>
                            </View>
                            <View style={{
                                ...styles.rowSection,
                                padding: 10,
                                backgroundColor: "hsl(45.4 93.4% 47.5%)",
                                borderBottomRightRadius: 8,
                                borderBottomLeftRadius: 8
                            }}>
                                <Text style={styles.label}>Total: </Text>
                                <Text style={styles.text}>{totals.total}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={{ ...styles.rowSection, alignItems: "flex-end", padding: 20, gap: 12, }}>
                    <View style={{
                        width: "60%",
                        display: "flex",
                        flexDirection: "column",
                        gap: 4
                    }}>
                        <Text style={styles.label}>Terms & Conditions</Text>
                        <Text style={styles.text}>{invoiceData.terms}</Text>

                        <Text style={{ ...styles.label, marginTop: 6 }}>Notes</Text>
                        <Text style={styles.text}>{invoiceData.notes}</Text>
                    </View>
                    <View style={{
                        width: "40%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        gap: 1
                    }}>
                        <View style={{
                            width: "100%",
                            height: "auto",
                            aspectRatio: "2/1",
                            backgroundColor: "white",
                            borderBottom: 2,
                            borderBottomColor: "hsl(45.4 93.4% 47.5%)",
                        }}>
                        </View>
                        <Text style={{ ...styles.label }}>Signature</Text>
                    </View>
                </View>
            </Page>
        </Document >
    )
}

export default InvoicePDF

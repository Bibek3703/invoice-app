import { FileText, Inbox, LayoutDashboard, Send } from "lucide-react";

export const menuItems = [
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        url: "#",
    },
    {
        title: "Received Invoices",
        icon: Inbox,
        url: "#received",
    },
    {
        title: "Sent Invoices",
        icon: Send,
        url: "#sent",
    },
    {
        title: "All Invoices",
        icon: FileText,
        url: "#all",
    },
]
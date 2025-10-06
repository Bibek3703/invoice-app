import { FileText, Inbox, LayoutDashboard, Send } from "lucide-react";

export const dashboardMenuItems = [
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        url: "/dashboard",
    },
    {
        title: "Invoices",
        icon: Inbox,
        menus: [{
            title: "Received Invoices",
            icon: Inbox,
            url: "/invoices/#received",
        },
        {
            title: "Sent Invoices",
            icon: Send,
            url: "/invoices/#sent",
        },
        {
            title: "All Invoices",
            icon: FileText,
            url: "/invoices/#all",
        },
        ]
    }
]
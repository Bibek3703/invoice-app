import { Building, FileText, Inbox, LayoutDashboard, Send, Users } from "lucide-react";

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
            url: "/invoices?tab=received",
        },
        {
            title: "Sent Invoices",
            icon: Send,
            url: "/invoices?tab=sent",
        },
        {
            title: "All Invoices",
            icon: FileText,
            url: "/invoices?tab=all",
        },
        ]
    },
    {
        title: "Contacts",
        icon: Inbox,
        menus: [{
            title: "Vendors",
            icon: Building,
            url: "/contacts?tab=vendors",
        },
        {
            title: "Clients",
            icon: Users,
            url: "/contacts?tab=clients",
        },
        ]
    }
]
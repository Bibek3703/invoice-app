import { Group, Inbox, LayoutDashboard, Send, ShoppingBag, Users } from "lucide-react";

export const dashboardMenuItems = [
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        url: "/dashboard",
    },
    {
        title: "Invoices",
        icon: Inbox,
        menus: [
            {
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
                icon: Group,
                url: "/invoices?tab=all",
            },
        ]
    },
    {
        title: "Contacts",
        icon: Inbox,
        menus: [
            {
                title: "Vendors",
                icon: ShoppingBag,
                url: "/contacts?tab=vendors",
            },
            {
                title: "Clients",
                icon: Users,
                url: "/contacts?tab=clients",
            },
            {
                title: "All Contacts",
                icon: Group,
                url: "/contacts?tab=all",
            },
        ]
    }
]
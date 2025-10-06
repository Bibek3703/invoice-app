"use client"

import React from 'react'
import { Tabs as TabsComponent, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { cn } from '@/lib/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface TabsProps {
    defaultValue?: string;
    className?: string;
    items: {
        label: string;
        value: string;
        component?: React.ReactNode;
        content?: React.ReactNode;
    }[]
}

function Tabs({ defaultValue, className, items }: TabsProps) {
    const [value, setValue] = React.useState(defaultValue || items[0]?.value || "");
    const searchParams = useSearchParams()

    React.useEffect(() => {
        const tab = searchParams?.get('tab');
        if (!tab) return;
        setValue(tab);
    }, [searchParams]);


    return (
        <TabsComponent
            value={value}
            onValueChange={setValue}
            className={cn("flex-1 w-full h-full flex-col justify-start", className)}
        >
            <Label htmlFor="view-selector" className="sr-only">
                View
            </Label>
            <Select defaultValue={value} onValueChange={setValue}>
                <SelectTrigger
                    className="flex w-fit @4xl/main:hidden"
                    size="sm"
                    id="view-selector"
                >
                    <SelectValue placeholder="Select a view" />
                </SelectTrigger>
                <SelectContent>
                    {items.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                            {item.label} {item?.component}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
                {items.map((item) => (<TabsTrigger key={item.value} value={item.value}>
                    {item.label} {item?.component}
                </TabsTrigger>))}
            </TabsList>
            {items.map((item) =>
                <TabsContent
                    key={item.value}
                    value={item.value}
                    className="relative flex-grow flex flex-col overflow-auto h-full"
                >
                    {item.content}
                </TabsContent>
            )}
        </TabsComponent>
    )
}

export default Tabs

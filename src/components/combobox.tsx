"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { InputGroup, InputGroupButton } from "./ui/input-group"

export type ComboboxItemType = {
    label: string
    value: string
}

interface ComboboxPropsType {
    placeHolder?: string
    searchPlaceHolder?: string
    notFoundText?: string
    shouldFilter?: boolean
    onFilter?: (value: string) => void;
    onSearch?: (value: string) => void;
    items: ComboboxItemType[],
    onSelect?: (value: string) => void
    defaultValue?: string
}

export function Combobox({
    placeHolder = "Select item...",
    searchPlaceHolder = "Search item...",
    notFoundText = "No item found.",
    items = [],
    onSelect = () => { },
    shouldFilter = true,
    onFilter = () => { },
    onSearch = () => { },
    defaultValue = ""
}: ComboboxPropsType) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState(defaultValue)
    const [search, setSearch] = React.useState("")

    React.useEffect(() => {
        onFilter(search)
    }, [search])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    <span className="truncate">
                        {value
                            ? items.find((item) => item.value === value)?.label
                            : placeHolder}
                    </span>
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="min-w-full max-w-full p-0">
                <Command
                    shouldFilter={shouldFilter}
                >
                    <InputGroup>
                        <CommandInput
                            value={search}
                            placeholder={searchPlaceHolder} className="h-9"
                            onValueChange={setSearch}

                        />
                        {search && <InputGroupButton
                            className="ml-auto"
                            onClick={() => {
                                if (search) {
                                    onSearch(search)
                                }
                            }}
                        >
                            <Search />
                        </InputGroupButton>}
                    </InputGroup>
                    <CommandList>
                        <CommandEmpty>{notFoundText}</CommandEmpty>
                        <CommandGroup>
                            {items.map((item) => (
                                <CommandItem
                                    key={item.value}
                                    value={item.value}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue === value ? "" : currentValue)
                                        onSelect(currentValue === value ? "" : currentValue)
                                        setOpen(false)
                                    }}
                                >
                                    {item.label}
                                    <Check
                                        className={cn(
                                            "ml-auto",
                                            value === item.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

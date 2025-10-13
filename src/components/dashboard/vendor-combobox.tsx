
import React, { useCallback, useEffect, useState } from 'react'
import { Combobox, ComboboxItemType } from '../combobox'
import { Contact } from '@/db/schema'
import { useVendors } from '@/hooks/use-contacts'

function VendorCombobox({
    value = "",
    companyId,
    onSelect = () => { }
}: {
    value: string,
    companyId: string,
    onSelect?: (value: string) => void
}) {
    const [search, setSearch] = useState("")
    const { data: vendors } = useVendors(companyId, {
        page: 1,
        pageSize: 20,
        columns: ["name", "email", "companyName"],
        search
    })

    const [options, setOptions] = useState<ComboboxItemType[]>([])

    const updateOptions = useCallback((items: Contact[]) => {
        if (items && items.length > 0) {
            setOptions(items.map((item) => ({
                value: item.id,
                label: `${item.name} (${item.email})`
            })))
        }
    }, [vendors?.data])

    useEffect(() => {
        updateOptions(vendors?.data as unknown as Contact[])
    }, [vendors?.data])

    return (
        <Combobox
            items={options}
            placeHolder={`Select vendor`}
            searchPlaceHolder={`Search vendor`}
            notFoundText={`No vendor`}
            shouldFilter={false}
            defaultValue={value}
            onFilter={(val) => {
                if (!val) {
                    if (search) {
                        setSearch("")
                    } else {
                        updateOptions(vendors?.data as unknown as Contact[])
                    }
                    return
                }
                setOptions(options.filter((item) => item.label.toLowerCase().includes(val)))
            }}
            onSearch={(val) => {
                setSearch(val)
            }}
            onSelect={onSelect}
        />
    )
}

export default VendorCombobox

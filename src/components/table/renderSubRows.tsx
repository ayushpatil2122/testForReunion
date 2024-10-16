import { flexRender } from "@tanstack/react-table"

import { Row } from "@tanstack/react-table"
import { TableCell, TableRow } from "../ui/table"
import { Button } from "../ui/button"
import { ChevronDown, ChevronRight } from "lucide-react"

export type DataItem = {
    id: string
    name: string
    category: string
    subcategory: string
    price: number
    createdAt: string
    updatedAt: string
  
}


export default function renderSubRows(row: Row<DataItem>, depth = 0): React.ReactNode {
    const subRows = row.subRows || []
    const isExpanded = row.getIsExpanded()

    return (
      <>
        <TableRow key={row.id}>
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id} style={{ paddingLeft: `${depth * 2}rem` }}>
              {cell.column.id === 'name' && row.getCanExpand() ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={row.getToggleExpandedHandler()}
                  className="mr-2"
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              ) : null}
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
        {isExpanded && subRows.map((subRow) => renderSubRows(subRow as unknown as Row<DataItem>, depth + 1))}
      </>
    )
  }
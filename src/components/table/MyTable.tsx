"use client"

import * as React from "react"
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  useReactTable,
  Row,
} from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, X, ChevronDown, ChevronUp, Eye, EyeOff, ArrowUpDown, List } from "lucide-react"
import Fuse from "fuse.js"
import moment from 'moment'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { data } from "../../lib/data"
import { columns } from "./columns"
import renderSubRows, { DataItem } from "./renderSubRows"

export default function EnhancedTable() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [grouping, setGrouping] = React.useState<string[]>([])
  const [expanded, setExpanded] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [showColumnVisibility, setShowColumnVisibility] = React.useState(false)
  const [showSortingPanel, setShowSortingPanel] = React.useState(false)
  const [showFilterSidebar, setShowFilterSidebar] = React.useState(false)

  const [filters, setFilters] = React.useState({
    name: "",
    category: [] as string[],
    subcategory: [] as string[],
    price: [0, 1000] as [number, number],
    createdAt: { from: undefined, to: undefined } as { from: Date | undefined; to: Date | undefined },
  })

  const fuse = React.useMemo(() => new Fuse(data, {
    keys: ['name'],
    threshold: 0.3,
  }), [])

  const filteredData = React.useMemo(() => {
    let result = data
    if (filters.name) {
      result = fuse.search(filters.name).map(res => res.item)
    }   
    if (filters.category.length > 0) {
      result = result.filter(item => filters.category.includes(item.category))
    }
    if (filters.subcategory.length > 0) {
      result = result.filter(item => filters.subcategory.includes(item.subcategory))
    }
    result = result.filter(item => item.price >= filters.price[0] && item.price <= filters.price[1])
    if (filters.createdAt.from && filters.createdAt.to) {
      result = result.filter(item => {
        const date = moment(item.createdAt)
        return date.isSameOrAfter(filters.createdAt.from) && date.isSameOrBefore(filters.createdAt.to)
      })
    }
    return result
  }, [filters, fuse])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      grouping,
      expanded,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    enableGrouping: true,
    enableExpanding: true,
    paginateExpandedRows: false
  })

  const uniqueCategories = React.useMemo(() => Array.from(new Set(data.map(item => item.category))), [])
  const uniqueSubcategories = React.useMemo(() => Array.from(new Set(data.map(item => item.subcategory))), [])
  const priceRange = React.useMemo(() => {
    const prices = data.map(item => item.price)
    return [Math.min(...prices), Math.max(...prices)]
  }, [])

  const dateRange = React.useMemo(() => {
    const dates = data.map(item => moment(item.createdAt))
    return {
      min: moment.min(dates).toDate(),
      max: moment.max(dates).toDate(),
    }
  }, [])

  const categoryFacets = React.useMemo(() => {
    return uniqueCategories.map(category => ({
      value: category,
      label: category,
      count: data.filter(item => item.category === category).length,
    }))
  }, [uniqueCategories])

  const subcategoryFacets = React.useMemo(() => {
    return uniqueSubcategories.map(subcategory => ({
      value: subcategory,
      label: subcategory,
      count: data.filter(item => item.subcategory === subcategory).length,
    }))
  }, [uniqueSubcategories])

  const getPageNumbers = () => {
    const totalPages = table.getPageCount()
    const currentPage = table.getState().pagination.pageIndex + 1
    const pageNumbers = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i)
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i)
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pageNumbers.push(i)
        }
      }
    }

    return pageNumbers
  }

  const handleSort = (columnId: string) => {
    const currentSorting = sorting.find(s => s.id === columnId)
    if (currentSorting) {
      if (currentSorting.desc) {
        setSorting(sorting.filter(s => s.id !== columnId))
      } else {
        setSorting(sorting.map(s => s.id === columnId ? { ...s, desc: true } : s))
      }
    } else {
      setSorting([...sorting, { id: columnId, desc: false }])
    }
  }

  return (
    <div className="w-full relative">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Filter globally..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowColumnVisibility(!showColumnVisibility)}
          >
            {showColumnVisibility ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSortingPanel(!showSortingPanel)}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilterSidebar(!showFilterSidebar)}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showColumnVisibility && (
        <div className="absolute right-0 top-16 bg-white border rounded-md shadow-lg p-4 z-10">
          <h3 className="font-semibold mb-2">Show/Hide Columns</h3>
          {table.getAllLeafColumns().map(column => (
            <div key={column.id} className="flex items-center space-x-2 mb-2">
              <Switch
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(value)}
              />
              <Label>{column.id}</Label>
            </div>
          ))}
        </div>
      )}

      {showSortingPanel && (
        <div className="absolute right-0 top-16 bg-white border rounded-md shadow-lg p-4 z-10">
          <h3 className="font-semibold mb-2">Sort Columns</h3>
          {table.getAllLeafColumns().map(column => (
            <div key={column.id} className="flex items-center space-x-2 mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort(column.id)}
              >
                {column.id}
                {sorting.find(s => s.id === column.id)?.desc ? <ChevronDown className="ml-2 h-4 w-4" /> : <ChevronUp className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          ))}
        </div>
      )}

      {showFilterSidebar && (
        <div className="fixed inset-y-0 right-0 w-64 bg-white border-l shadow-lg p-4 z-20 overflow-y-auto">
          <h3 className="font-semibold mb-4">Filters</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name-filter">Name (Fuzzy Search)</Label>
              <Input
                id="name-filter"
                value={filters.name}
                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                placeholder="Search by name..."
              />
            </div>
            <div>
              <Label>Category</Label>
              <ScrollArea className="h-32 w-full rounded border">
                {categoryFacets.map((category) => (
                  <div key={category.value} className="flex items-center space-x-2 p-2">
                    <Checkbox
                      checked={filters.category.includes(category.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilters({ ...filters, category: [...filters.category, category.value] })
                        } else {
                          setFilters({ ...filters, category: filters.category.filter(c => c !== category.value) })
                        }
                      }}
                    />
                    <Label>{category.label}</Label>
                    <Badge variant="secondary">{category.count}</Badge>
                  </div>
                ))}
              </ScrollArea>
            </div>
            <div>
              <Label>Subcategory</Label>
              <ScrollArea className="h-32 w-full rounded border">
                {subcategoryFacets.map((subcategory) => (
                  <div key={subcategory.value} className="flex items-center space-x-2 p-2">
                    <Checkbox
                      checked={filters.subcategory.includes(subcategory.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilters({ ...filters, subcategory: [...filters.subcategory, subcategory.value] })
                        } else {
                          setFilters({ ...filters, subcategory: filters.subcategory.filter(c => c !== subcategory.value) })
                        }
                      }}
                    />
                    <Label>{subcategory.label}</Label>
                    <Badge variant="secondary">{subcategory.count}</Badge>
                  </div>
                ))}
              </ScrollArea>
            </div>
            <div>
              <Label>Price Range</Label>
              <Slider
                min={priceRange[0]}
                max={priceRange[1]}
                step={1}
                value={filters.price}
                onValueChange={(value) => setFilters({ ...filters, price: value as [number, number] })}
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>${filters.price[0]}</span>
                <span>${filters.price[1]}</span>
              </div>
            </div>
            <div>
              <Label>Created At</Label>
              <DatePickerWithRange
                value={filters.createdAt}
                onChange={(value) => setFilters({ ...filters, createdAt: value as { from: Date | undefined; to: Date | undefined } })}
              />
            </div>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => renderSubRows(row as unknown as Row<DataItem>))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-center space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {getPageNumbers().map((pageNumber) => (
            <Button
              key={pageNumber}
              variant={pageNumber === table.getState().pagination.pageIndex + 1 ? "default" : "outline"}
              size="sm"
              onClick={() => table.setPageIndex(pageNumber - 1)}
            >
              {pageNumber}
            </Button>
          ))}
          {table.getPageCount() > 5 && <span className="mx-2">...</span>}
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
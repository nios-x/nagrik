"use client"

import { useState } from "react"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconArrowUp,
  IconArrowDown,
} from "@tabler/icons-react"
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Report {
  id: string
  keyword: string
  category: string
  description: string
  latitude: number
  longitude: number
  severity: "low" | "medium" | "high"
  createdAt: string
  speechStressData?: {
    wordsPerSecond: number
    repeatedWords: number
    pauseCount: number
    averagePauseDuration: number
    confidence: number
    stressIndicators: string
  } | null
}

const columns: ColumnDef<Report>[] = [
  {
    accessorKey: "id",
    header: "Report ID",
    cell: ({ row }) => <span className="font-mono text-xs text-cyan-400">{row.getValue("id")}</span>,
  },
  {
    accessorKey: "keyword",
    header: "Keyword",
    cell: ({ row }) => <span className="font-medium">{row.getValue("keyword")}</span>,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.getValue("category") as string
      const categoryColors: Record<string, string> = {
        Fire: "text-orange-400",
        Medical: "text-blue-400",
        Crime: "text-red-400",
        Accident: "text-yellow-400",
      }
      return <span className={`font-medium ${categoryColors[category] || "text-foreground"}`}>{category}</span>
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground max-w-xs truncate">{row.getValue("description")}</span>
    ),
  },
  {
    accessorKey: "latitude",
    header: "Latitude",
    cell: ({ row }) => (
      <span className="text-xs font-mono text-muted-foreground">{(row.getValue("latitude") as number).toFixed(4)}</span>
    ),
  },
  {
    accessorKey: "longitude",
    header: "Longitude",
    cell: ({ row }) => (
      <span className="text-xs font-mono text-muted-foreground">
        {(row.getValue("longitude") as number).toFixed(4)}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Time & Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt") as string)
      return <span className="text-xs text-muted-foreground">{date.toLocaleString()}</span>
    },
  },
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ row }) => {
      const severity = row.getValue("severity") as string
      const severityClass = {
        high: "px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30 shadow-lg shadow-red-500/20",
        medium:
          "px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 shadow-lg shadow-yellow-500/20",
        low: "px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30 shadow-lg shadow-green-500/20",
      }[severity]

      return <div className={severityClass}>{severity.charAt(0).toUpperCase() + severity.slice(1)}</div>
    },
  },
  {
    accessorKey: "speechStressData",
    header: "Stress Level",
    cell: ({ row }) => {
      const stressData = row.getValue("speechStressData") as Report["speechStressData"]
      if (!stressData) {
        return <span className="text-xs text-muted-foreground">N/A</span>
      }
      const confidence = stressData.confidence || 0
      const confidenceClass = confidence >= 60
        ? "px-2 py-1 rounded text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30"
        : confidence >= 40
          ? "px-2 py-1 rounded text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
          : "px-2 py-1 rounded text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30"
      
      return <div className={confidenceClass}>{confidence}%</div>
    },
  },
  {
    accessorKey: "speechStressData",
    id: "wordsPerSecond",
    header: "Speed (wps)",
    cell: ({ row }) => {
      const stressData = row.getValue("speechStressData") as Report["speechStressData"]
      if (!stressData) {
        return <span className="text-xs text-muted-foreground">N/A</span>
      }
      return <span className="text-xs font-mono text-cyan-300">{typeof stressData.wordsPerSecond === 'number' ? stressData.wordsPerSecond.toFixed(1) : '0.0'}</span>
    },
  },
]

interface ReportsTableProps {
  data: Report[]
  onRowClick?: (report: Report) => void
}

export function ReportsTable({ data, onRowClick }: ReportsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }])
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const filteredData = categoryFilter !== "all" ? data.filter((row) => row.category === categoryFilter) : data

  const table = useReactTable({
    data: filteredData,
    columns,
      state: {
    sorting,
    columnVisibility: {
      category: false, // 👈 hides category column
    },
  },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const categories = Array.from(new Set(data.map((r) => r.category)))

  return (
    <div className="space-y-1 w-full">
      <div className="flex items-center justify-between gap-4  ">
        <div className="flex items-center gap-2">
         
        </div>
        <div className="text-xs text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {data.length} reports
        </div>
      </div>

      <div className="rounded-lg border border-white/10 overflow-hidden bg-black/30 backdrop-blur-md ring mb-5 ring-indigo-500/20">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-white/5 "> 
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-indigo-300 p-2">
                    <div className="flex items-center gap-2">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <button
                          onClick={() => header.column.toggleSorting()}
                          className="text-xs text-indigo-400/60 hover:text-indigo-400"
                        >
                          {header.column.getIsSorted() ? (
                            header.column.getIsSorted() === "desc" ? (
                              <IconArrowDown className="w-3 h-3" />
                            ) : (
                              <IconArrowUp className="w-3 h-3" />
                            )
                          ) : (
                            "↕"
                          )}
                        </button>
                      )}
                    </div>
                  </TableHead>
                )),
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-white/5  hover:bg-white/10 cursor-pointer text-white transition-colors "
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 pl-3 text-white text-sm uppercase ">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-white">
                  No reports found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center  justify-between gap-4 px-4 lg:px-6">
        <div className="text-sm text-white">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-8 bg-white"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <IconChevronsLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8 bg-white"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <IconChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8 bg-white"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <IconChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8 bg-white"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <IconChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

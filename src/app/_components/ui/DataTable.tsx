"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Pagination } from "@/app/_components/ui/Pagination";

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  emptyMessage?: string;
  pagination?: {
    currentPage: number;
    lastPage: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

export function DataTable<TData>({
  columns,
  data,
  emptyMessage = "داده‌ای برای نمایش وجود ندارد.",
  pagination,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl border border-[#EDEDED] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-[#F7F7F7] border-b border-[#EDEDED]">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-xs font-semibold text-[#898989] whitespace-nowrap"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-[#898989]">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[#EDEDED] last:border-0 hover:bg-[#FBEAEA]/20 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-sm text-[#242424] whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          lastPage={pagination.lastPage}
          total={pagination.total}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  );
}
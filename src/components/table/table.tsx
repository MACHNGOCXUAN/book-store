"use client";
import { Table as TableAnt, TableProps } from "antd";
import React from "react";

interface CommonTableProps<T> {
  data: T[];
  columns: TableProps<T>["columns"];
  pagination?: {
    current?: number;
    pageSize?: number;
    total?: number;
    onChange?: (page: number, pageSize: number) => void;
    showSizeChanger?: boolean;
    pageSizeOptions?: string[];
    showQuickJumper?: boolean;
  };
  rowKey?: string;
}

export function Table<T>({
  data,
  columns,
  pagination,
}: CommonTableProps<T>) {
  return (
    <TableAnt<T>
      columns={columns}
      dataSource={data}
      pagination={pagination}
    />
  );
}

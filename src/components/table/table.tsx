"use client";
import { Table as TableAnt, TableProps } from "antd";
import React from "react";

interface CommonTableProps<T> {
  data: T[];
  columns: TableProps<T>["columns"];
  loading?: boolean;
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
  loading,
  rowKey
}: CommonTableProps<T>) {

  return (
    <TableAnt<T>
      rowKey={rowKey}
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={pagination}
    />
  );
}

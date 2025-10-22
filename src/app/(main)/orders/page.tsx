import { orderColumns, orderData } from '@/components/order/ordersTable'
import { Table } from '@/components/table/table'
import { OrderDataType } from '@/types/order.type'
import React from 'react'

export default function OrderPage() {



  return (
    <div className="boxpage">
      <div className="boxItemPage flex justify-between items-center">
        Quản lý đơn hàng
      </div>
      <div className="boxItemPage">
        Fillter
      </div>
      <div className="boxItemPage">
        <Table<OrderDataType>
          columns={orderColumns}
          data={orderData}
          rowKey='id'
        />
      </div>
    </div>
  )
}

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  getAllOrders,
  getOrdersByStatus,
  getOrdersWithFilter,
} from "../features/orders/ordersSlice";
import type { OrderFilterParams } from "../services/orderService";

/**
 * Hook to fetch all orders for current user
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 */
export const useAllOrders = (page: number = 1, limit: number = 10) => {
  const dispatch = useAppDispatch();
  const { orders, loading, error, pagination } = useAppSelector(
    (state) => state.orders
  );

  useEffect(() => {
    dispatch(getAllOrders({ page, limit }));
  }, [page, limit, dispatch]);

  return { orders, loading, error, pagination };
};

/**
 * Hook to fetch orders by status
 * @param status - Order status (PENDING, PROCESSING, COMPLETED, CANCELLED)
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 */
export const useOrdersByStatus = (
  status: string,
  page: number = 1,
  limit: number = 10
) => {
  const dispatch = useAppDispatch();
  const { orders, loading, error, pagination } = useAppSelector(
    (state) => state.orders
  );

  useEffect(() => {
    dispatch(getOrdersByStatus({ status, page, limit }));
  }, [status, page, limit, dispatch]);

  return { orders, loading, error, pagination };
};

/**
 * Hook to fetch orders with advanced filters
 * @param filters - Order filter parameters (status, date range, search, pagination)
 */
export const useOrdersWithFilter = (filters: OrderFilterParams) => {
  const dispatch = useAppDispatch();
  const { orders, loading, error, pagination } = useAppSelector(
    (state) => state.orders
  );

  useEffect(() => {
    dispatch(getOrdersWithFilter(filters));
  }, [filters, dispatch]);

  return { orders, loading, error, pagination };
};

/**
 * Hook to get current order being viewed
 */
export const useCurrentOrder = () => {
  return useAppSelector((state) => state.orders.currentOrder);
};

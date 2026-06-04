import type {
  CreateOrderRequestDto,
  CreateOrderResponseDto,
} from "@/types/api/order.dto";

/**
 * Placeholder for future BMS order creation.
 *
 * Future source of truth warning:
 * BMS/backend must validate price, inventory, coupon validity, delivery fee,
 * payment status, and final totals before creating the order.
 */
export async function createOrder(
  ..._args: [payload: CreateOrderRequestDto]
): Promise<CreateOrderResponseDto> {
  void _args;

  throw new Error("Order API not connected");
}

<?php

namespace App\Http\Controllers;

use App\Models\MealOrder;
use App\Models\MealOrderDetail;
use App\Models\SystemSettings;
use App\Models\MealItem;
use App\Models\MealPackage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OrderController extends Controller
{
    /**
     * Place a new order
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function placeOrder(Request $request): JsonResponse
    {
        try {
            // Validate request
            $request->validate([
                'items' => 'required|array|min:1',
                'items.*.itemID' => 'required|integer',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.packageID' => 'nullable|integer', // Made optional - will get from meal item
                'items.*.discount' => 'nullable|numeric|min:0',
                'items.*.notes' => 'nullable|string|max:500',
                'tableName' => 'required|string',
                'tableID' => 'required|string',
                'whouseID' => 'required|string'
            ]);

            // Get system settings
            $vatSetting = SystemSettings::getVATPercentage();
            $financeYrSetting = SystemSettings::getCurrentFinancialYear();
            
            if (!$vatSetting || !$financeYrSetting) {
                return response()->json([
                    'success' => false,
                    'message' => 'System settings not found'
                ], 500);
            }

            $vatPercentage = floatval($vatSetting->value);
            $financeYr = $financeYrSetting->value;

            // Start database transaction
            DB::beginTransaction();

            // Calculate order total
            $orderAmount = 0;
            $orderDetails = [];

            foreach ($request->items as $item) {
                $mealItem = MealItem::find($item['itemID']);
                
                if (!$mealItem) {
                    throw new \Exception("Meal item not found");
                }

                // Get packageID from meal item if not provided in request
                $packageID = $item['packageID'] ?? $mealItem->packageID;
                $mealPackage = MealPackage::find($packageID);

                if (!$mealPackage) {
                    throw new \Exception("Meal package not found");
                }

                $lineTotal = $mealItem->costPrice * $item['quantity'];
                $orderAmount += $lineTotal;

                $orderDetails[] = [
                    'mealType' => 'packageID',
                    'mealID' => $item['itemID'],
                    'itemName' => $mealItem->itemName,
                    'quantity' => $item['quantity'],
                    'costPrice' => $mealItem->costPrice,
                    'discount' => $item['discount'] ?? '0',
                    'orderTo' => $mealItem->orderTo,
                    'printOrderToIP' => '',
                    'status' => 'ordered',
                    'printStatus' => 'pending',
                    'addedBy' => 'pwa',
                    'updatedBy' => 'pwa',
                    'PaidStatus' => 'unpaid',
                    'packageID' => $packageID,
                    'packageName' => $mealPackage->packageName,
                    'notes' => $item['notes'] ?? '',
                    'coumptionCostPrice' => $mealItem->costPrice,
                    'prepareTime' => $mealItem->getEffectivePrepareTime(),
                    'prepareStatus' => 'pending',
                    'userStarted' => '',
                    'startedTime' => Carbon::now(),
                    'readyTime' => Carbon::now(),
                    'foodCostPrice' => $mealItem->costPrice,
                    'addedDate' => Carbon::now(),
                    'updatedDate' => Carbon::now()
                ];
            }

            // Calculate VAT
            $vatValue = ($orderAmount * $vatPercentage) / 100;

            // Create main order
            $order = MealOrder::create([
                'whouseID' => $request->whouseID,
                'orderFrom' => 'outside',
                'orderType' => 'table',
                'orderSource' => 'digital menu',
                'reference' => $request->tableID,
                'book' => '',
                'orderAmount' => $orderAmount,
                'paidAmount' => 0,
                'financeYr' => $financeYr,
                'status' => 'ordered',
                'vatvalue' => $vatValue,
                'vatpaid' => '0',
                'vatPercents' => $vatPercentage,
                'vatStatus' => 'active',
                'targetPrinterIP' => '',
                'printStatus' => 'pending',
                'userLetterHead' => '',
                'parentOrderID' => 0,
                'splitMethod' => '',
                'splitTo' => '',
                'autoPrintCustomerBill' => 'yes',
                'posLogoPath' => '',
                'isFreeFood' => 'no',
                'freeFoodType' => '',
                'guestMealType' => '',
                'servedBy' => '',
                'checkInID' => 0,
                'checkDetID' => 0,
                'addedBy' => 'pwa',
                'updatedBy' => 'pwa',
                'orderDisplayScreen' => '',
                'reason' => '',
                'reasonForDiscount' => '',
                'addedDate' => Carbon::now(),
                'updatedDate' => Carbon::now()
            ]);

            // Create order details
            foreach ($orderDetails as $detail) {
                $detail['orderID'] = $order->orderID;
                MealOrderDetail::create($detail);
            }


            // Commit transaction
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully in temporary tables',
                'data' => [
                    'orderID' => $order->orderID,
                    'orderAmount' => $orderAmount,
                    'vatValue' => $vatValue,
                    'totalAmount' => $orderAmount + $vatValue,
                    'tableName' => $request->tableName,
                    'orderDate' => $order->addedDate,
                    'orderTime' => $order->addedDate ? $order->addedDate->format('H:i:s') : null,
                    'status' => 'temporary'
                ]
            ]);

        } catch (\Exception $e) {
            // Rollback transaction on error
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to place order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get order details
     *
     * @param int $orderID
     * @return JsonResponse
     */
    public function getOrder($orderID): JsonResponse
    {
        try {
            $order = MealOrder::with(['orderDetails'])
                            ->find($orderID);

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $order
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get orders by table
     *
     * @param string $tableID
     * @return JsonResponse
     */
    public function getOrdersByTable($tableID): JsonResponse
    {
        try {
            $orders = MealOrder::with(['orderDetails'])
                             ->where('reference', $tableID)
                             ->orderBy('addedDate', 'desc')
                             ->get();

            return response()->json([
                'success' => true,
                'data' => $orders
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get the latest order ID
     *
     * @return JsonResponse
     */
    public function getLatestOrder(): JsonResponse
    {
        try {
            $latestOrder = MealOrder::orderBy('orderID', 'desc')->first();

            if (!$latestOrder) {
                return response()->json([
                    'success' => true,
                    'data' => null,
                    'message' => 'No orders found'
                ])->header('Cache-Control', 'no-cache, no-store, must-revalidate')
                  ->header('Pragma', 'no-cache')
                  ->header('Expires', '0');
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'orderID' => $latestOrder->orderID,
                    'tableName' => $latestOrder->reference, // Using reference as tableName
                    'orderAmount' => $latestOrder->orderAmount,
                    'orderDate' => $latestOrder->addedDate
                ]
            ])->header('Cache-Control', 'no-cache, no-store, must-revalidate')
              ->header('Pragma', 'no-cache')
              ->header('Expires', '0');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch latest order',
                'error' => $e->getMessage()
            ], 500)->header('Cache-Control', 'no-cache, no-store, must-revalidate')
                   ->header('Pragma', 'no-cache')
                   ->header('Expires', '0');
        }
    }

    /**
     * Get orders newer than specified order ID
     *
     * @param int $orderID
     * @return JsonResponse
     */
    public function getNewerOrders($orderID): JsonResponse
    {
        try {
            $orders = MealOrder::where('orderID', '>', $orderID)
                             ->orderBy('orderID', 'asc')
                             ->get();

            $formattedOrders = $orders->map(function ($order) {
                return [
                    'orderID' => $order->orderID,
                    'tableName' => $order->reference, // Using reference as tableName
                    'tableID' => $order->reference,
                    'whouseID' => $order->whouseID,
                    'orderAmount' => $order->orderAmount,
                    'vatValue' => $order->vatvalue,
                    'totalAmount' => $order->orderAmount + $order->vatvalue,
                    'orderDate' => $order->addedDate,
                    'orderTime' => $order->addedDate ? $order->addedDate->format('H:i:s') : null,
                    'status' => $order->status
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedOrders,
                'count' => $orders->count()
            ])->header('Cache-Control', 'no-cache, no-store, must-revalidate')
              ->header('Pragma', 'no-cache')
              ->header('Expires', '0');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch newer orders',
                'error' => $e->getMessage()
            ], 500)->header('Cache-Control', 'no-cache, no-store, must-revalidate')
                   ->header('Pragma', 'no-cache')
                   ->header('Expires', '0');
        }
    }

    /**
     * Update order status
     *
     * @param Request $request
     * @param int $orderID
     * @return JsonResponse
     */
    public function updateOrderStatus(Request $request, $orderID): JsonResponse
    {
        try {
            $request->validate([
                'status' => 'required|string|in:ordered,preparing,ready,served,cancelled,completed'
            ]);

            $order = MealOrder::find($orderID);

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            $order->update(['status' => $request->status]);

            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully',
                'data' => $order
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

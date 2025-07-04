<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserCommission;
use App\Models\commissions\RechargeCommission;
use App\Models\commissions\ElectricityCommission;
use App\Models\commissions\DigitalvoucherCommission;
use App\Models\commissions\DatacardCommission;
use App\Models\commissions\GasfastagCommission;
use App\Models\commissions\CMSCommission;
use App\Models\commissions\ChallanCommission;
use App\Models\commissions\CableCommission;
use App\Models\commissions\BroadbandCommission;
use App\Models\commissions\BankCommission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class CommissionController extends Controller
{
    /**
     * Render the commission management page.
     *
     * @return \Inertia\Response
     */
    public function commission()
    {
        return Inertia::render('Admin/commission');
    }

    /**
     * Fetch all default commissions.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCommissions()
    {
        try {
            $commissions = [
                'recharge_commissions' => RechargeCommission::all()->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'operator_name' => $item->operator_name,
                        'operator_id' => $item->operator_id,
                        'category' => $item->category,
                        'commission' => $item->server_1_commission,
                        'our_commission' => $item->our_commission,
                    ];
                })->toArray(),
                'electricity_commissions' => ElectricityCommission::all()->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'operator_name' => $item->operator_name,
                        'operator_id' => $item->operator_id,
                        'type' => $item->type,
                        'commission' => $item->commission,
                        'our_commission' => $item->our_commission,
                    ];
                })->toArray(),
                'digital_voucher_commissions' => DigitalvoucherCommission::all()->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'operator_name' => $item->operator_name,
                        'operator_id' => $item->operator_id,
                        'type' => $item->type,
                        'commission' => $item->commission,
                        'our_commission' => $item->our_commission,
                    ];
                })->toArray(),
                'datacard_commissions' => DatacardCommission::all()->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'operator_name' => $item->operator_name,
                        'operator_id' => $item->operator_id,
                        'type' => $item->type,
                        'commission' => $item->commission,
                        'our_commission' => $item->our_commission,
                    ];
                })->toArray(),
                'gas_fastag_commissions' => GasfastagCommission::all()->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'operator_name' => $item->operator_name,
                        'category' => $item->category,
                        'type' => $item->type,
                        'commission' => $item->commission,
                        'our_commission' => $item->our_commission,
                    ];
                })->toArray(),
                'cms_commissions' => CMSCommission::all()->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'operator_name' => $item->operator_name,
                        'operator_id' => $item->operator_id,
                        'type' => $item->type,
                        'commission' => $item->commission,
                        'our_commission' => $item->our_commission,
                    ];
                })->toArray(),
                'challan_commissions' => ChallanCommission::all()->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'operator_name' => $item->operator_name,
                        'operator_id' => $item->operator_id,
                        'type' => $item->type,
                        'commission' => $item->commission,
                        'our_commission' => $item->our_commission,
                    ];
                })->toArray(),
                'cable_commissions' => CableCommission::all()->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'operator_name' => $item->operator_name,
                        'operator_id' => $item->operator_id,
                        'type' => $item->type,
                        'commission' => $item->commission,
                        'our_commission' => $item->our_commission,
                    ];
                })->toArray(),
                'broadband_commissions' => BroadbandCommission::all()->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'operator_name' => $item->operator_name,
                        'operator_id' => $item->operator_id,
                        'category' => $item->category,
                        'type' => $item->type,
                        'commission' => $item->commission,
                        'our_commission' => $item->our_commission,
                    ];
                })->toArray(),
                'bank_commissions' => BankCommission::all()->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'transaction_amount' => $item->transaction_amount,
                        'category' => $item->category,
                        'commission' => $item->commission,
                        'our_commission' => $item->our_commission,
                    ];
                })->toArray(),
            ];

            return response()->json($commissions, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch commissions: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update default commissions for a specific commission type.
     *
     * @param Request $request
     * @param string $type
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateCommissions(Request $request, $type)
    {
        $validator = Validator::make($request->all(), [
            '*.id' => 'required|integer',
            '*.our_commission' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        try {
            $data = $request->all();

            switch ($type) {
                case 'recharge':
                    foreach ($data as $commission) {
                        RechargeCommission::where('id', $commission['id'])->update(['our_commission' => $commission['our_commission']]);
                    }
                    break;

                case 'electricity':
                    foreach ($data as $commission) {
                        ElectricityCommission::where('id', $commission['id'])->update(['our_commission' => $commission['our_commission']]);
                    }
                    break;

                case 'digital_voucher':
                    foreach ($data as $commission) {
                        DigitalvoucherCommission::where('id', $commission['id'])->update(['our_commission' => $commission['our_commission']]);
                    }
                    break;

                case 'datacard':
                    foreach ($data as $commission) {
                        DatacardCommission::where('id', $commission['id'])->update(['our_commission' => $commission['our_commission']]);
                    }
                    break;

                case 'gas_fastag':
                    foreach ($data as $commission) {
                        GasfastagCommission::where('id', $commission['id'])->update(['our_commission' => $commission['our_commission']]);
                    }
                    break;

                case 'cms':
                    foreach ($data as $commission) {
                        CMSCommission::where('id', $commission['id'])->update(['our_commission' => $commission['our_commission']]);
                    }
                    break;

                case 'challan':
                    foreach ($data as $commission) {
                        ChallanCommission::where('id', $commission['id'])->update(['our_commission' => $commission['our_commission']]);
                    }
                    break;

                case 'cable':
                    foreach ($data as $commission) {
                        CableCommission::where('id', $commission['id'])->update(['our_commission' => $commission['our_commission']]);
                    }
                    break;

                case 'broadband':
                    foreach ($data as $commission) {
                        BroadbandCommission::where('id', $commission['id'])->update(['our_commission' => $commission['our_commission']]);
                    }
                    break;

                case 'bank':
                    foreach ($data as $commission) {
                        BankCommission::where('id', $commission['id'])->update(['our_commission' => $commission['our_commission']]);
                    }
                    break;

                default:
                    return response()->json(['error' => 'Invalid commission type'], 400);
            }

            return response()->json(['message' => 'Default commissions updated successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update commissions: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Fetch all users for the dropdown.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUsers()
    {
        try {
            $users = User::select('id', 'name', 'email')->get()->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ];
            })->toArray();

            return response()->json($users, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch users: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Fetch user-specific commissions for a given user.
     *
     * @param int $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserCommissions($userId)
    {
        try {
            $user = User::findOrFail($userId);
            $userCommissions = UserCommission::where('user_id', $userId)->get()->map(function ($item) {
                return [
                    'id' => $item->id,
                    'commission_type' => $item->commission_type,
                    'commission_id' => $item->commission_id,
                    'user_commission' => $item->user_commission,
                ];
            })->toArray();

            // Fetch default commissions for comparison or fallback
            $defaultCommissions = $this->getCommissions()->getData(true);

            return response()->json([
                'user_commissions' => $userCommissions,
                'default_commissions' => $defaultCommissions,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch user commissions: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update user-specific commissions.
     *
     * @param Request $request
     * @param int $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateUserCommissions(Request $request, $userId)
    {
        $validator = Validator::make($request->all(), [
            '*.commission_type' => 'required|string|in:recharge,electricity,digital_voucher,datacard,gas_fastag,cms,challan,cable,broadband,bank',
            '*.commission_id' => 'required|integer',
            '*.user_commission' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        try {
            $user = User::findOrFail($userId);
            $data = $request->all();

            foreach ($data as $commission) {
                UserCommission::updateOrCreate(
                    [
                        'user_id' => $userId,
                        'commission_type' => $commission['commission_type'],
                        'commission_id' => $commission['commission_id'],
                    ],
                    [
                        'user_commission' => $commission['user_commission'],
                    ]
                );
            }

            return response()->json(['message' => 'User commissions updated successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update user commissions: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Render the commission management page.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        return Inertia::render('Admin/Commission');
    }
}
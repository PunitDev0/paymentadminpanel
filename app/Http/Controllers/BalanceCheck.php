<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class BalanceCheck extends Controller
{
    public function balanceCheck()
    {
        // dd('erufgre');
        try{
        $key = '2940CB60C489CEA1AD49AC96BBDC6310';
        $url = 'https://api.billavenue.com/billpay/enquireDeposit/fetchDetails/xml';
        $xml = '<?xml version="1.0" encoding="UTF-8"?><depositDetailsRequest><fromDate>2017-08-22</fromDate><toDate>2017-09-22</toDate><transType>DR</transType><agents><agentId>CC01RP16AGTU00000001</agentId></agents></depositDetailsRequest>';
        $encRequest = \CJS::encrypt($xml, $key);
        $parameter = [
            'accessCode' => 'AVQU51SS09TR19KLWN',
            'requestId' => \MyHelper::generateRequestId(),
            'ver' => '1.0',
            'instituteId' => 'RP16',
            'encRequest' => $encRequest,
        ]; 
        // dd($parameter);
        // $header = array(
        //     'Content-Type: application/x-www-form-urlencoded'
        // );
 

        $res = \MyHelper::curl($url, "POST", $parameter, 'no'); 
        // dd($res);
        $billdetail = \CJS::decrypt($res['response'], $key);
        // dd($billdetail);
        // Convert XML to JSON
        $xmlObject = simplexml_load_string($billdetail);
        $jsonData = json_encode($xmlObject);
        $arrayData = json_decode($jsonData, true); // Convert to associative array if needed
        // dd($arrayData);
        return response()->json([
            'status' => true,
            'currentBalance' => $arrayData['currentBalance'],
        ]);
       }
       catch (\Exception $e){
        return response()->json([
            'status' => false,
            'message' => $e. "Error",
        ]);
       }
    }
}

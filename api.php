<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if (!file_exists('config.php')) {
    echo json_encode([
        'success' => false,
        'needs_install' => true,
        'message' => 'Configuration file config.php not found. Please run install.php first.'
    ]);
    exit;
}

require_once 'config.php';

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit;
}

$action = $_GET['action'] ?? '';

if ($action === 'check') {
    echo json_encode(['success' => true]);
    exit;
}

if ($action === 'get_data') {
    try {
        // Fetch Agent Info (assuming single agent AGT-799 for simulation simplicity)
        $stmt = $pdo->query("SELECT * FROM agents WHERE code = 'AGT-799' LIMIT 1");
        $agent = $stmt->fetch();
        
        if (!$agent) {
            // Seed default agent if missing
            $pdo->query("INSERT INTO agents (name, village, phone, code, wallet_balance) VALUES ('Dinesh Chaudhary', 'Gozaria Village', '9876543210', 'AGT-799', 525.00)");
            $stmt = $pdo->query("SELECT * FROM agents WHERE code = 'AGT-799' LIMIT 1");
            $agent = $stmt->fetch();
        }

        // Fetch Transactions
        $stmt = $pdo->query("SELECT * FROM transactions ORDER BY id DESC");
        $transactions = $stmt->fetchAll();

        // Fetch Hospitals and Doctors
        $stmt = $pdo->query("SELECT * FROM hospitals");
        $dbHospitals = $stmt->fetchAll();
        
        $hospitals = [];
        foreach ($dbHospitals as $dbHosp) {
            $stmt = $pdo->prepare("SELECT * FROM doctors WHERE hospital_id = ?");
            $stmt->execute([$dbHosp['id']]);
            $dbDocs = $stmt->fetchAll();
            
            $doctors = [];
            foreach ($dbDocs as $doc) {
                $doctors[] = [
                    'id' => $doc['id'],
                    'name' => $doc['name'],
                    'department' => $doc['department'],
                    'specialty' => $doc['specialty'],
                    'experience' => (int)$doc['experience'],
                    'fee' => (int)$doc['fee'],
                    'weeklyDays' => json_decode($doc['weekly_days']),
                    'slotsPerDay' => (int)$doc['slots_per_day'],
                    'isActive' => (bool)$doc['is_active']
                ];
            }
            
            $hospitals[] = [
                'id' => $dbHosp['id'],
                'name' => $dbHosp['name'],
                'city' => $dbHosp['city'],
                'address' => $dbHosp['address'],
                'departments' => json_decode($dbHosp['departments']),
                'doctors' => $doctors
            ];
        }

        // Fetch Appointments
        $stmt = $pdo->query("SELECT * FROM appointments ORDER BY created_at DESC");
        $dbAppointments = $stmt->fetchAll();
        $appointments = [];
        foreach ($dbAppointments as $app) {
            $appointments[] = [
                'id' => $app['id'],
                'patientName' => $app['patient_name'],
                'patientPhone' => $app['patient_phone'],
                'patientAge' => (int)$app['patient_age'],
                'hospitalId' => $app['hospital_id'],
                'hospitalName' => $app['hospital_name'],
                'hospitalCity' => $app['hospital_city'],
                'hospitalAddress' => $app['hospital_address'],
                'doctorId' => $app['doctor_id'],
                'doctorName' => $app['doctor_name'],
                'department' => $app['department'],
                'date' => $app['date'],
                'timeSlot' => $app['time_slot'],
                'status' => $app['status'],
                'caseType' => $app['case_type'],
                'feePaid' => (int)$app['fee_paid'],
                'paymentMethod' => $app['payment_method'],
                'paymentId' => $app['payment_id'],
                'tokenNumber' => (int)$app['token_number'],
                'createdAt' => $app['created_at']
            ];
        }

        echo json_encode([
            'success' => true,
            'agent_profile' => [
                'name' => $agent['name'],
                'village' => $agent['village'],
                'phone' => $agent['phone'],
                'code' => $agent['code']
            ],
            'wallet_balance' => (int)$agent['wallet_balance'],
            'transactions' => array_map(function($tx) {
                return [
                    'id' => $tx['id'],
                    'date' => $tx['date'],
                    'type' => $tx['type'],
                    'amount' => (int)$tx['amount'],
                    'details' => $tx['details']
                ];
            }, $transactions),
            'hospitals' => $hospitals,
            'appointments' => $appointments
        ]);

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if ($action === 'recharge') {
        $amount = (int)($input['amount'] ?? 0);
        if ($amount <= 0) {
            echo json_encode(['success' => false, 'message' => 'Invalid recharge amount']);
            exit;
        }

        $bonus = floor($amount / 500) * 25;
        $totalCredit = $amount + $bonus;

        try {
            $pdo->beginTransaction();

            // Update Agent balance
            $stmt = $pdo->prepare("UPDATE agents SET wallet_balance = wallet_balance + ? WHERE code = 'AGT-799'");
            $stmt->execute([$totalCredit]);

            // Log Transaction
            $stmt = $pdo->prepare("INSERT INTO transactions (date, type, amount, details) VALUES (?, ?, ?, ?)");
            $stmt->execute([
                date('Y-m-d'),
                'credit',
                $totalCredit,
                "Wallet Recharge (Amount: {$amount} + Bonus: {$bonus})"
            ]);

            $pdo->commit();
            echo json_encode(['success' => true, 'balance_credited' => $totalCredit]);
        } catch (Exception $e) {
            $pdo->rollBack();
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit;
    }

    if ($action === 'book') {
        $patientName = $input['patientName'] ?? '';
        $patientPhone = $input['patientPhone'] ?? '';
        $patientAge = (int)($input['patientAge'] ?? 0);
        $hospitalId = $input['hospitalId'] ?? '';
        $doctorId = $input['doctorId'] ?? '';
        $dateStr = $input['dateStr'] ?? '';
        $timeSlot = $input['timeSlot'] ?? '';
        $useWallet = (bool)($input['useWallet'] ?? false);

        try {
            $pdo->beginTransaction();

            // Get Hospital and Doctor details
            $stmt = $pdo->prepare("SELECT * FROM hospitals WHERE id = ?");
            $stmt->execute([$hospitalId]);
            $hospital = $stmt->fetch();

            $stmt = $pdo->prepare("SELECT * FROM doctors WHERE id = ? AND hospital_id = ?");
            $stmt->execute([$doctorId, $hospitalId]);
            $doctor = $stmt->fetch();

            if (!$hospital || !$doctor) {
                throw new Exception('Invalid hospital or doctor');
            }

            // Check slots booked count
            $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ? AND date = ? AND status != 'Canceled'");
            $stmt->execute([$doctorId, $dateStr]);
            $bookedCount = (int)$stmt->fetch()['count'];

            if ($bookedCount >= (int)$doctor['slots_per_day']) {
                throw new Exception('Doctor is fully booked');
            }

            // Check return case status
            $stmt = $pdo->prepare("SELECT date FROM appointments WHERE patient_phone = ? AND hospital_id = ? AND department = ? AND status != 'Canceled' ORDER BY date DESC LIMIT 1");
            $stmt->execute([$patientPhone, $hospitalId, $doctor['department']]);
            $lastApp = $stmt->fetch();

            $isReturn = false;
            if ($lastApp) {
                $lastDate = new DateTime($lastApp['date']);
                $today = new DateTime();
                $diff = $today->diff($lastDate)->days;
                if ($diff <= 30) {
                    $isReturn = true;
                }
            }

            $fee = $isReturn ? 0 : 151;
            $caseType = $isReturn ? 'Return Case' : 'New Case';
            $payMethod = 'Direct UPI';
            $transactionId = 'pay_upi_' . substr(time(), -6);

            if ($fee > 0) {
                if ($useWallet) {
                    // Check agent balance
                    $stmt = $pdo->query("SELECT wallet_balance FROM agents WHERE code = 'AGT-799' LIMIT 1");
                    $balance = (int)$stmt->fetch()['wallet_balance'];
                    if ($balance < 151) {
                        throw new Exception('Insufficient wallet balance');
                    }

                    // Deduct wallet
                    $stmt = $pdo->prepare("UPDATE agents SET wallet_balance = wallet_balance - 151 WHERE code = 'AGT-799'");
                    $stmt->execute();

                    $payMethod = 'Wallet';
                    $transactionId = 'pay_wlt_' . substr(time(), -6);

                    // Insert Transaction
                    $stmt = $pdo->prepare("INSERT INTO transactions (date, type, amount, details) VALUES (?, ?, ?, ?)");
                    $stmt->execute([
                        date('Y-m-d'),
                        'debit',
                        151,
                        "Booking for {$patientName} ({$doctor['name']})"
                      ]);
                }
            } else {
                $payMethod = 'Waived';
                $transactionId = 'waived_return_case';
            }

            $tokenNumber = $bookedCount + 1;
            $appId = 'TK-' . substr(time(), -6);

            // Insert Appointment
            $stmt = $pdo->prepare("INSERT INTO appointments (id, patient_name, patient_phone, patient_age, hospital_id, hospital_name, hospital_city, hospital_address, doctor_id, doctor_name, department, date, time_slot, status, case_type, fee_paid, payment_method, payment_id, token_number, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            
            $createdAt = date('Y-m-d H:i:s');
            $stmt->execute([
                $appId,
                $patientName,
                $patientPhone,
                $patientAge,
                $hospitalId,
                $hospital['name'],
                $hospital['city'],
                $hospital['address'],
                $doctorId,
                $doctor['name'],
                $doctor['department'],
                $dateStr,
                $timeSlot,
                'Planned',
                $caseType,
                $fee,
                $payMethod,
                $transactionId,
                $tokenNumber,
                $createdAt
            ]);

            $pdo->commit();
            echo json_encode([
                'success' => true,
                'appointment' => [
                    'id' => $appId,
                    'patientName' => $patientName,
                    'patientPhone' => $patientPhone,
                    'patientAge' => $patientAge,
                    'hospitalId' => $hospitalId,
                    'hospitalName' => $hospital['name'],
                    'hospitalCity' => $hospital['city'],
                    'hospitalAddress' => $hospital['address'],
                    'doctorId' => $doctorId,
                    'doctorName' => $doctor['name'],
                    'department' => $doctor['department'],
                    'date' => $dateStr,
                    'timeSlot' => $timeSlot,
                    'status' => 'Planned',
                    'caseType' => $caseType,
                    'feePaid' => $fee,
                    'paymentMethod' => $payMethod,
                    'paymentId' => $transactionId,
                    'tokenNumber' => $tokenNumber,
                    'createdAt' => $createdAt
                ]
            ]);

        } catch (Exception $e) {
            $pdo->rollBack();
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit;
    }

    if ($action === 'complete') {
        $appId = $input['appointmentId'] ?? '';
        try {
            $stmt = $pdo->prepare("UPDATE appointments SET status = 'Completed' WHERE id = ?");
            $stmt->execute([$appId]);
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit;
    }

    if ($action === 'cancel') {
        $appId = $input['appointmentId'] ?? '';
        try {
            $pdo->beginTransaction();

            // Fetch booking details
            $stmt = $pdo->prepare("SELECT * FROM appointments WHERE id = ?");
            $stmt->execute([$appId]);
            $app = $stmt->fetch();

            if (!$app) {
                throw new Exception('Appointment not found');
            }

            if ($app['status'] !== 'Canceled') {
                // Refund if paid via wallet
                if ((int)$app['fee_paid'] > 0 && $app['payment_method'] === 'Wallet') {
                    $stmt = $pdo->prepare("UPDATE agents SET wallet_balance = wallet_balance + ? WHERE code = 'AGT-799'");
                    $stmt->execute([$app['fee_paid']]);

                    $stmt = $pdo->prepare("INSERT INTO transactions (date, type, amount, details) VALUES (?, ?, ?, ?)");
                    $stmt->execute([
                        date('Y-m-d'),
                        'credit',
                        $app['fee_paid'],
                        "Refund for canceled booking {$appId}"
                    ]);
                }

                $stmt = $pdo->prepare("UPDATE appointments SET status = 'Canceled' WHERE id = ?");
                $stmt->execute([$appId]);
            }

            $pdo->commit();
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            $pdo->rollBack();
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit;
    }

    if ($action === 'doctor_update') {
        $hospitalId = $input['hospitalId'] ?? '';
        $docId = $input['doctorId'] ?? '';
        $name = $input['name'] ?? '';
        $department = $input['department'] ?? '';
        $specialty = $input['specialty'] ?? '';
        $experience = (int)($input['experience'] ?? 0);
        $slotsPerDay = (int)($input['slotsPerDay'] ?? 8);
        $weeklyDays = json_encode($input['weeklyDays'] ?? []);
        $isActive = isset($input['isActive']) ? (int)$input['isActive'] : 1;

        try {
            if ($docId) {
                // Update
                $stmt = $pdo->prepare("UPDATE doctors SET name = ?, department = ?, specialty = ?, experience = ?, slots_per_day = ?, weekly_days = ?, is_active = ? WHERE id = ? AND hospital_id = ?");
                $stmt->execute([$name, $department, $specialty, $experience, $slotsPerDay, $weeklyDays, $isActive, $docId, $hospitalId]);
            } else {
                // Insert
                $newId = 'doc-' . substr(time(), -6);
                $stmt = $pdo->prepare("INSERT INTO doctors (id, hospital_id, name, department, specialty, experience, fee, weekly_days, slots_per_day, is_active) VALUES (?, ?, ?, ?, ?, ?, 151, ?, ?, ?)");
                $stmt->execute([$newId, $hospitalId, $name, $department, $specialty, $experience, $weeklyDays, $slotsPerDay, $isActive]);
            }
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit;
    }

    if ($action === 'profile_update') {
        $name = $input['name'] ?? '';
        $village = $input['village'] ?? '';
        $phone = $input['phone'] ?? '';

        try {
            $stmt = $pdo->prepare("UPDATE agents SET name = ?, village = ?, phone = ? WHERE code = 'AGT-799'");
            $stmt->execute([$name, $village, $phone]);
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit;
    }
}

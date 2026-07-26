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
        $agentCode = $_GET['agent_code'] ?? 'AGT-799';

        // Fetch Current Agent Info
        $stmt = $pdo->prepare("SELECT * FROM agents WHERE code = ? LIMIT 1");
        $stmt->execute([$agentCode]);
        $agent = $stmt->fetch();
        
        if (!$agent && $agentCode === 'AGT-799') {
            // Seed default agent if missing
            $pdo->query("INSERT INTO agents (name, village, phone, code, password, status, wallet_balance) VALUES ('Dinesh Chaudhary', 'Gozaria Village', '9876543210', 'AGT-799', 'agent', 'approved', 525.00)");
            $stmt = $pdo->query("SELECT * FROM agents WHERE code = 'AGT-799' LIMIT 1");
            $agent = $stmt->fetch();
        }

        // Fetch All Agents for Superadmin Dashboard
        $stmt = $pdo->query("SELECT * FROM agents ORDER BY id DESC");
        $allAgents = $stmt->fetchAll();

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
                'patientGender' => $app['patient_gender'] ?? 'Male',
                'problemDescription' => $app['problem_description'] ?? '',
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
            'agent_profile' => $agent ? [
                'name' => $agent['name'],
                'village' => $agent['village'],
                'phone' => $agent['phone'],
                'code' => $agent['code']
            ] : null,
            'wallet_balance' => $agent ? (int)$agent['wallet_balance'] : 0,
            'all_agents' => array_map(function($a) {
                return [
                    'id' => $a['id'],
                    'name' => $a['name'],
                    'village' => $a['village'],
                    'phone' => $a['phone'],
                    'code' => $a['code'],
                    'status' => $a['status'],
                    'wallet_balance' => (int)$a['wallet_balance']
                ];
            }, $allAgents),
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
    
    if ($action === 'login') {
        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';

        if (empty($username) || empty($password)) {
            echo json_encode(['success' => false, 'message' => 'Credentials required']);
            exit;
        }

        // Check hardcoded logins
        if ($username === 'superadmin' && $password === 'superadmin') {
            echo json_encode([
                'success' => true,
                'role' => 'superadmin',
                'user' => ['name' => 'Superadmin Desk', 'code' => 'SUPERADMIN']
            ]);
            exit;
        }

        if ($username === 'admin' && $password === 'admin') {
            echo json_encode([
                'success' => true,
                'role' => 'admin',
                'user' => ['name' => 'Hospital Admin', 'code' => 'ADMIN']
            ]);
            exit;
        }

        if ($username === 'doctor' && $password === 'doctor') {
            echo json_encode([
                'success' => true,
                'role' => 'doctor',
                'user' => ['name' => 'Dr. Kirit Patel', 'code' => 'doc-1']
            ]);
            exit;
        }

        // Check Agent Login in database
        try {
            $stmt = $pdo->prepare("SELECT * FROM agents WHERE (code = ? OR phone = ?)");
            $stmt->execute([$username, $username]);
            $agent = $stmt->fetch();

            if ($agent && $agent['password'] === $password) {
                if ($agent['status'] === 'pending') {
                    echo json_encode(['success' => false, 'message' => 'Agent account registration is pending Superadmin approval.']);
                } else {
                    echo json_encode([
                        'success' => true,
                        'role' => 'agent',
                        'user' => [
                            'name' => $agent['name'],
                            'code' => $agent['code'],
                            'village' => $agent['village'],
                            'phone' => $agent['phone']
                        ]
                    ]);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit;
    }

    if ($action === 'register_agent') {
        $name = $input['name'] ?? '';
        $phone = $input['phone'] ?? '';
        $village = $input['village'] ?? '';
        $password = $input['password'] ?? 'agent';

        if (empty($name) || empty($phone) || empty($village)) {
            echo json_encode(['success' => false, 'message' => 'All details are required']);
            exit;
        }

        try {
            // Check if phone already registered
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM agents WHERE phone = ?");
            $stmt->execute([$phone]);
            if ($stmt->fetchColumn() > 0) {
                echo json_encode(['success' => false, 'message' => 'Phone number already registered']);
                exit;
            }

            // Generate unique agent code
            $agentCount = (int)$pdo->query("SELECT COUNT(*) FROM agents")->fetchColumn();
            $newCode = 'AGT-' . (800 + $agentCount);

            $stmt = $pdo->prepare("INSERT INTO agents (name, village, phone, code, password, status, wallet_balance) VALUES (?, ?, ?, ?, ?, 'pending', 0.00)");
            $stmt->execute([$name, $village, $phone, $newCode, $password]);

            echo json_encode([
                'success' => true,
                'message' => "Registration request submitted. Your Agent Code will be {$newCode}. Please wait for Superadmin activation."
            ]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit;
    }

    if ($action === 'approve_agent') {
        $agentId = (int)($input['agentId'] ?? 0);
        try {
            $pdo->beginTransaction();

            $stmt = $pdo->prepare("UPDATE agents SET status = 'approved' WHERE id = ?");
            $stmt->execute([$agentId]);

            // Add welcome bonus
            $stmt = $pdo->prepare("UPDATE agents SET wallet_balance = wallet_balance + 525.00 WHERE id = ?");
            $stmt->execute([$agentId]);

            $stmt = $pdo->prepare("SELECT name FROM agents WHERE id = ?");
            $stmt->execute([$agentId]);
            $name = $stmt->fetchColumn();

            $stmt = $pdo->prepare("INSERT INTO transactions (date, type, amount, details) VALUES (?, ?, ?, ?)");
            $stmt->execute([
                date('Y-m-d'),
                'credit',
                525.00,
                "Activation Bonus for Agent {$name}"
            ]);

            $pdo->commit();
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            $pdo->rollBack();
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit;
    }

    if ($action === 'reject_agent') {
        $agentId = (int)($input['agentId'] ?? 0);
        try {
            $stmt = $pdo->prepare("DELETE FROM agents WHERE id = ?");
            $stmt->execute([$agentId]);
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit;
    }

    if ($action === 'recharge') {
        $agentCode = $_GET['agent_code'] ?? 'AGT-799';
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
            $stmt = $pdo->prepare("UPDATE agents SET wallet_balance = wallet_balance + ? WHERE code = ?");
            $stmt->execute([$totalCredit, $agentCode]);

            // Log Transaction
            $stmt = $pdo->prepare("INSERT INTO transactions (date, type, amount, details) VALUES (?, ?, ?, ?)");
            $stmt->execute([
                date('Y-m-d'),
                'credit',
                $totalCredit,
                "Wallet Recharge (Amount: {$amount} + Bonus: {$bonus})"
            ]);

            $pdo->commit();
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            $pdo->rollBack();
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit;
    }

    if ($action === 'book') {
        $agentCode = $_GET['agent_code'] ?? 'AGT-799';
        $patientName = $input['patientName'] ?? '';
        $patientPhone = $input['patientPhone'] ?? '';
        $patientAge = (int)($input['patientAge'] ?? 0);
        $patientGender = $input['patientGender'] ?? 'Male';
        $problemDescription = $input['problemDescription'] ?? '';
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
                    $stmt = $pdo->prepare("SELECT wallet_balance FROM agents WHERE code = ? LIMIT 1");
                    $stmt->execute([$agentCode]);
                    $balance = (int)$stmt->fetch()['wallet_balance'];
                    if ($balance < 151) {
                        throw new Exception('Insufficient wallet balance');
                    }

                    // Deduct wallet
                    $stmt = $pdo->prepare("UPDATE agents SET wallet_balance = wallet_balance - 151 WHERE code = ?");
                    $stmt->execute([$agentCode]);

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
            $stmt = $pdo->prepare("INSERT INTO appointments (id, patient_name, patient_phone, patient_age, patient_gender, problem_description, hospital_id, hospital_name, hospital_city, hospital_address, doctor_id, doctor_name, department, date, time_slot, status, case_type, fee_paid, payment_method, payment_id, token_number, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            
            $createdAt = date('Y-m-d H:i:s');
            $stmt->execute([
                $appId,
                $patientName,
                $patientPhone,
                $patientAge,
                $patientGender,
                $problemDescription,
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
                    'patientGender' => $patientGender,
                    'problemDescription' => $problemDescription,
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
        $agentCode = $_GET['agent_code'] ?? 'AGT-799';
        $appId = $input['appointmentId'] ?? '';
        try {
            $pdo->beginTransaction();

            $stmt = $pdo->prepare("SELECT * FROM appointments WHERE id = ?");
            $stmt->execute([$appId]);
            $app = $stmt->fetch();

            if (!$app) {
                throw new Exception('Appointment not found');
            }

            if ($app['status'] !== 'Canceled') {
                if ((int)$app['fee_paid'] > 0 && $app['payment_method'] === 'Wallet') {
                    $stmt = $pdo->prepare("UPDATE agents SET wallet_balance = wallet_balance + ? WHERE code = ?");
                    $stmt->execute([$app['fee_paid'], $agentCode]);

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
                $stmt = $pdo->prepare("UPDATE doctors SET name = ?, department = ?, specialty = ?, experience = ?, slots_per_day = ?, weekly_days = ?, is_active = ? WHERE id = ? AND hospital_id = ?");
                $stmt->execute([$name, $department, $specialty, $experience, $slotsPerDay, $weeklyDays, $isActive, $docId, $hospitalId]);
            } else {
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
        $agentCode = $_GET['agent_code'] ?? 'AGT-799';
        $name = $input['name'] ?? '';
        $village = $input['village'] ?? '';
        $phone = $input['phone'] ?? '';

        try {
            $stmt = $pdo->prepare("UPDATE agents SET name = ?, village = ?, phone = ? WHERE code = ?");
            $stmt->execute([$name, $village, $phone, $agentCode]);
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit;
    }
}

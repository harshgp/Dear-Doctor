<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$installed = false;
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $db_host = $_POST['db_host'] ?? 'localhost';
    $db_name = $_POST['db_name'] ?? '';
    $db_user = $_POST['db_user'] ?? '';
    $db_pass = $_POST['db_pass'] ?? '';

    if (empty($db_name) || empty($db_user)) {
        $error = 'Database Name and Username are required.';
    } else {
        try {
            // Test connection
            $pdo = new PDO("mysql:host=$db_host;charset=utf8mb4", $db_user, $db_pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
            ]);
            
            // Create database if not exists (if permission allowed, else assume it exists)
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci");
            $pdo->exec("USE `$db_name`");

            // Setup Tables
            $queries = [
                "CREATE TABLE IF NOT EXISTS agents (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    village VARCHAR(100) NOT NULL,
                    phone VARCHAR(20) NOT NULL,
                    code VARCHAR(50) UNIQUE NOT NULL,
                    wallet_balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

                "CREATE TABLE IF NOT EXISTS transactions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    date DATE NOT NULL,
                    type VARCHAR(20) NOT NULL,
                    amount DECIMAL(10, 2) NOT NULL,
                    details VARCHAR(255) NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

                "CREATE TABLE IF NOT EXISTS hospitals (
                    id VARCHAR(50) PRIMARY KEY,
                    name VARCHAR(150) NOT NULL,
                    city VARCHAR(100) NOT NULL,
                    address VARCHAR(255) NOT NULL,
                    departments TEXT NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

                "CREATE TABLE IF NOT EXISTS doctors (
                    id VARCHAR(50) PRIMARY KEY,
                    hospital_id VARCHAR(50) NOT NULL,
                    name VARCHAR(100) NOT NULL,
                    department VARCHAR(100) NOT NULL,
                    specialty VARCHAR(100) NOT NULL,
                    experience INT NOT NULL,
                    fee INT NOT NULL,
                    weekly_days TEXT NOT NULL,
                    slots_per_day INT NOT NULL,
                    is_active TINYINT(1) NOT NULL DEFAULT 1,
                    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

                "CREATE TABLE IF NOT EXISTS appointments (
                    id VARCHAR(50) PRIMARY KEY,
                    patient_name VARCHAR(100) NOT NULL,
                    patient_phone VARCHAR(20) NOT NULL,
                    patient_age INT NOT NULL,
                    hospital_id VARCHAR(50) NOT NULL,
                    hospital_name VARCHAR(150) NOT NULL,
                    hospital_city VARCHAR(100) NOT NULL,
                    hospital_address VARCHAR(255) NOT NULL,
                    doctor_id VARCHAR(50) NOT NULL,
                    doctor_name VARCHAR(100) NOT NULL,
                    department VARCHAR(100) NOT NULL,
                    date DATE NOT NULL,
                    time_slot VARCHAR(100) NOT NULL,
                    status VARCHAR(50) NOT NULL,
                    case_type VARCHAR(50) NOT NULL,
                    fee_paid INT NOT NULL,
                    payment_method VARCHAR(50) NOT NULL,
                    payment_id VARCHAR(100) NOT NULL,
                    token_number INT NOT NULL,
                    created_at DATETIME NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
            ];

            foreach ($queries as $q) {
                $pdo->exec($q);
            }

            // Seed seed-data if empty
            $hospCount = $pdo->query("SELECT COUNT(*) FROM hospitals")->fetchColumn();
            if ($hospCount == 0) {
                // Seed Hospitals
                $hospStmt = $pdo->prepare("INSERT INTO hospitals (id, name, city, address, departments) VALUES (?, ?, ?, ?, ?)");
                
                $hospStmt->execute(['hosp-1', 'Mehsana District Civil Hospital', 'Mehsana', 'Radhanpur Road, Near Modhera Cross Roads, Mehsana', json_encode(['General Medicine', 'Pediatrics', 'Cardiology', 'Orthopedics'])]);
                $hospStmt->execute(['hosp-2', 'Palanpur Apex Hospital', 'Palanpur', 'Deesa Highway, Near Abu Road Highway Crossing, Palanpur', json_encode(['General Medicine', 'Pediatrics', 'Orthopedics'])]);

                // Seed Doctors
                $docStmt = $pdo->prepare("INSERT INTO doctors (id, hospital_id, name, department, specialty, experience, fee, weekly_days, slots_per_day, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                
                $docStmt->execute(['doc-1', 'hosp-1', 'Dr. Kirit Patel', 'General Medicine', 'MD - Internal Medicine', 14, 151, json_encode(['Mon', 'Wed', 'Fri']), 10, 1]);
                $docStmt->execute(['doc-2', 'hosp-1', 'Dr. Hasmukh Chaudhary', 'Pediatrics', 'DCH - Child Specialist', 9, 151, json_encode(['Tue', 'Thu', 'Sat']), 8, 1]);
                $docStmt->execute(['doc-3', 'hosp-1', 'Dr. Pinakin Shah', 'Cardiology', 'DM - Cardiologist', 16, 151, json_encode(['Mon', 'Tue', 'Thu']), 6, 1]);
                
                $docStmt->execute(['doc-4', 'hosp-2', 'Dr. Bharat Prajapati', 'General Medicine', 'MBBS - Family Doctor', 7, 151, json_encode(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']), 12, 1]);
                $docStmt->execute(['doc-5', 'hosp-2', 'Dr. Ramesh Thakor', 'Orthopedics', 'MS - Orthopedic Surgeon', 11, 151, json_encode(['Wed', 'Fri', 'Sat']), 8, 1]);
            }

            $agentCount = $pdo->query("SELECT COUNT(*) FROM agents")->fetchColumn();
            if ($agentCount == 0) {
                $pdo->exec("INSERT INTO agents (name, village, phone, code, wallet_balance) VALUES ('Dinesh Chaudhary', 'Gozaria Village', '9876543210', 'AGT-799', 525.00)");
                $pdo->exec("INSERT INTO transactions (date, type, amount, details) VALUES ('" . date('Y-m-d') . "', 'credit', 525.00, 'Initial wallet setup (Recharge: 500 + Bonus: 25)')");
            }

            // Write config.php
            $config_content = "<?php\n"
                            . "define('DB_HOST', " . var_export($db_host, true) . ");\n"
                            . "define('DB_NAME', " . var_export($db_name, true) . ");\n"
                            . "define('DB_USER', " . var_export($db_user, true) . ");\n"
                            . "define('DB_PASS', " . var_export($db_pass, true) . ");\n"
                            . "?>";
            
            file_put_contents('config.php', $config_content);
            $installed = true;

        } catch (PDOException $e) {
            $error = 'Installation failed: ' . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dear Doctor Installer</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: linear-gradient(135deg, #eef2f7 0%, #e0e8f5 100%);
            margin: 0;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            color: #1d1d1f;
        }
        .container {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(24px) saturate(190%);
            border: 1px solid rgba(255, 255, 255, 0.5);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
            border-radius: 24px;
            width: 100%;
            max-width: 440px;
            padding: 32px;
        }
        .header {
            text-align: center;
            margin-bottom: 24px;
        }
        .header h1 {
            font-size: 22px;
            margin: 0;
            color: #0066cc;
        }
        .header p {
            font-size: 13px;
            color: #86868b;
            margin: 4px 0 0;
        }
        .form-group {
            margin-bottom: 16px;
        }
        .form-group label {
            display: block;
            font-size: 12px;
            font-weight: 600;
            color: #86868b;
            margin-bottom: 6px;
            text-transform: uppercase;
        }
        .form-group input {
            width: 100%;
            padding: 12px 16px;
            border-radius: 12px;
            border: 1px solid rgba(0, 102, 204, 0.15);
            outline: none;
            font-size: 15px;
            background: #ffffff;
            box-sizing: border-box;
        }
        .form-group input:focus {
            border-color: #0066cc;
            box-shadow: 0 0 0 4px rgba(0, 102, 204, 0.1);
        }
        .btn {
            background: #0066cc;
            color: #ffffff;
            border: none;
            width: 100%;
            padding: 14px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(0, 102, 204, 0.25);
            transition: all 0.2s ease;
        }
        .btn:hover {
            background: #0052a3;
        }
        .alert {
            padding: 12px;
            border-radius: 12px;
            margin-bottom: 20px;
            font-size: 14px;
            line-height: 1.4;
        }
        .alert-error {
            background: rgba(255, 59, 48, 0.1);
            color: #ff3b30;
            border: 1px solid rgba(255, 59, 48, 0.2);
        }
        .alert-success {
            background: rgba(52, 199, 89, 0.1);
            color: #34c759;
            border: 1px solid rgba(52, 199, 89, 0.2);
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Dear Doctor Installer</h1>
            <p>Configure Hostinger MySQL Database</p>
        </div>

        <?php if ($installed): ?>
            <div class="alert alert-success">
                Installation completed successfully. The database tables have been set up and seeded with North Gujarat records.
            </div>
            <button class="btn" onclick="window.location.href='./index.html'">Launch Application</button>
        <?php else: ?>
            <?php if ($error): ?>
                <div class="alert alert-error">
                    <?php echo htmlspecialchars($error); ?>
                </div>
            <?php endif; ?>

            <form method="POST">
                <div class="form-group">
                    <label>MySQL Hostname</label>
                    <input type="text" name="db_host" value="localhost" placeholder="e.g. localhost or mysql.hostinger.com" required>
                </div>
                <div class="form-group">
                    <label>Database Name</label>
                    <input type="text" name="db_name" placeholder="e.g. u123456789_doctor" required>
                </div>
                <div class="form-group">
                    <label>Database Username</label>
                    <input type="text" name="db_user" placeholder="e.g. u123456789_admin" required>
                </div>
                <div class="form-group">
                    <label>Database Password</label>
                    <input type="password" name="db_pass" placeholder="Database User Password">
                </div>
                <button type="submit" class="btn">Configure & Install</button>
            </form>
        <?php endif; ?>
    </div>
</body>
</html>

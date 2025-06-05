<?php
require __DIR__ . '/db.php';
header('Content-Type: application/json');
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query('SELECT * FROM tasks ORDER BY created_at');
    echo json_encode($stmt->fetchAll());
}
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('INSERT INTO tasks (text, category, responsible, importance, priority, due_date, completed, created_at) VALUES (?,?,?,?,?,?,0,NOW())');
    $stmt->execute([
        $data['text'],
        $data['category'],
        $data['responsible'],
        $data['importance'],
        $data['priority'],
        $data['dueDate']
    ]);
    echo json_encode(['id' => $pdo->lastInsertId()]);
}
elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare('UPDATE tasks SET text=?, category=?, responsible=?, importance=?, priority=?, due_date=?, completed=?, closed_at=? WHERE id=?');
    $stmt->execute([
        $data['text'],
        $data['category'],
        $data['responsible'],
        $data['importance'],
        $data['priority'],
        $data['dueDate'],
        $data['completed'] ? 1 : 0,
        $data['closedAt'] ? date('Y-m-d H:i:s', $data['closedAt']/1000) : null,
        $data['id']
    ]);
    echo json_encode(['status' => 'ok']);
}
elseif ($method === 'DELETE') {
    if (isset($_GET['id'])) {
        $stmt = $pdo->prepare('DELETE FROM tasks WHERE id=?');
        $stmt->execute([$_GET['id']]);
    } else {
        $pdo->exec('TRUNCATE TABLE tasks');
    }
    echo json_encode(['status' => 'ok']);
}

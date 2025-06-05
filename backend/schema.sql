CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  text VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  responsible VARCHAR(100),
  importance VARCHAR(20),
  priority VARCHAR(20),
  due_date DATE,
  completed TINYINT(1) DEFAULT 0,
  created_at DATETIME NOT NULL,
  closed_at DATETIME NULL
);

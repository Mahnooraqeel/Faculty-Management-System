-- Active: 1731168976954@@127.0.0.1@3306
-- AdminInfo Table
CREATE TABLE AdminInfo (
    id INT PRIMARY KEY CHECK (id = 1), -- Ensures only one admin exists
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(50) NOT NULL CHECK (CHAR_LENGTH(password) >= 8 AND CHAR_LENGTH(password) <= 20)
);

-- TeacherInfo Table
CREATE TABLE TeacherInfo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age TINYINT UNSIGNED NOT NULL CHECK (age > 18 AND age < 60),
    CNIC CHAR(13) NOT NULL UNIQUE CHECK (CHAR_LENGTH(CNIC) = 13),
    department TINYTEXT NOT NULL,
    date_of_joining DATE NOT NULL CHECK (date_of_joining <= CURDATE()),
    latest_academic_degree TINYTEXT NOT NULL,
    expertise TINYTEXT, -- Nullable field
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(50) NOT NULL CHECK (CHAR_LENGTH(password) >= 8 AND CHAR_LENGTH(password) <= 15),
    contact VARCHAR(15) CHECK (CHAR_LENGTH(contact) BETWEEN 11 AND 15), -- Nullable field
    landline VARCHAR(15) CHECK (CHAR_LENGTH(landline) = 10), -- Nullable field
    status INT NOT NULL DEFAULT 1 -- 1 = Active, 0 = Inactive
);

-- Report Table
CREATE TABLE Report (
    ReportID INT AUTO_INCREMENT PRIMARY KEY,
    TeacherID INT NOT NULL, -- References TeacherInfo(id)
    AdminID INT NOT NULL, -- References AdminInfo(id),
    ReportDate DATE NOT NULL,
    status INT NOT NULL DEFAULT 0, -- 1 = Active, 0 = Inactive
    FOREIGN KEY (TeacherID) REFERENCES TeacherInfo(id),
    FOREIGN KEY (AdminID) REFERENCES AdminInfo(id)
);

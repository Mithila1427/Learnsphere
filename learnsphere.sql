USE learnsphere
GO

CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    passwordHash NVARCHAR(MAX) NOT NULL, -- Use NVARCHAR(MAX) for bcrypt hashes
    role NVARCHAR(50) NOT NULL CHECK (role IN ('student', 'teacher')),
    createdAt DATETIME DEFAULT GETDATE()
);

SELECT * FROM Users;
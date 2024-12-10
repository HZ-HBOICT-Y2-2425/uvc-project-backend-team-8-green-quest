CREATE DATABASE IF NOT EXISTS EcoApp;

-- Use the new database
USE EcoApp;

-- Disable foreign key checks to allow dropping tables with dependencies
SET FOREIGN_KEY_CHECKS = 0;

-- Drop the tables if they exist
DROP TABLE IF EXISTS Shop;
DROP TABLE IF EXISTS ChallengeUser;
DROP TABLE IF EXISTS Friendship;
DROP TABLE IF EXISTS Items;
DROP TABLE IF EXISTS Challenges;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Table: Users
CREATE TABLE IF NOT EXISTS Users (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    username CHAR(20) NOT NULL,
    co2Saved FLOAT NOT NULL,
    coins INT NOT NULL,
    habits CHAR(100)
);

-- Table: Items
CREATE TABLE IF NOT EXISTS Items (
    itemID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2),
    level_required INT,
    path VARCHAR(255),
    category VARCHAR(255)
);

-- Table: Shop (Bridging Table)
CREATE TABLE IF NOT EXISTS Shop (
    shopID INT AUTO_INCREMENT PRIMARY KEY,
    itemID INT NOT NULL,
    userID INT NOT NULL,
    posY INT NOT NULL,
    posX INT NOT NULL,
    FOREIGN KEY (itemID) REFERENCES Items(itemID),
    FOREIGN KEY (userID) REFERENCES Users(userID)
);

-- Table: Challenges
CREATE TABLE IF NOT EXISTS Challenges (
    challengeID INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    CO2_reduction_kg DECIMAL(5, 2) NOT NULL,
    coins INT NOT NULL,
    impact TEXT NOT NULL
);

-- Table: ChallengeUser (Bridging Table)
CREATE TABLE IF NOT EXISTS ChallengeUser (
    challengeUserID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    challengeID INT NOT NULL,
    FOREIGN KEY (userID) REFERENCES Users(userID),
    FOREIGN KEY (challengeID) REFERENCES Challenges(challengeID)
);

-- Table: Friendship (Bridging Table)
CREATE TABLE IF NOT EXISTS Friendship (
    friendshipID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    user2ID INT NOT NULL,
    FOREIGN KEY (userID) REFERENCES Users(userID),
    FOREIGN KEY (user2ID) REFERENCES Users(userID)
);




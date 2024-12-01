-- Create the database
CREATE DATABASE IF NOT EXISTS EcoApp;
USE EcoApp;

-- Table: Users
CREATE TABLE Users (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    username CHAR(20) NOT NULL,
    co2Saved FLOAT NOT NULL,
    coins INT NOT NULL,
    habits CHAR(100)
);

-- Table: Items
CREATE TABLE Items (
    itemID INT AUTO_INCREMENT PRIMARY KEY,
    image CHAR(50) NOT NULL,
    type CHAR(20) NOT NULL,
    cost INT NOT NULL
);

-- Table: Shop (Bridging Table)
CREATE TABLE Shop (
    shopID INT AUTO_INCREMENT PRIMARY KEY,
    itemID INT NOT NULL,
    userID INT NOT NULL,
    posY INT NOT NULL,
    posX INT NOT NULL,
    FOREIGN KEY (itemID) REFERENCES Items(itemID),
    FOREIGN KEY (userID) REFERENCES Users(userID)
);

-- Table: Challenges
CREATE TABLE Challenges (
    challengeID INT AUTO_INCREMENT PRIMARY KEY,
    description CHAR(200),
    impact CHAR(100),
    co2 FLOAT NOT NULL,
    coins INT NOT NULL
);

-- Table: ChallengeUser (Bridging Table)
CREATE TABLE ChallengeUser (
    challengeUserID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    challengeID INT NOT NULL,
    FOREIGN KEY (userID) REFERENCES Users(userID),
    FOREIGN KEY (challengeID) REFERENCES Challenges(challengeID)
);

-- Table: Friendship (Bridging Table)
CREATE TABLE Friendship (
    friendshipID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    user2ID INT NOT NULL,
    FOREIGN KEY (userID) REFERENCES Users(userID),
    FOREIGN KEY (user2ID) REFERENCES Users(userID)
);

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users_profiles;


CREATE TABLE users (
    id SERIAL PRIMARY KEY, 
    firstname VARCHAR(255) NOT NULL, 
    lastname VARCHAR(255) NOT NULL, 
    email VARCHAR(255) NOT NULL UNIQUE, 
    password VARCHAR(255) NOT NULL, 
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE signatures (
    id SERIAL primary key,  
    signature VARCHAR NOT NULL, 
    user_id INTEGER NOT NULL REFERENCES users(id),
    create_at TIMESTAMP DEFAULT current_timestamp
);

CREATE TABLE users_profiles (
    id SERIAL primary key, 
    city VARCHAR(255) NOT NULL, 
    age VARCHAR(255) NOT NULL,
    linkedIn VARCHAR(255) NOT NULL ,
    user_id INT REFERENCES users(id),
        create_at TIMESTAMP DEFAULT current_timestamp
);



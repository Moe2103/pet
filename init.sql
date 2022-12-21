DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS users;

CREATE TABLE users(
     id SERIAL PRIMARY KEY,
     first VARCHAR(255) NOT NULL,
     last VARCHAR(255) NOT NULL,
     email VARCHAR(255) NOT NULL UNIQUE,
     password VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE signatures(
           id SERIAL PRIMARY KEY,
           signature TEXT NOT NULL,
           user_id INTEGER NOT NULL REFERENCES users(id),
           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
    id SERIAL primary key,
    city VARCHAR(255) NOT NULL,
    age VARCHAR(255) NOT NULL,
    homepage VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    myphoto TEXT NOT NULL,
    user_id INT REFERENCES users,
    created_at TIMESTAMP DEFAULT current_timestamp
);



 
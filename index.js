const fs = require('fs');
const request = require('request');
const moment = require('moment');


// Array to store the users generated.
const people = [];

// Generate a rando user from the first API
const getRandomUser = () => {
    return new Promise((resolve, reject) => {
        request('https://random-data-api.com/api/users/random_user', (error, response, body) => {
            if (error) {
                reject(error);
            }
            resolve(JSON.parse(body));
        });
    });
}

// Use the name generated to get a predicted age for the user
const getPredictedAge = (firstName) => {
    return new Promise((resolve, reject) => {
        request(`https://api.agify.io?name=${firstName}`, (error, response, body) => {
            if (error) {
                reject(error);
            }
            const { age } = JSON.parse(body);
            resolve(age);
        });
    });
}

// Generate the entire details as required for each person.

const generatePerson = (user, predictedAge) => {
    const { first_name, last_name, address, date_of_birth } = user;
    const actualAge = moment().diff(date_of_birth, 'years');
    const fullName = `${first_name} ${last_name}`;
    const { street_address, street_name, city, state } = address;
    const fullAddress = `${street_address} ${street_name}, ${city}, ${state}`;
    const ageDifference = actualAge - predictedAge;
    const percentageDifference = (ageDifference / actualAge) * 100;

    return {
        fullName,
        fullAddress,
        actualAge,
        predictedAge,
        ageDifference,
        percentageDifference

    }
}

// Generate an array of 20 randomly generated people
const generatePeople = async () => {
    for (let i = 0; i < 20; i++) {
        const user = await getRandomUser();
        const userAge = await getPredictedAge(user.first_name);

        const person = generatePerson(user, userAge);
        people.push(person);
    }
    return people;
}

// Write the array of people to the people.json file
const writeToFile = (people) => {
    fs.writeFileSync('people.json', JSON.stringify(people));
}

generatePeople()
    .then((people) => {
        writeToFile(people);
        console.log(people)
    })
    .catch((error) => {
        console.log(error);
    });
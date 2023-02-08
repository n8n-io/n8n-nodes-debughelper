import {
	firstName,
	lastName,
	streetAddress,
	cityName,
	zipCode,
	state,
	country,
	password,
	creditCardNumber,
	creditCardCVV,
	email,
	boolean,
	uuid,
	nanoId,
	number,
} from 'minifaker';
import 'minifaker/locales/en';

export function generateRandomUser() {
	console.log({
		uid: uuid.v4(),
		email: email(),
		firstname: firstName(),
		lastname: lastName(),
		password: password(),
	});
	return {
		uid: uuid.v4(),
		email: email(),
		firstname: firstName(),
		lastname: lastName(),
		password: password(),
	};
}

export function generateRandomAddress() {
	return {
		firstname: firstName(),
		lastname: lastName(),
		street: streetAddress(),
		city: cityName(),
		zip: zipCode({ format: '#####' }),
		state: state(),
		country: country(),
	};
}

export function generateRandomEmail() {
	console.log({
		email: email(),
		confirmed: boolean(),
	});
	return {
		email: email(),
		confirmed: boolean(),
	};
}

export function generateUUID() {
	return uuid.v4();
}

export function generateNanoid() {
	return nanoId.random(10);
}

export function generateCreditCard() {
	return {
		type: boolean() ? 'MasterCard' : 'Visa',
		number: creditCardNumber(),
		ccv: creditCardCVV(),
		exp: `${number({ min: 1, max: 12, float: false }).toString().padStart(2, '0')}/${number({
			min: 1,
			max: 40,
			float: false,
		})
			.toString()
			.padStart(2, '0')}`,
		holder_name: `${firstName()} ${lastName()}`,
	};
}

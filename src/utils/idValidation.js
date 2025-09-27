/**
 * Validates Israeli ID number using the Luhn (mod-10) algorithm
 * The ID should be 9 digits and pass the Luhn checksum validation
 *
 * @param {string|number} idNumber - The ID number to validate
 * @returns {boolean} - True if the ID is valid, false otherwise
 */
export const validateIsraeliId = (idNumber) => {
    // Convert to string and remove any non-digits
    const cleanId = String(idNumber).replace(/\D/g, '');

    // Check if empty or contains only zeros
    if (!cleanId || cleanId === '0'.repeat(cleanId.length)) {
        return false;
    }

    // Pad with zeros on the left to make it 9 digits
    const paddedId = cleanId.padStart(9, '0');

    // If after padding it's more than 9 digits, it's invalid
    if (paddedId.length > 9) {
        return false;
    }

    // Luhn algorithm implementation
    let sum = 0;
    const multipliers = [1, 2, 1, 2, 1, 2, 1, 2, 1];

    for (let i = 0; i < 9; i++) {
        let product = parseInt(paddedId[i]) * multipliers[i];

        // If product > 9, replace with sum of its digits (equivalent to subtracting 9)
        if (product > 9) {
            product -= 9;
        }

        sum += product;
    }

    // ID is valid if sum modulo 10 equals 0
    return sum % 10 === 0;
};

/**
 * Formats Israeli ID number by padding with zeros to 9 digits
 *
 * @param {string|number} idNumber - The ID number to format
 * @returns {string} - Formatted ID number with leading zeros
 */
export const formatIsraeliId = (idNumber) => {
    const cleanId = String(idNumber).replace(/\D/g, '');
    return cleanId.padStart(9, '0');
};

/**
 * Validates that a person is at least the minimum required age
 *
 * @param {string} birthDate - Birth date in YYYY-MM-DD format
 * @param {number} minAge - Minimum required age (default: 16)
 * @returns {boolean} - True if the person is at least the minimum age, false otherwise
 */
export const validateMinimumAge = (birthDate, minAge = 16) => {
    if (!birthDate) {
        return false;
    }

    const birth = new Date(birthDate);
    const today = new Date();

    // Check if the birth date is valid
    if (isNaN(birth.getTime())) {
        return false;
    }

    // Check if birth date is in the future
    if (birth > today) {
        return false;
    }

    // Calculate age
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    // Adjust age if birthday hasn't occurred this year yet
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age >= minAge;
};
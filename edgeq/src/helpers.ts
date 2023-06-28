export function toRadians(angle: number) {
	return angle * (Math.PI / 180);
}

const DISCRIMINATOR = 300;

export function normalize(number: number) {
	if (number === 1) return 1;

	const newValue = number / DISCRIMINATOR;
	if (isNaN(newValue)) return 1;
	if (!newValue) return 1;

	return newValue;
}

export function goToZero(oldValue: number) {
	if (oldValue <= DISCRIMINATOR) return DISCRIMINATOR;
	return oldValue - .5;
}

export function invertOffset(oldValue: number) {
	return Math.min(oldValue += 40, 100);
}

export function map(val: number, inMin: number, inMax: number, outMin: number, outMax: number)
{
	return (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

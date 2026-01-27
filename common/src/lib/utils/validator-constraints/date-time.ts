import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isFutureDate', async: false })
export class IsFutureDateConstraint implements ValidatorConstraintInterface {
  validate(date: Date) {
    if (!(date instanceof Date)) return false;

    const oneMinutesAgo = new Date(Date.now() - 60 * 1000);
    return date >= oneMinutesAgo;
  }
  defaultMessage() {
    return 'Time must be in the future';
  }
}

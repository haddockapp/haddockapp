import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

function isInArray<T>(array: T[], value: T): boolean {
  return array.includes(value);
}

@ValidatorConstraint({ async: false })
export class AllowedValuesValidator implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [allowedValues] = args.constraints;
    return isInArray(allowedValues, value);
  }

  defaultMessage(args: ValidationArguments) {
    return `"${args.property}" must be correctly provided.`;
  }
}

export function AllowedValues(
  array: unknown[],
  validationOptions?: ValidationOptions,
) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [array],
      validator: AllowedValuesValidator,
    });
  };
}

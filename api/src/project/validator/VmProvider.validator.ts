import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { VmProvider } from 'src/types/vm.enum';

function isEnumValue<T>(enumObj: T, value: unknown): value is T[keyof T] {
  return Object.values(enumObj).includes(value as T[keyof T]);
}

@ValidatorConstraint({ async: false })
export class IsVmProviderValidator implements ValidatorConstraintInterface {
  validate(value: any) {
    return isEnumValue(VmProvider, value);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a provider.`;
  }
}

export function IsVmProvider(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsVmProviderValidator,
    });
  };
}

import {
  registerDecorator,
  ValidationOptions,
  isPhoneNumber,
  isMobilePhone,
} from 'class-validator';

function IsValidPhone(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsValidPhone',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: {
        ...validationOptions,
        message: `${propertyName} must be a valid phone number (starts with '+')`,
      },
      validator: {
        validate(value: any) {
          return (
            typeof value === 'string' &&
            value.startsWith('+') &&
            (isMobilePhone(value) || isPhoneNumber(value))
          );
        },
      },
    });
  };
}

export { IsValidPhone };

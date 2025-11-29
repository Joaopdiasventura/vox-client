import { CreateUserDto } from './create-user.dto';

export type UpdateUserDto = Partial<CreateUserDto> & {
  taxId?: string;
  cellphone?: string;
  plan?: string;
  votes?: number;
  isValid?: boolean;
};

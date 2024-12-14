import { UseInterceptors } from '@nestjs/common';
import { ClassContrustor, SerializeInterceptor } from 'src/core/seralize.interceptor';

 
export function Serialize(dto: ClassContrustor) {
  return UseInterceptors(new SerializeInterceptor(dto));
}
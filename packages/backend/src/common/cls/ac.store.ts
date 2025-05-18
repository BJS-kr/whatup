import { ClsStore } from 'nestjs-cls';
import { AC } from '../constants';

export interface AbortControllerStorage extends ClsStore {
  [AC]: AbortController;
}

import { api } from './client';
import { createExpertApi } from './create-expert-api';

export const expertApi = createExpertApi(api);

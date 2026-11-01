import type {
  ExpertDataState,
  SaveEquipmentPreferencesRequest,
  SaveGoalsRequest,
  SaveGymRequest,
  SaveMovementPreferencesRequest,
} from '../types/expert';
import type { ApiCaller } from './create-auth-api';

export function createExpertApi(client: ApiCaller) {
  function getExpertData(): Promise<ExpertDataState> {
    return client.call<ExpertDataState>('/api/expert-data', {
      method: 'GET',
      auth: true,
    });
  }

  function createGym(data: SaveGymRequest): Promise<ExpertDataState> {
    return client.call<ExpertDataState>('/api/expert-data/gyms', {
      method: 'POST',
      body: data,
      auth: true,
    });
  }

  function updateGym(gymId: string, data: SaveGymRequest): Promise<ExpertDataState> {
    return client.call<ExpertDataState>(`/api/expert-data/gyms/${gymId}`, {
      method: 'PUT',
      body: data,
      auth: true,
    });
  }

  function deleteGym(gymId: string): Promise<ExpertDataState> {
    return client.call<ExpertDataState>(`/api/expert-data/gyms/${gymId}`, {
      method: 'DELETE',
      auth: true,
    });
  }

  function saveEquipmentPreferences(
    data: SaveEquipmentPreferencesRequest
  ): Promise<ExpertDataState> {
    return client.call<ExpertDataState>('/api/expert-data/equipment-preferences', {
      method: 'PUT',
      body: data,
      auth: true,
    });
  }

  function saveMovementPreferences(
    data: SaveMovementPreferencesRequest
  ): Promise<ExpertDataState> {
    return client.call<ExpertDataState>('/api/expert-data/movement-preferences', {
      method: 'PUT',
      body: data,
      auth: true,
    });
  }

  function saveGoals(data: SaveGoalsRequest): Promise<ExpertDataState> {
    return client.call<ExpertDataState>('/api/expert-data/goals', {
      method: 'PUT',
      body: data,
      auth: true,
    });
  }

  return {
    getExpertData,
    createGym,
    updateGym,
    deleteGym,
    saveEquipmentPreferences,
    saveMovementPreferences,
    saveGoals,
  };
}


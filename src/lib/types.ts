export type UserRole = 'ADMIN' | 'GESTOR' | 'INSPETOR';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type InspectionStatus = 'EM_ANDAMENTO' | 'FINALIZADO' | 'RETIRADO' | 'CANCELADO';

export type ItemCheckStatus = 'S' | 'N' | 'A' | 'I'; // Sim, Não tem, Avariado, Incompleto

export type DamageType = 'A' | 'R' | 'X' | 'F'; // Amassado, Riscado, Quebrado, Faltante

export type VehicleView =
  | 'SUPERIOR_TETO'
  | 'LATERAL_ESQUERDA'
  | 'LATERAL_DIREITA'
  | 'FRONTAL'
  | 'TRASEIRA';

export type WheelPosition =
  | 'DIANTEIRO_D'
  | 'DIANTEIRO_E'
  | 'TRASEIRO_D'
  | 'TRASEIRO_E';

export type WheelItemType = 'PNEU' | 'CALOTA' | 'RODA_LIGA_LEVE';

export interface DamageMarkingData {
  id?: string;
  view_type: VehicleView;
  damage_type: DamageType;
  coord_x: number;
  coord_y: number;
  notes?: string;
}

export interface ChecklistAnswerData {
  category: string;
  item_name: string;
  status: ItemCheckStatus;
  observation?: string;
}

export interface TireWheelStatusData {
  position: WheelPosition;
  type: WheelItemType;
  status: string;
  notes?: string;
}

export interface InspectionData {
  id?: string;
  os_number: string;
  client_id: string;
  vehicle_id: string;
  inspector_id?: string;
  consultant_name: string;
  is_driver_the_scheduler: boolean;
  status: InspectionStatus;
  fuel_level: number;
  battery_lev_percent?: number | null;
  test_drive_needed: boolean;
  protective_covers_placed: boolean;
  warranty_manual_requested: boolean;
  has_bed: boolean;
  has_marine_cover: boolean;
  belongings?: string[];
  bodywork_notes?: string;
  tires_notes?: string;
  entry_signature?: string;
  entry_date?: string;
  entry_time?: string;
  exit_signature?: string;
  exit_date?: string;
  exit_time?: string;
  terms_accepted: boolean;
  answers: ChecklistAnswerData[];
  damage_markings: DamageMarkingData[];
  tire_wheel_statuses: TireWheelStatusData[];
  photos?: { category: string; file_url: string; description?: string }[];
}

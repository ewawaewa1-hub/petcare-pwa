
export enum PetType {
  CAT = '猫',
  DOG = '狗',
  OTHER = '其他'
}

export enum Gender {
  MALE = '公',
  FEMALE = '母',
  UNKNOWN = '未知'
}

export interface TaskType {
  id: string;
  name: string;
  color: string;
  icon: string; // FontAwesome icon class
  cycleDays: number | null; // null means no reminder needed
  isDefault: boolean;
  hasValue: boolean; // Whether this task needs a numeric value input
  valueName?: string; // Label for the value (e.g., "体重", "食量")
}

export interface Pet {
  id: string;
  name: string;
  type: PetType;
  gender: Gender;
  breed: string;
  birthday: string;
  initialWeight: number;
  avatar?: string;
  themeColor: string;
}

export interface Record {
  id: string;
  petId: string;
  taskTypeId: string;
  date: string; // ISO string with time
  value?: number; // Weight value etc.
  note?: string;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  nickname: string;
  avatar?: string;
}

// src/types/department.ts
export interface DepartmentAgent {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

export interface DepartmentCreatedBy {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Department {
  _id: string;
  name: string;
  description?: string;
  createdBy: DepartmentCreatedBy;
  createdAt: string;
  updatedAt: string;
  __v: number;
  agents: DepartmentAgent[];
}

export interface CreateDepartmentDto {
  name: string;
  description?: string;
}

export interface UpdateDepartmentDto {
  name?: string;
  description?: string;
}

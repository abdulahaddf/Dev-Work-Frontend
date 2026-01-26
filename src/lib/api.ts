import axios, { AxiosError, AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // Public endpoints that don't require authentication
      const publicEndpoints = ['/projects/open', '/auth/register', '/auth/login'];
      const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));
      
      // Only add token for non-public endpoints
      if (!isPublicEndpoint) {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        const url = error.config?.url || '';
        const currentPath = window.location.pathname;
        
        // Don't redirect for public endpoints or public pages
        const publicEndpoints = ['/projects/open', '/auth/register', '/auth/login'];
        const publicPages = ['/', '/login', '/register'];
        const isPublicEndpoint = publicEndpoints.some(endpoint => url.includes(endpoint));
        const isPublicPage = publicPages.includes(currentPath);
        
        // Only redirect if it's not a public endpoint/page and not already on login
        if (!isPublicEndpoint && !isPublicPage && !currentPath.includes('/login')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// Auth API
// ============================================

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export const authApi = {
  register: (data: RegisterData) => 
    api.post<AuthResponse>('/auth/register', data),
  
  login: (data: LoginData) => 
    api.post<AuthResponse>('/auth/login', data),
  
  me: () => 
    api.get<{ success: boolean; data: User }>('/auth/me'),
};

// ============================================
// Admin API
// ============================================

export interface AssignRoleData {
  userId: string;
  roleName: 'ADMIN' | 'BUYER' | 'SOLVER';
}

export interface UsersResponse {
  success: boolean;
  data: {
    users: Array<{
      id: string;
      email: string;
      name: string;
      roles: string[];
      createdAt: string;
      stats: {
        projectsAsBuyer: number;
        projectsAsSolver: number;
      };
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export const adminApi = {
  assignRole: (data: AssignRoleData) => 
    api.post('/admin/assign-role', data),
  
  removeRole: (data: AssignRoleData) => 
    api.post('/admin/remove-role', data),
  
  getUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<UsersResponse>('/admin/users', { params }),
  
  getProjects: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/admin/projects', { params }),
  
  getRoles: () =>
    api.get('/admin/roles'),
};

// ============================================
// Projects API
// ============================================

export interface CreateProjectData {
  title: string;
  description: string;
  budget?: number;
  deadline?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  budget: number | null;
  deadline: string | null;
  status: string;
  statusLabel: string;
  createdAt: string;
  buyer: {
    id: string;
    name: string;
    email: string;
  };
  solver?: {
    id: string;
    name: string;
    email: string;
  } | null;
  _count?: {
    tasks: number;
    requests: number;
  };
}

export interface ProjectsResponse {
  success: boolean;
  data: {
    projects: Project[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export const projectsApi = {
  create: (data: CreateProjectData) => 
    api.post('/projects', data),
  
  getMyProjects: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<ProjectsResponse>('/projects/my', { params }),
  
  getOpenProjects: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/projects/open', { params }),
  
  getAssignedProjects: (params?: { page?: number; limit?: number }) =>
    api.get('/projects/assigned', { params }),
  
  getProject: (id: string) =>
    api.get(`/projects/${id}`),
  
  updateProject: (id: string, data: Partial<CreateProjectData>) =>
    api.patch(`/projects/${id}`, data),
  
  publishProject: (id: string) =>
    api.patch(`/projects/${id}/publish`),
  
  updateStatus: (id: string, status: string) =>
    api.patch(`/projects/${id}/status`, { status }),
  
  getRequests: (id: string) =>
    api.get(`/projects/${id}/requests`),
  
  assignSolver: (id: string, solverId: string) =>
    api.post(`/projects/${id}/assign`, { solverId }),
};

// ============================================
// Requests API
// ============================================

export interface CreateRequestData {
  projectId: string;
  message?: string;
}

export const requestsApi = {
  create: (data: CreateRequestData) =>
    api.post('/requests', data),
  
  getMyRequests: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/requests/my', { params }),
  
  withdraw: (id: string) =>
    api.delete(`/requests/${id}`),
};

// ============================================
// Tasks API
// ============================================

export interface CreateTaskData {
  projectId: string;
  title: string;
  description: string;
  deadline: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: string;
  statusLabel: string;
  createdAt: string;
  project?: {
    id: string;
    title: string;
    status: string;
  };
  _count?: {
    submissions: number;
  };
}

export const tasksApi = {
  create: (data: CreateTaskData) =>
    api.post('/tasks', data),
  
  getMyTasks: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/tasks/my', { params }),
  
  getProjectTasks: (projectId: string) =>
    api.get(`/tasks/project/${projectId}`),
  
  getTask: (id: string) =>
    api.get(`/tasks/${id}`),
  
  updateTask: (id: string, data: Partial<CreateTaskData>) =>
    api.patch(`/tasks/${id}`, data),
  
  updateStatus: (id: string, status: string) =>
    api.patch(`/tasks/${id}/status`, { status }),
  
  review: (id: string, action: 'ACCEPT' | 'REJECT', feedback?: string) =>
    api.post(`/tasks/${id}/review`, { action, feedback }),
};

// ============================================
// Submissions API
// ============================================

export const submissionsApi = {
  upload: (taskId: string, file: File, notes?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (notes) formData.append('notes', notes);
    
    return api.post(`/submissions/task/${taskId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  getTaskSubmissions: (taskId: string) =>
    api.get(`/submissions/task/${taskId}`),
  
  download: (id: string) =>
    api.get(`/submissions/${id}/download`, { responseType: 'blob' }),
  
  delete: (id: string) =>
    api.delete(`/submissions/${id}`),
};

export default api;

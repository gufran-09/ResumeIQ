export const JAVA_API = process.env.NEXT_PUBLIC_JAVA_API_URL || 'http://localhost:8080/api';
export const PYTHON_API = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000/api';

export const fetchApi = async (url: string, options: RequestInit = {}) => {
  let token = null;
  if (typeof window !== 'undefined') {
    const authData = localStorage.getItem('auth-storage'); // We'll store both token and user here or separately
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        token = parsed.token;
      } catch (e) {}
    }
  }

  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const response = await fetch(`${JAVA_API}${url}`, { ...options, headers });
  
  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    let message = `API Error: ${response.status}`;
    try {
      const errorData = await response.json();
      message = errorData.message || errorData.detail || message;
    } catch (e) {}
    throw new Error(message);
  }
  
  return response.json();
};

export const api = {
  // Auth
  login: (data: any) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  
  // Dashboard
  getDashboardStats: () => fetchApi('/dashboard/stats'),
  
  // Candidates
  getCandidates: (params?: any) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    const searchString = searchParams.toString();
    return fetchApi(`/candidates${searchString ? `?${searchString}` : ''}`);
  },
  getCandidateById: (id: string | number) => fetchApi(`/candidates/${id}`),
  getRankedCandidates: () => fetchApi('/candidates/ranked'),
  getTopRanked: (limit: number = 5) => fetchApi(`/candidates/top?limit=${limit}`),
  createCandidate: (data: any) => fetchApi('/candidates', { method: 'POST', body: JSON.stringify(data) }),
  deleteCandidate: (id: string | number) => fetchApi(`/candidates/${id}`, { method: 'DELETE' }),
  rescoreAll: () => fetchApi('/candidates/rescore', { method: 'POST' }),
  
  // Criteria
  getCriteria: () => fetchApi('/criteria'),
  updateCriteria: (data: any) => fetchApi('/criteria', { method: 'POST', body: JSON.stringify(data) }),
  
  // Users
  getUsers: () => fetchApi('/users'),
  createUser: (data: any) => fetchApi('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string | number, data: any) => fetchApi(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id: string | number) => fetchApi(`/users/${id}`, { method: 'DELETE' }),
  
  // Python Parser
  parseResume: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${PYTHON_API}/parse`, {
      method: 'POST',
      body: formData,
    });
  
    if (!response.ok) {
      let message = `Parser Error: ${response.status}`;
      try {
        const errorData = await response.json();
        message = errorData.detail || errorData.message || message;
      } catch (e) {}
      throw new Error(message);
    }
    
    return response.json();
  }
};

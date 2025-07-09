export async function signup(data: { email: string; password: string; name?: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include', 
  });

  if (!res.ok) throw new Error('Signup failed');
  return res.json();
}

export async function login(data: { email: string; password: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include', 
  });

  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function getMe(token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
}
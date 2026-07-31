const TOKEN_KEY = "trackmii_token"

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(TOKEN_KEY, token)
  
  const isProduction = window.location.protocol === "https:"
  const secureFlag = isProduction ? "; Secure" : ""
  
  // Set cookie for middleware
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax${secureFlag}`
}

export function clearToken(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(TOKEN_KEY)
  
  const isProduction = window.location.protocol === "https:"
  const secureFlag = isProduction ? "; Secure" : ""
  
  // Clear cookie
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax${secureFlag}`
}
export const DEMO_EMAIL = "demo_user@avishekqahub.com";
export const DEMO_PASSWORD = "Demo@avishek";
export const DEMO_UID = "demo_user_local_only";
export const DEMO_NAME = "Demo User";
export const DEMO_ROLE = "Demo Mode 🚀";

export function isDemoMode() {
  return sessionStorage.getItem("qa_hub_demo_mode") === "true";
}

export function getDemoUser() {
  return {
    uid: DEMO_UID,
    email: DEMO_EMAIL,
    displayName: DEMO_NAME,
    isDemo: true,
    photoURL: null
  };
}

export function loginAsDemo(email, password, setUser) {
  if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
    sessionStorage.setItem("qa_hub_demo_mode", "true");
    if (setUser) setUser(getDemoUser());
    return { success: true };
  } else {
    return { success: false, error: "Incorrect demo credentials" };
  }
}

export function logoutDemo(setUser, navigate) {
  sessionStorage.removeItem("qa_hub_demo_mode");
  const keysToRemove = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith("demo_")) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(k => sessionStorage.removeItem(k));
  if (setUser) setUser(null);
  if (navigate) navigate('/');
}

export function restoreDemoSession(setUser) {
  if (isDemoMode() && setUser) {
    setUser(getDemoUser());
  }
}

export function showDemoToast(featureName) {
  if (!isDemoMode()) return;
  const shown = sessionStorage.getItem("demo_toast_shown") || "[]";
  let shownArray = [];
  try {
    shownArray = JSON.parse(shown);
  } catch (e) {
    shownArray = [];
  }
  const shownSet = new Set(shownArray);
  if (!shownSet.has(featureName)) {
    shownSet.add(featureName);
    sessionStorage.setItem("demo_toast_shown", JSON.stringify(Array.from(shownSet)));
    
    const toast = document.createElement("div");
    toast.innerHTML = "🚀 Demo mode — data not saved. <br>Create a free account to save your progress!";
    Object.assign(toast.style, {
      background: "#1a1535",
      border: "1px solid rgba(124,58,237,0.4)",
      borderRadius: "10px",
      padding: "10px 16px",
      fontSize: "12px",
      color: "rgba(255,255,255,0.8)",
      position: "fixed",
      bottom: "20px",
      right: "20px",
      zIndex: "9999",
      boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
      fontFamily: "Inter, sans-serif",
      lineHeight: "1.4"
    });
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.transition = "opacity 0.3s ease-out";
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }
}

import { useContext } from "react";
import { useToast } from "components/ToastContext";
import useAxiosProtected from "hook/useAxiosProtected";
import { ThemeContext } from "contexts/ThemeContext";

const Settings = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const axiosProtected = useAxiosProtected();
  const { addToast } = useToast();

  async function handleThemeChange() {
    try {
      await axiosProtected.post(`/user/updateSettings`, {
        theme: theme === "light" ? "dark_theme" : "light_theme",
      });
    } catch (error) {
      addToast(error.response?.data?.message || "Bearbeitung fehlgeschlagen", "danger");
    } finally {
      toggleTheme();
    }
  }

  return (
    <>
      <div className="container mt-4">
        <h2>Einstellungen</h2>
        <button onClick={handleThemeChange} className="btn btn-outline-secondary ms-auto me-2">
          {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
      </div>
    </>
  );
};

export default Settings;

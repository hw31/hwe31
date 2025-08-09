import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, matchPath } from "react-router-dom";
import {
  Home,
  Users,
  Repeat2,
  BookOpen,
  GraduationCap,
  ListChecks,
  FileText,
  Shield,
  Key,
  ToggleRight,
  FileCheck2,
  User,
  Book,
  Calendar,
  School,
  Edit,
  Award,
  Settings,
  Lock,
  University
} from "lucide-react";
import { getMenu } from "../../services/menuService";

const iconMap = {
  home: Home,
  users: Users,
  repeat2: Repeat2,
  bookopen: BookOpen,
  graduationcap: GraduationCap,
  listcheck: ListChecks,
  filetext: FileText,
  shield: Shield,
  key: Key,
  user: User,
  book: Book,
  calendar: Calendar,
  school: School,
  edit: Edit,
  award: Award,
  settings: Settings,
  lock: Lock,
  toggleright: ToggleRight,
  "file-check2": FileCheck2,
  university: University
};

const SidebarMenu = ({ isSidebarOpen }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Formularios a ocultar (en minúsculas)
  const ocultarFormularios = [
    "frmestados",
    "frmroles",
    "frmpermisos",
    "frmtipocalificacion",
    "frmcatalogos",
    "frminscripcionesmaterias",
      "frmrescate"
  ];

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const menus = await getMenu();
        const visibles = menus.filter(
          (item) => item.visible === true && item.disponible === true
        );

        // Dashboard primero
        const ordenados = visibles.sort((a, b) => {
  if (a.nombre === "Menu") return -1;
  if (b.nombre === "Menu") return 1;

  const nombreA = a.nombre.toLowerCase();
  const nombreB = b.nombre.toLowerCase();

  if (nombreA === "configuración" || nombreA === "configuracion") return 1;
  if (nombreB === "configuración" || nombreB === "configuracion") return -1;

  return 0;
});


        setMenuItems(ordenados);
      } catch (error) {
        console.error("Error al obtener el menú:", error);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  return (
    <nav className="sidebar-menu" style={{ paddingTop: "2rem" }}>
      <ul>
        {loading && <li>Cargando menú...</li>}
        {!loading && menuItems.length === 0 && (
          <li className="text-red-500 px-4 py-2">No hay elementos de menú</li>
        )}
        {!loading &&
          menuItems
            .filter(({ formulario }) => {
              if (!formulario) return true;
              return !ocultarFormularios.includes(formulario.toLowerCase());
            })
            .map(({ id, nombre, formulario, icono }) => {
              const iconKey = icono?.toLowerCase();
              const IconComponent = iconMap[iconKey] || null;
              const route = formulario?.replace("Frm", "").toLowerCase();
              if (!route || !nombre) return null;

              const routePath = `/dashboard/${route}`;
              const isActive = !!matchPath(
                { path: routePath, end: false },
                location.pathname
              );

              return (
                <li
                  key={id}
                  className={`nav-item ${isActive ? "hovered" : ""}`}
                  onMouseEnter={(e) => e.currentTarget.classList.add("hovered")}
                  onMouseLeave={(e) => e.currentTarget.classList.remove("hovered")}
                >
                  <button
                    className="menu-button flex items-center gap-2 px-4 py-2 transition rounded relative"
                    onClick={() => navigate(routePath)}
                    aria-label={`Ir a ${nombre}`}
                  >
                    {IconComponent && (
                      <IconComponent className="menu-icon w-5 h-5" />
                    )}
                    {isSidebarOpen && <span className="text-sm">{nombre}</span>}
                  </button>
                </li>
              );
            })}
      </ul>
    </nav>
  );
};

export default SidebarMenu; 
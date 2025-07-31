import { getMenu } from "../../services/menuService";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, Users, Repeat2, BookOpen, GraduationCap,
  ListChecks, FileText, Shield, Key, ToggleRight, FileCheck2,
} from "lucide-react";
import { useSelector } from "react-redux";

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
  toggleright: ToggleRight,
  "file-check2": FileCheck2,
};

const DashboardMenuCards = () => {
  const [menuItems, setMenuItems] = useState([]);
  const navigate = useNavigate();
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);

  useEffect(() => {
    const fetchMenu = async () => {
      const menus = await getMenu();
      const visibles = menus.filter((item) => item.visible && item.disponible);
      const ordenados = visibles.sort((a, b) => {
        if (a.nombre === "Dashboard") return -1;
        if (b.nombre === "Dashboard") return 1;
        return 0;
      });
      setMenuItems(ordenados);
    };
    fetchMenu();
  }, []);

 return (
 <>
  <style>{`
    .auto-fit-grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(3, 1fr);
    }
    @media (min-width: 1024px) {
      .auto-fit-grid {
        grid-template-columns: repeat(5, 1fr);
      }
    }
    .card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      cursor: pointer;
      transition: transform 0.2s ease;
      white-space: nowrap;
      border: 1px solid;
      user-select: none;

      
    }
    .card:hover, .card:focus-visible {
      transform: scale(1.05);
      z-index: 10;
      position: relative;
    }
    .card-text {
      font-weight: 600;
      font-size: 0.875rem;
      text-align: center;
    }
    @media (max-width: 767px) {
    .card {
    padding-top:0.1rem; /* baja el contenido en móvil */
  }  
 
    }
    .dark {
      background-color: #1e293b;
      color: #f9fafb;
      border-color: #475569;
    }
    .light {
      background-color: #fff;
      color: #111827;
      border-color: #d1d5db;
    }
  `}</style>

  <div className="w-full px-4 mt-4 auto-fit-grid">
    {menuItems.map(({ id, nombre, formulario, icono }) => {
      const Icon = iconMap[icono?.toLowerCase()] || null;
      const ruta = formulario?.replace("Frm", "").toLowerCase();
      if (!ruta) return null;

      return (
        <div
          key={id}
          onClick={() => navigate(`/dashboard/${ruta}`)}

          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter") navigate(`dashboard/${ruta}`); }}
          aria-label={nombre}
          title={nombre}
          className={`card ${modoOscuro ? "dark" : "light"}`}
        >
          {Icon && (
            <Icon
              className={`w-8 h-8 ${modoOscuro ? "text-teal-300" : "text-blue-600"}`}
              aria-hidden="true"
            />
          )}
          <span className="card-text">{nombre}</span>
        </div>
      );
    })}
  </div>
</>

  );
};

export default DashboardMenuCards;

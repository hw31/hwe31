import { getMenu } from "../../services/menuService";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  University,
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
  university: University,
};

const EXCLUIDOS = [
  "configuracion",
  "catalogo",
  "menu",
  "estados",
  "inscripcionesxmateria",
  "permiso",
  "roles",
  "rescate",
  "tipocalificacion",
  "transacciones",  // <-- aquí lo agregas
];


const DashboardMenuCards = () => {
  const [menuItems, setMenuItems] = useState([]);
  const navigate = useNavigate();
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);

  useEffect(() => {
    const fetchMenu = async () => {
      const menus = await getMenu();
      const visibles = menus.filter((item) => item.visible && item.disponible);
      const ordenados = visibles.sort((a, b) => {
        if (a.nombre === "Menu") return -1;
        if (b.nombre === "Menu") return 1;
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
    grid-template-columns: repeat(6, 1fr);
    gap: 0.5rem 1rem;
    white-space: nowrap;
    max-width: 1000px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 10rem;
    padding-right: 1rem;
  }

@media (max-width: 767px) {
  .auto-fit-grid {
    padding-left: 0; /* Quita margen izquierdo */
    padding-right: 0; /* Quita margen derecho */
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    justify-items: center; /* Centra las cards */
    gap: 0.5rem;
  }
  .card {
    padding-top: 1rem;
    width: 100%; /* Ocupa todo el espacio posible */
    max-width: 120px; /* Máximo ancho de cada card */
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
  .card:hover,
  .card:focus-visible {
    transform: scale(1.05);
    z-index: 10;
    position: relative;
  }
  .card-text {
    font-weight: 600;
    font-size: 0.875rem;
    text-align: center;
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


     <div className="w-full px-4 auto-fit-grid">

        {menuItems
          .filter(({ nombre, formulario }) => {
            const nombreNorm = (nombre || "").toLowerCase().replace(/\s+/g, "");
            const formularioNorm = (formulario || "").toLowerCase().replace(/\s+/g, "");

            const esExcluido = EXCLUIDOS.some(
              (excluido) => nombreNorm.includes(excluido) || formularioNorm.includes(excluido)
            );

            return !esExcluido;
          })
          .map(({ id, nombre, formulario, icono }) => {
            const Icon = iconMap[icono?.toLowerCase()] || null;
            const ruta = formulario?.replace("Frm", "").toLowerCase();
            if (!ruta) return null;

            return (
              <div
                key={id}
                onClick={() => navigate(`/dashboard/${ruta}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") navigate(`/dashboard/${ruta}`);
                }}
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


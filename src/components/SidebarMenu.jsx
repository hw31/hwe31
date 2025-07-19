import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, Users, Flag, List, User, Phone, Shield, Key,
  Calendar, Book, Edit, Award, MapPin, Clock, Clipboard,
  Percent, Activity, Settings,
} from "lucide-react";

import { getMenu } from "../services/menuService";
import config from "../config";

const iconMap = {
  home: Home,
  users: Users,
  flag: Flag,
  list: List,
  user: User,
  phone: Phone,
  shield: Shield,
  key: Key,
  calendar: Calendar,
  book: Book,
  edit: Edit,
  award: Award,
  "map-pin": MapPin,
  clock: Clock,
  clipboard: Clipboard,
  percent: Percent,
  activity: Activity,
  settings: Settings,
};

const menuDemo = [
  {
    id: 1,
    nombre: "Inicio",
    formulario: "FrmInicio",
    icono: "home",
    visible: 1,
    activo: 1,
  },
  {
    id: 2,
    nombre: "Usuarios",
    formulario: "FrmUsuarios",
    icono: "users",
    visible: 1,
    activo: 1,
  },
];

const SidebarMenu = () => {
  const [menuItems, setMenuItems] = useState(config.MODO_MOCK ? menuDemo : []);
  const [loading, setLoading] = useState(!config.MODO_MOCK);
  const navigate = useNavigate();

  useEffect(() => {
  if (!config.MODO_MOCK) {
    const fetchMenu = async () => {
      try {
        const menus = await getMenu();
        console.log("Menús recibidos:", menus);
        const visibles = menus.filter(item => item.visible === true && item.disponible === true);
        console.log("Menús visibles y disponibles:", visibles);
        setMenuItems(visibles);
      } catch (error) {
        console.error("Error al obtener el menú:", error);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }
}, []);

  return (
    <nav className="sidebar-menu">
      <ul>
        {loading && <li>Cargando menú...</li>}

        {!loading && menuItems.length === 0 && (
          <li className="text-red-500 px-4 py-2">No hay elementos de menú esta malo </li>
        )}

        {!loading &&
          menuItems.map(({ id, nombre, formulario, icono }) => {
            const IconComponent = iconMap[icono?.toLowerCase()] || null;
            const route = formulario?.replace("Frm", "").toLowerCase();

            if (!route || !nombre) return null;

            return (
              <li key={id}>
                <button
                  className="menu-button flex items-center gap-2 px-4 py-2 hover:bg-gray-200 rounded transition"
                  onClick={() => navigate(`/${route}`)}
                  aria-label={`Ir a ${nombre}`}
                >
                  {IconComponent && <IconComponent className="menu-icon w-5 h-5" />}
                  <span className="text-sm">{nombre}</span>
                </button>
              </li>
            );
          })}
      </ul>
    </nav>
  );
};

export default SidebarMenu;
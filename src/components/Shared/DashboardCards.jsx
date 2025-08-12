import { motion } from "framer-motion";
import CardUsuariosKPI from "./CardUsuariosKPI";
import CardInscripcionesConfirmadas from "./CardInscripcionesConfirmadas";
import CardTercera from "./CardTransacciones";

const DashboardCards = ({ modoOscuro }) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`flex items-start justify-start min-h-screen transition-colors duration-300 
      `}
      style={{ height: "100vh", width: "100vw", padding: "1rem" }}
    >
      <div
        className="grid w-full gap-6"
        style={{
          gridTemplateColumns: "4fr 3fr", // más ancho para transacciones
          height: "100%",
          maxWidth: "none",
          width: "90%", // más ancho el contenedor general
          margin: "0 auto",
        }}
      >
        {/* Transacciones */}
        <motion.div
          variants={itemVariants}
          style={{ height: "100%", width: "100%" }}
      
        >
          <CardTercera modoOscuro={modoOscuro} style={{ height: "100%", width: "100%" }} />
        </motion.div>

        {/* Columna derecha con 2 cards apiladas */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col gap-"
          style={{ height: "100%", width: "100%" }}
        >
          <div className="mb-4 overflow-auto" style={{ maxHeight: "50%" }}>
            <CardUsuariosKPI modoOscuro={modoOscuro} style={{ width: "100%", maxWidth: "100%" }} />
          </div>
          <div className="overflow-auto" style={{ maxHeight: "50%" }}>
            <CardInscripcionesConfirmadas modoOscuro={modoOscuro} style={{ width: "100%", maxWidth: "100%" }} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardCards;

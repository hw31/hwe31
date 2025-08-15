import { motion } from "framer-motion";
import CardUsuariosKPI from "./CardUsuariosKPI";
import CardInscripcionesConfirmadas from "./CardInscripcionesConfirmadas";
import CardTercera from "./CardTransacciones";

const DashboardCards = ({ modoOscuro, esSecretario }) => {
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
      className="flex flex-col items-start justify-start transition-colors duration-300 w-full p-4"
    >
      <div
        className={`grid w-full gap-6 ${
          esSecretario ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-[4fr_3fr]"
        }`}
      >
        {esSecretario ? (
          <>
            <motion.div variants={itemVariants}>
              <CardUsuariosKPI modoOscuro={modoOscuro} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardInscripcionesConfirmadas modoOscuro={modoOscuro} />
            </motion.div>
          </>
        ) : (
          <>
            <motion.div variants={itemVariants}>
              <CardTercera modoOscuro={modoOscuro} />
            </motion.div>
            <motion.div variants={itemVariants} className="flex flex-col gap-4">
              <CardUsuariosKPI modoOscuro={modoOscuro} />
              <CardInscripcionesConfirmadas modoOscuro={modoOscuro} />
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default DashboardCards;

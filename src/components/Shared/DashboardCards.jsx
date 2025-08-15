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
      className="flex flex-col md:flex-row items-start justify-start transition-colors duration-300"
      style={{ width: "100%", padding: "1rem" }}
    >
      <div className="grid w-full gap-6" style={{ width: "100%" }}>
  {/* Desktop */}
<div
  className="hidden md:grid md:gap-6"
  style={{
    gridTemplateColumns: esSecretario ? "1fr 1fr" : "4fr 3fr",
  }}
>
  {!esSecretario && (
    <motion.div variants={itemVariants}>
      <CardTercera modoOscuro={modoOscuro} />
    </motion.div>
  )}

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
    <motion.div variants={itemVariants} className="flex flex-col gap-4">
      <CardUsuariosKPI modoOscuro={modoOscuro} />
      <CardInscripcionesConfirmadas modoOscuro={modoOscuro} />
    </motion.div>
  )}
</div>
      </div>
    </motion.div>
  );
};

export default DashboardCards;


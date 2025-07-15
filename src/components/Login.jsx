import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import loginService from "../services/authService";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../features/auth/authSlice";

const fadeVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ usuario: "", contrasena: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Si ya está autenticado, redirige automáticamente
  const token = useSelector((state) => state.auth.token);
  const idSesion = useSelector((state) => state.auth.idSesion);

  if (token && idSesion) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.usuario || !form.contrasena) {
      alert("Por favor completa todos los campos.");
      return;
    }

    try {
      setLoading(true);
      const data = await loginService.login(form.usuario, form.contrasena);

      if (data.success) {
        dispatch(
          loginSuccess({
            usuario: data.usuario,
            token: data.token,
            id_sesion: data.id_sesion,
            persona: data.persona,
          })
        );

        setSuccess(true);

        // Esperar y luego redirigir
        setTimeout(() => {
          navigate("/dashboard");
        }, 2500);
      } else {
        alert(data.mensaje || "Usuario o contraseña incorrectos.");
      }
    } catch (error) {
      alert(error.message || "No se pudo conectar al servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Animación de "BIENVENIDO"
  if (success) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
        <img
          src="/images/robothola.gif"
          alt="Bienvenido"
          className="w-64 h-64 mb-6"
        />
        <motion.h1
          className="text-5xl font-bold text-purple-700"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          BIENVENIDO!
        </motion.h1>
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col justify-center min-h-[400px]"
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-2xl"
        variants={fadeVariants}
        custom={1}
      >
        <motion.h2
          className="text-2xl font-bold mb-6 text-center text-purple-700"
          variants={fadeVariants}
          custom={2}
        >
          Iniciar sesión
        </motion.h2>

        <motion.form onSubmit={handleSubmit} variants={fadeVariants} custom={3}>
          <div className="mb-5 relative">
            <img
              src="/images/user.gif"
              alt="User icon"
              className="w-6 h-6 absolute top-3 left-3 pointer-events-none"
            />
            <input
              type="text"
              name="usuario"
              placeholder="Usuario"
              value={form.usuario}
              onChange={handleChange}
              className="w-full pl-12 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
              autoFocus
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="mb-6 relative">
            <img
              src="/images/password.gif"
              alt="Password icon"
              className="w-6 h-6 absolute top-3 left-3 pointer-events-none"
            />
            <input
              type="password"
              name="contrasena"
              placeholder="Contraseña"
              value={form.contrasena}
              onChange={handleChange}
              className="w-full pl-12 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-full shadow-lg transition duration-300 font-semibold text-lg ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </motion.form>
      </motion.div>
    </motion.div>
  );
};

export default Login;
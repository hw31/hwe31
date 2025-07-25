import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import loginService from "../../services/authService";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../features/Auth/authSlice";
import { setModoOscuro, fetchModoOscuro } from "../../features/theme/themeSlice"; // <-- Importa fetchModoOscuro

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, when: "beforeChildren", staggerChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
};

const Form = () => {
  const [form, setForm] = useState({ usuario: "", contrasena: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.usuario || !form.contrasena) {
      alert("Por favor completa todos los campos.");
      return;
    }
    try {
      setLoading(true);
      const data = await loginService.login(form.usuario, form.contrasena);

      if (data.success) {
        dispatch(loginSuccess(data)); // Guarda usuario, token, idSesion, etc.
        setForm({ usuario: "", contrasena: "" });
        navigate("/dashboard");
      } else {
        alert(data.message || "Usuario o contraseña incorrectos.");
      }
    } catch (err) {
      alert(err.message || "Error al conectar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledWrapper>
      {/* Aquí va todo tu JSX que ya tienes */}
      <div className="main-container">
        <div className="main-content">
          <div className="logo-wrapper">
            <div className="logo-inner">
              <img src="/images/logo.png" alt="Logo" />
            </div>
          </div>

          <div className="container">
            <motion.form
              className="form"
              onSubmit={handleLogin}
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div className="form_front" variants={itemVariants}>
                <motion.div className="form_details" variants={itemVariants}>
                  Login
                </motion.div>

                <motion.input
                  type="text"
                  className="input"
                  name="usuario"
                  placeholder="Usuario"
                  value={form.usuario}
                  onChange={handleChange}
                  autoComplete="username"
                  disabled={loading}
                  variants={itemVariants}
                />

                <motion.input
                  type="password"
                  className="input"
                  name="contrasena"
                  placeholder="Contraseña"
                  value={form.contrasena}
                  onChange={handleChange}
                  autoComplete="current-password"
                  disabled={loading}
                  variants={itemVariants}
                />

                <motion.button
                  className="btn"
                  type="submit"
                  disabled={loading}
                  variants={itemVariants}
                >
                  {loading ? "Ingresando..." : "Ingresar"}
                </motion.button>
              </motion.div>
            </motion.form>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};


const StyledWrapper = styled.div`
  .main-container {
    min-height: 100vh;
    width: 100%;
    padding: 1.5rem 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(45deg, #3498db, #2ecc71);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
    overflow: auto;
  }
  .main-container::before {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.1) 1px,
        transparent 1px
      ),
      linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 20px 20px;
    pointer-events: none;
  }
  .main-content {
    position: relative;
    background: linear-gradient(135deg, #2c446e);
    border-radius: 1.5rem;
    box-shadow: 0 25px 50px -12px rgba(9, 56, 160, 0.5);
    padding: 2rem 1.25rem;
    width: 100%;
    max-width: 400px;
    box-sizing: border-box;
  }

  .logo-wrapper {
    right: auto;
    left: 23%;
    transform: translateX(-50%);
    position: absolute;
    top: -40px;
    background-color: #0938a0;
    border-radius: 9999px;
    width: 150px;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 25px 50px -12px rgba(1, 20, 60, 0.5);
    overflow: hidden;
    transform: translateX(25%);
    z-index: 10;
  }

  .logo-inner {
    background: white;
    border-radius: 9999px;
    width: 140px;
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .logo-inner img {
    width: 60%;
    height: 70%;
    object-fit: cover;
    transform: scale(1.1);
  }
  .container {
    display: flex;
    background: transparent;
    justify-content: center;
    align-items: center;
    height: auto;
    padding: 0.5rem;
    box-sizing: border-box;
    width: 100%;
    padding-top: 2rem;
  }

  .form {
    display: flex;
    justify-content: center;
    align-items: center;
    transform-style: preserve-3d;
    transition: all 1s ease;
    position: relative;
    width: 300px;
    height: 370px;
  }

  .form_front,
  .form_back {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
    padding: 1rem;
    position: absolute;
    backface-visibility: hidden;
    padding: 65px 45px;
    border-radius: 15px;
    background: #2c446e;
    box-shadow: inset 2px 2px 10px rgba(0, 0, 0, 1),
      inset -1px -1px 5px rgba(255, 255, 255, 0.6);
  }

  .form_back {
    transform: rotateY(-180deg);
  }

  .form_details {
    font-size: 25px;
    font-weight: 600;
    padding-bottom: 10px;
    color: white;
  }

  .input {
    width: 245px;
    min-height: 45px;
    color: #fff;
    outline: none;
    transition: 0.35s;
    padding: 0px 7px;
    background-color: #2c446e;
    border-radius: 6px;
    border: 2px solid #2c446e;
    box-shadow: 6px 6px 10px rgba(0, 0, 0, 1),
      1px 1px 10px rgba(255, 255, 255, 0.6);
  }

  .input::placeholder {
    color: #999;
  }

  .input:focus {
    transform: scale(1.05);
    box-shadow: 6px 6px 10px rgba(0, 0, 0, 1),
      1px 1px 10px rgba(255, 255, 255, 0.6), inset 2px 2px 10px rgba(0, 0, 0, 1),
      inset -1px -1px 5px rgba(255, 255, 255, 0.6);
  }

  .input:focus::placeholder {
    transition: 0.3s;
    opacity: 0;
  }

  .input:-webkit-autofill {
    background-color: #2c446e !important;
    -webkit-box-shadow: 0 0 0 1000px #2c446e inset,
      6px 6px 10px rgba(0, 0, 0, 1), 1px 1px 10px rgba(255, 255, 255, 0.6)
      !important;
    -webkit-text-fill-color: #fff !important;
    transition: background-color 5000s ease-in-out 0s;
  }

  .btn {
    padding: 10px 35px;
    cursor: pointer;
    background-color: #5a6d8c;
    border-radius: 6px;
    border: 2px solid #5a6d8c;
    box-shadow: 6px 6px 10px rgba(0, 0, 0, 1),
      1px 1px 10px rgba(255, 255, 255, 0.6);
    color: #fff;
    font-size: 15px;
    font-weight: bold;
    transition: 0.35s;
  }

  .btn:hover,
  .btn:focus {
    transform: scale(1.05);
    box-shadow: 6px 6px 10px rgba(0, 0, 0, 1),
      1px 1px 10px rgba(255, 255, 255, 0.6),
      inset 2px 2px 10px rgba(0, 0, 0, 1),
      inset -1px -1px 5px rgba(255, 255, 255, 0.6);
  }

`;

export default Form;
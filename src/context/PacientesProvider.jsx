import { createContext, useState, useEffect } from "react";
import clienteAxios from "../config/axios";
import useAuth from "../hooks/useAuth";

const PacientesContext = createContext();

export const PacientesProvider = ({ children }) => {
  const [pacientes, setPacientes] = useState([]);
  const [paciente, setPaciente] = useState({});
  const { auth } = useAuth();

  // Cargar pacientes desde la API
  useEffect(() => {
    const obtenerPacientes = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        };

        const { data } = await clienteAxios("/pacientes", config);
        setPacientes(data);
      } catch (error) {
        console.log(error);
      }
    };

    obtenerPacientes();
  }, [auth]);

  // Guardar o actualizar paciente
  const guardarPaciente = async (pacienteData) => {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      if (pacienteData._id) {
        // Editar paciente existente
        const { data } = await clienteAxios.put(
          `/pacientes/${pacienteData._id}`,
          pacienteData,
          config
        );
        setPacientes((prev) =>
          prev.map((p) => (p._id === data._id ? data : p))
        );
      } else {
        // Crear nuevo paciente
        const { data } = await clienteAxios.post("/pacientes", pacienteData, config);
        const pacienteAlmacenado = data.paciente || data; // Ajuste según respuesta de tu backend
        setPacientes((prev) => [pacienteAlmacenado, ...prev]);
      }
    } catch (error) {
      console.log(error.response?.data?.msg || error);
    }
  };

  // Seleccionar paciente para edición
  const setEdicion = (pacienteData) => {
    setPaciente(pacienteData);
  };

  // Eliminar paciente
  const eliminarPaciente = async (_id) => {
    const confirmar = confirm("¿Deseas eliminar este paciente?");
    if (!confirmar) return;

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      await clienteAxios.delete(`/pacientes/${_id}`, config);

      setPacientes((prev) => prev.filter((p) => p._id !== _id));
    } catch (error) {
      console.log(error.response?.data?.msg || error);
    }
  };

  return (
    <PacientesContext.Provider
      value={{
        pacientes,
        guardarPaciente,
        setEdicion,
        paciente,
        eliminarPaciente,
      }}
    >
      {children}
    </PacientesContext.Provider>
  );
};

export default PacientesContext;

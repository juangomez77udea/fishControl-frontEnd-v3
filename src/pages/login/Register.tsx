"use client"

import type React from "react"

import { useState } from "react"
import { RiMailLine, RiLockPasswordLine, RiEyeLine, RiEyeOffLine, RiUserLine, RiArrowLeftLine } from "react-icons/ri"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { api } from "../../api/api"
import { useAuthStore } from "../../store/useAuthStore"

// Tipo para el formulario de registro
type RegisterFormData = {
  name: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  roles: string[]
}

const Register = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    roles: ["USER"], // Por defecto, asignar rol de usuario
  })
  const [loading, setLoading] = useState<boolean>(false)

  const navigate = useNavigate()
  const isAdmin = useAuthStore((state) => state.hasRole("ROLE_ADMIN"))

  // Verificar si el usuario es administrador
  if (!isAdmin) {
    // Redirigir si no es administrador
    navigate("/insumos")
    toast.error("No tienes permisos para acceder a esta página", { theme: "dark" })
  }

  // Función para mostrar/ocultar la contraseña
  const handleShowPassword = (): void => {
    setShowPassword(!showPassword)
  }

  // Función para manejar cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    const { name, lastName, email, password, confirmPassword, roles } = formData

    // Validaciones
    if ([name, lastName, email, password, confirmPassword].includes("")) {
      toast.error("🤔 Todos los campos son obligatorios", { theme: "dark" })
      return
    }

    if (password.length < 6) {
      toast.error("⚠ El password debe contener al menos 6 caracteres", { theme: "dark" })
      return
    }

    if (password !== confirmPassword) {
      toast.error("Los passwords no coinciden", { theme: "dark" })
      return
    }

    try {
      setLoading(true)

      // Crear el objeto de usuario según el formato esperado por el backend
      const userData = {
        username: `${name.toLowerCase()}.${lastName.toLowerCase()}`, // Crear un username basado en nombre y apellido
        email,
        password,
        enabled: true,
        roles,
      }

      // Enviar la solicitud al backend
      const response = await api.post("/createUser", userData)

      if (response.status === 200) {
        toast.success("Usuario creado correctamente", { theme: "dark" })
        // Limpiar el formulario
        setFormData({
          name: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          roles: ["USER"],
        })
        // Opcional: redirigir a otra página
        // navigate("/insumos");
      }
    } catch (error: any) {
      console.error("Error al crear usuario:", error)

      // Manejar diferentes tipos de errores
      if (error.response) {
        // El servidor respondió con un código de error
        if (error.response.status === 401) {
          toast.error("No tienes permisos para crear usuarios", { theme: "dark" })
        } else if (error.response.status === 400 && error.response.data === "El usuario ya existe") {
          toast.error("El usuario ya existe", { theme: "dark" })
        } else {
          toast.error(error.response.data || "Error al crear el usuario", { theme: "dark" })
        }
      } else {
        toast.error("Error de conexión con el servidor", { theme: "dark" })
      }
    } finally {
      setLoading(false)
    }
  }

  // Función para cambiar el rol seleccionado
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setFormData({
      ...formData,
      roles: [e.target.value],
    })
  }

  return (
    <div className="bg-[url('/images/bg.jpg')] bg-cover bg-center bg-no-repeat min-h-screen w-full font-bold fixed top-0 left-0 flex items-center justify-center">
      <button
        onClick={() => navigate("/insumos")}
        className="absolute top-4 left-4 flex flex-col items-center justify-center p-2 rounded-md w-20 lg:w-24 h-14 lg:h-16 transition-colors bg-green-500 text-white hover:bg-green-600"
      >
        <RiArrowLeftLine className="text-xl" />
        <span className="text-xs">Regresar</span>
      </button>

      <div className="bg-white p-8 rounded-lg w-full md:w-[500px]">
        <div className="mb-10">
          <h1 className="text-3xl uppercase font-bold text-center">Registrar Usuario</h1>
        </div>
        <form className="flex flex-col gap-4 mb-6" onSubmit={handleSubmit}>
          <div className="relative">
            <RiUserLine className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              name="name"
              className="border border-gray-200 outline-none py-2 px-8 rounded-lg w-full"
              placeholder="Nombres"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="relative">
            <RiUserLine className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              name="lastName"
              className="border border-gray-200 outline-none py-2 px-8 rounded-lg w-full"
              placeholder="Apellidos"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
          <div className="relative">
            <RiMailLine className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="email"
              name="email"
              className="border border-gray-200 outline-none py-2 px-8 rounded-lg w-full"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="relative">
            <RiLockPasswordLine className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="border border-gray-200 outline-none py-2 px-8 rounded-lg w-full"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            {showPassword ? (
              <RiEyeOffLine
                onClick={handleShowPassword}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:cursor-pointer"
              />
            ) : (
              <RiEyeLine
                onClick={handleShowPassword}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:cursor-pointer"
              />
            )}
          </div>
          <div className="relative">
            <RiLockPasswordLine className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              className="border border-gray-200 outline-none py-2 px-8 rounded-lg w-full"
              placeholder="Confirmar Password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {showPassword ? (
              <RiEyeOffLine
                onClick={handleShowPassword}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:cursor-pointer"
              />
            ) : (
              <RiEyeLine
                onClick={handleShowPassword}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:cursor-pointer"
              />
            )}
          </div>
          <div className="relative">
            <label className="block text-gray-700 text-sm font-bold mb-2">Rol del Usuario</label>
            <select
              className="border border-gray-200 outline-none py-2 px-4 rounded-lg w-full"
              value={formData.roles[0]}
              onChange={handleRoleChange}
            >
              <option value="USER">Usuario</option>
              <option value="ADMIN">Administrador</option>
              <option value="GUEST">Invitado</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`bg-sky-300 text-gray-800 w-full py-2 px-6 rounded-4xl mt-6 hover:bg-green-300 transition-all ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? "Creando Usuario..." : "Crear Cuenta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register


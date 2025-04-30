import type React from "react"

import { useState } from "react"
import { RiMailLine, RiLockPasswordLine, RiEyeLine, RiEyeOffLine } from "react-icons/ri"
import { toast } from "react-toastify"
import {  useNavigate } from "react-router-dom"
import { login } from "../../api/api"
import { useAuthStore } from "../../store/useAuthStore"
import type { UserRole } from "../../types/Auth"

const Login = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const navigate = useNavigate()

  // Usar el store de autenticación
  const setUser = useAuthStore((state) => state.setUser)

  // Función para mostrar/ocultar la contraseña
  const handleShowPassword = (): void => {
    setShowPassword(!showPassword)
  }

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    if (!username || !password) {
      toast.error("🥸 Todos los campos son obligatorios", { theme: "dark" })
      return
    }

    if (password.length < 6) {
      toast.error("El password debe contener al menos 6 caracteres", { theme: "dark" })
      return
    }

    try {
      // Llama a la función de login y espera la respuesta
      const response = await login(username, password)

      // Verifica si la respuesta contiene un token
      if (response && response.token) {
        // Guardar el token en localStorage
        localStorage.setItem("token", response.token)

        // Convertir los roles a UserRole[] y guardar la información del usuario en el store
        const userRoles = response.roles?.map((role: string) => role as UserRole) || []

        setUser({
          username: response.username,
          roles: userRoles,
          token: response.token,
          refreshToken: response.refreshToken,
        })

        toast.success("Inicio de sesión exitoso", { theme: "dark" })
        navigate("/insumos")
      } else {
        toast.error("Credenciales inválidas", { theme: "dark" })
      }
    } catch (error) {
      console.error("Error en login:", error)
      toast.error("Error en la autenticación", { theme: "dark" })
    }
  }

  return (
    <div className="bg-[url('/images/bg.jpg')] bg-cover bg-center bg-no-repeat min-h-screen w-full fixed top-0 left-0 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg w-full md:w-96 shadow-lg">
        <div className="mb-10 flex items-center justify-center gap-4">
          <img src="/images/logo1.png" alt="Logo" className="h-20 w-auto object-contain" />
          <h1 className="text-2xl uppercase font-bold text-center">Login</h1>
        </div>
        <form className="flex flex-col gap-4 mb-6" onSubmit={handleSubmit}>
          <div className="relative">
            <RiMailLine className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              className="border border-gray-200 outline-none py-2 px-8 rounded-lg w-full"
              placeholder="Usuario"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            />
          </div>
          <div className="relative">
            <RiLockPasswordLine className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type={showPassword ? "text" : "password"}
              className="border border-gray-200 outline-none py-2 px-8 rounded-lg w-full"
              placeholder="Password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
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
          <div className="text-right">
            {/* <Link
              className="text-gray-500 text-xs hover:text-sky-600 hover:underline transition-all"
              to="forget-password"
            >
              ¿Olvidaste tu password?
            </Link> */}
          </div>
          <div>
            <button className="bg-sky-300 text-gray-700 w-full py-2 px-6 rounded-4xl mt-6 hover:bg-green-300 transition-all">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login


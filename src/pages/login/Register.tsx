import { useState } from "react";
import { RiMailLine, RiLockPasswordLine, RiEyeLine, RiEyeOffLine, RiUserLine, RiArrowLeftLine } from "react-icons/ri";
import {useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Register = () => {
    
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [name, setName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const navigate = useNavigate();

    // Función para mostrar/ocultar la contraseña
    const handleShowPassword = (): void => {
        setShowPassword(!showPassword);
    };

    // Función para manejar el envío del formulario
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();

        if ([name, lastName, email, password, confirmPassword].includes("")) {
            toast.error("🤔 Todos los campos son obligatorios", { theme: "dark" });
            return;
        }

        if (password.length < 6) {
            toast.error("⚠ El password debe contener al menos 6 caracteres", { theme: "dark" });
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Los password no coinciden", { theme: "dark" });
            return;
        }

        // console.log("Pasan las validaciones", { name, lastName, email, password });
    };

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
                    <h1 className="text-3xl uppercase font-bold text-center">Registrarse</h1>
                </div>
                <form className="flex flex-col gap-4 mb-6" onSubmit={handleSubmit}>
                    <div className="relative">
                        <RiUserLine className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            className="border border-gray-200 outline-none py-2 px-8 rounded-lg w-full"
                            placeholder="Nombres"
                            value={name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <RiUserLine className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            className="border border-gray-200 outline-none py-2 px-8 rounded-lg w-full"
                            placeholder="Apellidos"
                            value={lastName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <RiMailLine className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="email"
                            className="border border-gray-200 outline-none py-2 px-8 rounded-lg w-full"
                            placeholder="Email"
                            value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
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
                    <div className="relative">
                        <RiLockPasswordLine className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type={showPassword ? "text" : "password"}
                            className="border border-gray-200 outline-none py-2 px-8 rounded-lg w-full"
                            placeholder="Confirmar Password"
                            value={confirmPassword}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
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
                    <div>
                        <button className="bg-sky-300 text-gray-800 w-full py-2 px-6 rounded-4xl mt-6 hover:bg-green-300 transition-all">
                            Crear Cuenta
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
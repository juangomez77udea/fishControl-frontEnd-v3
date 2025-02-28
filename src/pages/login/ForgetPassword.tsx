import { useState } from "react";
import { RiMailLine } from "react-icons/ri";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const ForgetPassword = () => {
    // Estado con tipo explícito
    const [email, setEmail] = useState<string>("");

    // Función para manejar el envío del formulario
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();

        if ([email].includes("")) {
            toast.error("🥸 El email es obligatorio", { theme: "dark" });
            return;
        }

        // Verificar que el email exista en base de datos
        // Enviar email de recuperación de contraseña
        console.log("Funcionalidad de recuperar password");
    };

    return (
        <div className="w-full p-8 bg-white rounded-lg opacity-50 md:w-96">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-center uppercase">Recuperar Contraseña</h1>
            </div>
            <form className="flex flex-col gap-4 mb-6" onSubmit={handleSubmit}>
                <div className="relative">
                    <RiMailLine className="absolute text-gray-500 -translate-y-1/2 left-2 top-1/2" />
                    <input
                        type="email"
                        className="w-full px-8 py-2 border border-gray-200 rounded-lg outline-none"
                        placeholder="Email"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <button className="w-full px-6 py-2 mt-6 text-gray-800 transition-all bg-sky-300 rounded-4xl hover:bg-green-300">
                        Enviar Instrucciones
                    </button>
                </div>
            </form>
            <div className="flex flex-col justify-between gap-4 text-center sm:flex-row">
                <div>
                    <span>¿Ya tienes una cuenta?{" "}</span>
                    <Link to="/" className="font-medium transition-all text-sky-600 hover:underline">
                        Ingresa
                    </Link>
                </div>
                <div className="text-right">
                    ¿No tienes una cuenta?{" "}
                    <Link to="/register" className="font-medium transition-all text-sky-600 hover:underline">
                        Regístrate
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgetPassword;
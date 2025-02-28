import { useState, FormEvent, ChangeEvent, JSX } from 'react';
import { RiLockPasswordLine, RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';

const ChangePassword = (): JSX.Element => {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");

    const { token } = useParams<{ token: string }>();

    const navigate = useNavigate();

    if (token !== "123456789") {
        navigate("/");
    }

    const handleShowPassword = (): void => {
        setShowPassword(!showPassword);
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();

        if ([password, confirmPassword].includes("")) {
            toast.error("🥸 Todos los campos son obligatorios", { theme: "dark" });
        }
        if (password.length < 6) {
            toast.error("El password debe contener al menos 6 caracteres", { theme: "dark" });
        } else {
            console.log("Pasan las validaciones");
        }
    }

    return (
        <div className='bg-white p-8 rounded-lg w-full md:w-96'>
            <div className='mb-10'>
                <h1 className='text-3xl uppercase font-bold text-center'>Actualizar Contraseña</h1>
            </div>
            <form className='flex flex-col gap-4 mb-6' onSubmit={handleSubmit}>
                <div className='relative'>
                    <RiLockPasswordLine className='absolute left-2 top-1/2 -translate-y-1/2 text-gray-500' />
                    <input
                        type={showPassword ? "text" : "password"}
                        className='border border-gray-200 outline-none py-2 px-8 rounded-lg w-full'
                        placeholder='Password'
                        value={password}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    />
                    {showPassword ? (
                        <RiEyeOffLine onClick={handleShowPassword} className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:cursor-pointer' />
                    ) : (
                        <RiEyeLine onClick={handleShowPassword} className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:cursor-pointer' />
                    )}
                </div>
                <div className='relative'>
                    <RiLockPasswordLine className='absolute left-2 top-1/2 -translate-y-1/2 text-gray-500' />
                    <input
                        type={showPassword ? "text" : "password"}
                        className='border border-gray-200 outline-none py-2 px-8 rounded-lg w-full'
                        placeholder='Confirmar Password'
                        value={confirmPassword}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                    />
                    {showPassword ? (
                        <RiEyeOffLine onClick={handleShowPassword} className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:cursor-pointer' />
                    ) : (
                        <RiEyeLine onClick={handleShowPassword} className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:cursor-pointer' />
                    )}
                </div>
                <div>
                    <button className='bg-sky-600 text-white w-full py-2 px-6 rounded-lg mt-6 hover:scale-105 transition-all'>
                        Restablecer contraseña
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ChangePassword;
// utils/passwordUtils.js
import bcrypt from "bcrypt";

// Genera hash con SAL incluida automáticamente
export const hashPassword = async (password) => {
    const saltRounds = 10;      // nivel de seguridad recomendado
    const hashed = await bcrypt.hash(password, saltRounds);
    return hashed;              // devuelve algo como "$2a$10$39dk392..."
};

// Compara contraseña ingresada vs hash guardado
export const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};